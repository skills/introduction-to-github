#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Time    : 2020/10/4 9:16
# @Author  : Huatao
# @Email   : 735820057@qq.com
# @File    : benchmark.py
# @Description :

import numpy as np
import torch
from torch import nn
from torch.utils.data import DataLoader

import train
from config import load_dataset_label_names
from models import fetch_classifier
from plot import plot_matrix
from statistic import stat_acc_f1, stat_results
from utils import get_device, handle_argv, IMUDataset, load_classifier_data_config, \
    FFTDataset, prepare_classifier_dataset, Preprocess4Normalization


def classify_benchmark(args, label_index, training_rate, label_rate, balance=True, method=None):
    data, labels, train_cfg, model_cfg, dataset_cfg = load_classifier_data_config(args)
    label_names, label_num = load_dataset_label_names(dataset_cfg, label_index)
    data_train, label_train, data_vali, label_vali, data_test, label_test \
        = prepare_classifier_dataset(data, labels, label_index=label_index, training_rate=training_rate
                                     , label_rate=label_rate, merge=model_cfg.seq_len
                                     , seed=train_cfg.seed, balance=balance)
    pipeline = [Preprocess4Normalization(model_cfg.input)]
    if method != 'deepsense':
        data_set_train = IMUDataset(data_train, label_train, pipeline=pipeline)
        data_set_test = IMUDataset(data_test, label_test, pipeline=pipeline)
        data_set_vali = IMUDataset(data_vali, label_vali, pipeline=pipeline)
    else:
        data_set_train = FFTDataset(data_train, label_train, pipeline=pipeline)
        data_set_test = FFTDataset(data_test, label_test, pipeline=pipeline)
        data_set_vali = FFTDataset(data_vali, label_vali, pipeline=pipeline)
    data_loader_train = DataLoader(data_set_train, shuffle=True, batch_size=train_cfg.batch_size)
    data_loader_test = DataLoader(data_set_test, shuffle=False, batch_size=train_cfg.batch_size)
    data_loader_vali = DataLoader(data_set_vali, shuffle=False, batch_size=train_cfg.batch_size)

    criterion = nn.CrossEntropyLoss()
    # criterion = FocalLoss()
    model = fetch_classifier(method, model_cfg, input=model_cfg.input, output=label_num)
    optimizer = torch.optim.Adam(params=model.parameters(), lr=train_cfg.lr)  # , weight_decay=0.95
    trainer = train.Trainer(train_cfg, model, optimizer, args.save_path, get_device(args.gpu))

    def func_loss(model, batch):
        inputs, label = batch
        logits = model(inputs, True)
        loss = criterion(logits, label)
        return loss

    def func_forward(model, batch):
        inputs, label = batch
        logits = model(inputs, False)
        return logits, label

    def func_evaluate(label, predicts):
        stat = stat_acc_f1(label.cpu().numpy(), predicts.cpu().numpy())
        return stat

    trainer.train(func_loss, func_forward, func_evaluate, data_loader_train, data_loader_test, data_loader_vali)
    label_estimate_test = trainer.run(func_forward, None, data_loader_test)
    return label_test, label_estimate_test


if __name__ == "__main__":
    train_rate = 0.8
    balance = True
    label_rate = 0.01
    method = "gru"

    args = handle_argv('bench_' + method, 'train.json', method)
    label_test, label_estimate_test = classify_benchmark(args, args.label_index, train_rate, label_rate, balance=balance, method=method)

    label_names, label_num = load_dataset_label_names(args.dataset_cfg, args.label_index)
    acc, matrix, f1 = stat_results(label_test, label_estimate_test)
    matrix_norm = plot_matrix(matrix, label_names)

