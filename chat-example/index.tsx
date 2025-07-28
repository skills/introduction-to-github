/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {GoogleGenAI} from '@google/genai';
import * as marked from 'marked';

async function debug(...args: string[]) {
  const turn = document.createElement('div');
  const promises = args.map(async (arg) => await marked.parse(arg ?? ''));
  const strings = await Promise.all(promises);
  turn.innerHTML = strings.join('');
  document.body.append(turn);
}

async function createChat() {
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

  const chat = ai.chats.create({model: 'gemini-2.5-flash'});

  const response = await chat.sendMessage({message: 'Why is the sky blue?'});
  debug('chat response 1: ', response.text);
  const response2 = await chat.sendMessage({message: 'Why is the sunset red?'});
  debug('chat response 2: ', response2.text);

  const history = chat.getHistory();
  for (const content of history) {
    debug('chat history: ', JSON.stringify(content, null, 2));
  }
}

async function createChatStream() {
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
  const chat = ai.chats.create({model: 'gemini-2.5-flash'});
  const response = await chat.sendMessageStream({
    message: 'Why is the sky blue?',
  });
  for await (const chunk of response) {
    debug('chat response 1 chunk: ', chunk.text);
  }
  const response2 = await chat.sendMessageStream({
    message: 'Why is the sunset red?',
  });
  for await (const chunk of response2) {
    debug('chat response 2 chunk: ', chunk.text);
  }
  const history = chat.getHistory();
  for (const content of history) {
    debug('chat history: ', JSON.stringify(content, null, 2));
  }
}

async function main() {
  await createChat().catch((e) => console.error('got error', e));
  await createChatStream().catch((e) => console.error('got error', e));
}

main();