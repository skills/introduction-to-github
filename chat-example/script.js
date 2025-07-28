
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from "preact";
import { useState, useMemo, useCallback, useEffect } from "preact/hooks";
import { html } from "htm/preact";

const STORAGE_KEY = 'grs_invoices';

// Base64 encoded QR code for GRS
const QR_CODE_BASE64 = 'data:image/png;base64,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';

// Reusable hook for managing invoice state
const useInvoiceState = (docType) => {
  const [billNo, setBillNo] = useState(`GRS-${Date.now().toString().slice(-6)}`);
  const [customerName, setCustomerName] = useState("Ravi");
  const [items, setItems] = useState([
    { id: 1, name: "", weight: 0, rate: 0, vaPercent: 0, makingCharge: 0 },
  ]);
  const [nextId, setNextId] = useState(2);
  const gstRate = 1.5;

  const handleAddItem = useCallback(() => {
    setItems([
      ...items,
      { id: nextId, name: "", weight: 0, rate: 0, vaPercent: 0, makingCharge: 0 },
    ]);
    setNextId(nextId + 1);
  }, [items, nextId]);

  const handleRemoveItem = useCallback((id) => {
    setItems(items.filter((item) => item.id !== id));
  }, [items]);

  const handleItemChange = useCallback((id, field, value) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "name" ? value : parseFloat(value) || 0,
            }
          : item
      )
    );
  }, [items]);
  
  const calculations = useMemo(() => {
    const calculatedItems = items.map(item => {
        const vaInGrams = (item.weight * item.vaPercent) / 100;
        const totalWeight = item.weight + vaInGrams;
        const amount = (totalWeight * item.rate) + item.makingCharge;
        return { ...item, totalWeight, amount };
    });
    
    const subtotal = calculatedItems.reduce((sum, item) => sum + item.amount, 0);
    const sgst = subtotal * (gstRate / 100);
    const cgst = subtotal * (gstRate / 100);
    const grandTotal = subtotal + sgst + cgst;
    
    return { calculatedItems, subtotal, sgst, cgst, grandTotal };
  }, [items, gstRate]);
  
  return {
      billNo, setBillNo,
      customerName, setCustomerName,
      items, setItems,
      handleAddItem, handleRemoveItem, handleItemChange,
      calculations,
      gstRate
  };
};

const InvoiceForm = ({ docType, invoice, children }) => {
    const {
        billNo, setBillNo,
        customerName, setCustomerName,
        items, handleAddItem, handleRemoveItem, handleItemChange,
        calculations,
        gstRate
    } = invoice;
    const { calculatedItems, subtotal, sgst, cgst, grandTotal } = calculations;

    return html`
      <header>
        <h1>GRS Gold House - ${docType}</h1>
      </header>
      
      <div class="meta-details">
          <div class="form-group">
              <label for="billNo">${docType} No.</label>
              <input type="text" id="billNo" value=${billNo} onInput=${(e) => setBillNo(e.currentTarget.value)} />
          </div>
          <div class="form-group">
              <label for="customerName">Customer Name</label>
              <input type="text" id="customerName" value=${customerName} onInput=${(e) => setCustomerName(e.currentTarget.value)} placeholder="Enter customer name" />
          </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th class="col-name">Item Name</th>
            <th class="col-small">Weight (g)</th>
            <th class="col-small">VA (%)</th>
            <th class="col-small">Rate</th>
            <th class="col-small">Making Charge</th>
            <th class="col-amount">Amount</th>
            <th class="col-actions"></th>
          </tr>
        </thead>
        <tbody>
          ${calculatedItems.map((item) => html`
            <tr key=${item.id}>
              <td><input type="text" value=${item.name} onInput=${(e) => handleItemChange(item.id, "name", e.currentTarget.value)} placeholder="Item Name"/></td>
              <td><input type="text" inputmode="decimal" value=${item.weight} onInput=${(e) => handleItemChange(item.id, "weight", e.currentTarget.value)} placeholder="e.g. 89.65" /></td>
              <td><input type="text" inputmode="decimal" value=${item.vaPercent} onInput=${(e) => handleItemChange(item.id, "vaPercent", e.currentTarget.value)} /></td>
              <td><input type="text" inputmode="decimal" value=${item.rate} onInput=${(e) => handleItemChange(item.id, "rate", e.currentTarget.value)} /></td>
              <td><input type="text" inputmode="decimal" value=${item.makingCharge} onInput=${(e) => handleItemChange(item.id, "makingCharge", e.currentTarget.value)} /></td>
              <td class="col-amount">${item.amount.toFixed(2)}</td>
              <td class="actions"><button class="btn btn-danger" onClick=${() => handleRemoveItem(item.id)} aria-label="Remove item">X</button></td>
            </tr>
          `)}
        </tbody>
      </table>
      <button class="btn btn-secondary" onClick=${handleAddItem}>+ Add Item</button>

      <div class="totals-summary">
        <table>
          <tbody>
            <tr><td class="label">Subtotal</td><td class="value">${subtotal.toFixed(2)}</td></tr>
            <tr><td class="label">SGST (${gstRate}%)</td><td class="value">${sgst.toFixed(2)}</td></tr>
            <tr><td class="label">CGST (${gstRate}%)</td><td class="value">${cgst.toFixed(2)}</td></tr>
            <tr class="grand-total"><td class="label">Grand Total</td><td class="value">${grandTotal.toFixed(2)}</td></tr>
            <tr class="grand-total"><td class="label">Rounded Total</td><td class="value">${Math.round(grandTotal).toFixed(2)}</td></tr>
          </tbody>
        </table>
      </div>

      <div class="app-actions">
        ${children}
      </div>
    `;
};


const EstimatePage = ({ saveAndPrint }) => {
    const invoice = useInvoiceState('Estimate');
    
    const handlePrintEstimate = () => {
        saveAndPrint(invoice, 'thermal');
    };
    
    return html`<${InvoiceForm} docType="Estimate" invoice=${invoice}>
        <button class="btn btn-primary" onClick=${handlePrintEstimate}>Print Estimate</button>
    <//>`;
};

const BillPage = ({ saveAndPrint }) => {
    const invoice = useInvoiceState('Bill');

    const handlePrint = (format) => {
        saveAndPrint(invoice, format);
    };

    return html`<${InvoiceForm} docType="Bill" invoice=${invoice}>
        <button class="btn btn-secondary" onClick=${() => handlePrint('thermal')}>Print Thermal Receipt</button>
        <button class="btn btn-primary" onClick=${() => handlePrint('a4')}>Print A4 Bill</button>
    <//>`;
};

const HistoryPage = ({ invoices, onReprint, onDelete }) => {
    if (!invoices || invoices.length === 0) {
        return html`<div class="no-history">No saved bills or estimates found.</div>`;
    }
    
    return html`
        <header><h1>History</h1></header>
        <ul class="history-list">
            ${invoices.sort((a,b) => b.timestamp - a.timestamp).map(inv => html`
                <li class="history-item" key=${inv.billNo}>
                    <div class="history-item-info">
                        <p class="bill-no">${inv.docType}: ${inv.billNo}</p>
                        <p class="customer">To: ${inv.customerName} - ${new Date(inv.timestamp).toLocaleString('en-IN')}</p>
                        <p><strong>Total: ${Math.round(inv.grandTotal).toFixed(2)}</strong></p>
                    </div>
                    <div class="history-item-actions">
                        <button class="btn btn-secondary" onClick=${() => onReprint(inv)}>View</button>
                        <button class="btn btn-danger" onClick=${() => onDelete(inv.billNo)}>Delete</button>
                    </div>
                </li>
            `)}
        </ul>
    `;
};


const App = () => {
  const [page, setPage] = useState('Bill');
  const [invoices, setInvoices] = useState([]);
  const [billToPrint, setBillToPrint] = useState(null);

  const loadInvoices = useCallback(() => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const allInvoices = stored ? JSON.parse(stored) : [];
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        
        const validInvoices = allInvoices.filter(inv => {
            if (inv.docType === 'Estimate') {
                return inv.timestamp > oneDayAgo;
            }
            return true;
        });

        setInvoices(validInvoices);
        if(validInvoices.length !== allInvoices.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(validInvoices));
        }
    } catch (e) {
        console.error("Failed to load or parse invoices from localStorage", e);
        setInvoices([]);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);
  
  useEffect(() => {
      if (billToPrint) {
        const printContainer = document.getElementById('print-area');
        if (printContainer) {
            const Component = billToPrint.printFormat === 'a4' ? A4Bill : BillReceipt;
            const props = { ...billToPrint, items: billToPrint.items };
            render(html`<${Component} ...${props} />`, printContainer);
            window.print();
            render(null, printContainer);
        }
        setBillToPrint(null);
      }
  }, [billToPrint]);

  const saveAndPrint = (invoice, format) => {
    const dataToSave = {
        docType: page, // Use current page as docType
        billNo: invoice.billNo,
        customerName: invoice.customerName,
        items: invoice.calculations.calculatedItems,
        ...invoice.calculations,
        gstRate: invoice.gstRate,
        timestamp: Date.now(),
        printFormat: format
    };

    const currentInvoices = invoices.filter(inv => inv.billNo !== dataToSave.billNo);
    const updatedInvoices = [...currentInvoices, dataToSave];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices));
    setInvoices(updatedInvoices);

    setBillToPrint(dataToSave);
  };
  
  const onReprint = (invoiceData) => {
      setBillToPrint(invoiceData);
  };
  
  const onDelete = (billNo) => {
      if (confirm(`Are you sure you want to delete ${billNo}?`)) {
          const updatedInvoices = invoices.filter(inv => inv.billNo !== billNo);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices));
          setInvoices(updatedInvoices);
      }
  };


  return html`
    <div class="doc-type-switcher">
        <button class=${page === 'Estimate' ? 'active' : ''} onClick=${() => setPage('Estimate')}>Estimate</button>
        <button class=${page === 'Bill' ? 'active' : ''} onClick=${() => setPage('Bill')}>Bill</button>
        <button class=${page === 'History' ? 'active' : ''} onClick=${() => setPage('History')}>History</button>
    </div>
    
    ${page === 'Estimate' ? html`<${EstimatePage} saveAndPrint=${saveAndPrint} />` :
      page === 'Bill' ? html`<${BillPage} saveAndPrint=${saveAndPrint} />` :
      html`<${HistoryPage} invoices=${invoices} onReprint=${onReprint} onDelete=${onDelete} />`
    }
  `;
};

const BillReceipt = ({ docType, billNo, customerName, items, subtotal, sgst, cgst, grandTotal, gstRate }) => {
    const dateStr = new Date().toLocaleDateString('en-IN');
    return html`
    <div class="receipt">
        <div class="header">
          <h2>${docType.toUpperCase()}</h2>
          <h3>GRS Gold House</h3>
          <p>130, Thiruvoodal St, Pavazhakundur, Tiruvannamalai, Tamil Nadu 606601</p>
        </div>
        <hr />
        <div class="info">
            <p><strong>No:</strong> <span>${billNo}</span></p>
            <p><strong>Date:</strong> <span>${dateStr}</span></p>
            <p><strong>To:</strong> <span>${customerName || 'N/A'}</span></p>
        </div>
        <hr />
        <table>
          <thead>
            <tr><th>Item</th><th>Wt(g)</th><th>MC</th><th>Amt</th></tr>
          </thead>
          <tbody>
            ${items.filter(item => item.name || item.amount > 0).map(item => html`
                <tr>
                    <td>${item.name}</td>
                    <td>${item.totalWeight.toFixed(5)}</td>
                    <td>${item.makingCharge.toFixed(2)}</td>
                    <td>${item.amount.toFixed(2)}</td>
                </tr>
            `)}
          </tbody>
        </table>
        <hr />
        <div class="totals">
          <p><strong>Subtotal:</strong><span>${subtotal.toFixed(2)}</span></p>
          <p><strong>SGST (${gstRate}%):</strong><span>${sgst.toFixed(2)}</span></p>
          <p><strong>CGST (${gstRate}%):</strong><span>${cgst.toFixed(2)}</span></p>
          <hr />
          <p><strong>TOTAL:</strong><span>${grandTotal.toFixed(2)}</span></p>
          <p><strong>ROUNDED:</strong><span>${Math.round(grandTotal).toFixed(2)}</span></p>
        </div>
        <hr />
        <div class="footer">
          <img src="${QR_CODE_BASE64}" alt="GRS QR Code" class="qr-code" />
          <p>Thank You! Visit Again!</p>
        </div>
      </div>
    `;
};

const A4Bill = ({ docType, billNo, customerName, items, subtotal, sgst, cgst, grandTotal, gstRate }) => {
    const dateStr = new Date().toLocaleDateString('en-IN');
    return html`
    <div class="a4-page">
        <header class="a4-header">
            <div class="shop-details">
                <h1>GRS Gold House</h1>
                <p>130, Thiruvoodal St, Pavazhakundur</p>
                <p>Tiruvannamalai, Tamil Nadu 606601</p>
            </div>
            <div class="doc-title">
                <h2>${docType.toUpperCase()}</h2>
            </div>
        </header>

        <section class="a4-meta">
            <div class="bill-to">
                <strong>Bill To:</strong>
                <p>${customerName || 'N/A'}</p>
            </div>
            <div class="bill-details">
                <p><strong>${docType} No:</strong> ${billNo}</p>
                <p><strong>Date:</strong> ${dateStr}</p>
            </div>
        </section>

        <table class="a4-items-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Item Description</th>
                    <th>Weight (g)</th>
                    <th>VA (%)</th>
                    <th>Total Wt (g)</th>
                    <th>Rate</th>
                    <th>Making Charge</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${items.filter(item => item.name || item.amount > 0).map((item, index) => html`
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.name}</td>
                        <td>${item.weight.toFixed(5)}</td>
                        <td>${item.vaPercent.toFixed(2)}</td>
                        <td>${item.totalWeight.toFixed(5)}</td>
                        <td>${item.rate.toFixed(2)}</td>
                        <td>${item.makingCharge.toFixed(2)}</td>
                        <td>${item.amount.toFixed(2)}</td>
                    </tr>
                `)}
            </tbody>
        </table>

        <section class="a4-summary">
            <div class="notes">
                <strong>Notes:</strong>
                <p>Thank you for your business!</p>
            </div>
            <div class="a4-totals">
                <table>
                    <tr><td>Subtotal</td><td>${subtotal.toFixed(2)}</td></tr>
                    <tr><td>SGST @ ${gstRate}%</td><td>${sgst.toFixed(2)}</td></tr>
                    <tr><td>CGST @ ${gstRate}%</td><td>${cgst.toFixed(2)}</td></tr>
                    <tr class="grand-total"><td>Grand Total</td><td>${grandTotal.toFixed(2)}</td></tr>
                    <tr class="grand-total rounded"><td>Rounded Total</td><td>${Math.round(grandTotal).toFixed(2)}</td></tr>
                </table>
            </div>
        </section>

        <footer class="a4-footer">
            <img src="${QR_CODE_BASE64}" alt="GRS QR Code" class="qr-code-a4" />
            <p>This is a computer-generated invoice.</p>
        </footer>
    </div>
    `;
};

render(html`<${App} />`, document.getElementById("app"));
