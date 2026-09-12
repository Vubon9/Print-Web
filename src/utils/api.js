/**
 * Backend API Service Abstraction Layer for Press Ledger
 * 
 * Provides async REST/API functions for Jobs, Clients, Invoices, Payments, Inventory & General Ledger.
 * Currently backed by LocalStorage, fully structured for seamless transition to Express/Node.js or Python backend.
 */

import {
  loadAllAppData,
  saveStoredData,
  STORAGE_KEYS,
  clearAllAppData,
  DEFAULT_SETTINGS
} from './storage';

// Simulated API delay (ms) for realistic async behavior (set to 0 for instant local execution)
const API_DELAY = 0;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  // Fetch initial app data bundle from backend
  async loadAllData() {
    await delay(API_DELAY);
    return loadAllAppData();
  },

  // ----------------------------------------------------
  // JOB ORDERS API
  // ----------------------------------------------------
  async getJobs() {
    await delay(API_DELAY);
    const data = loadAllAppData();
    return data.jobs;
  },

  async createJob(jobPayload) {
    await delay(API_DELAY);
    const data = loadAllAppData();

    const jobId = `PL-${Date.now().toString().slice(-4)}`;
    const jobNo = `JOB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const createdDate = new Date().toISOString().split('T')[0];

    const totalCost = Number(jobPayload.totalCost) || 0;
    const advancePaid = Number(jobPayload.advancePaid) || 0;
    const dueAmount = Math.max(0, totalCost - advancePaid);

    const newJob = {
      id: jobId,
      jobNo: jobNo,
      title: jobPayload.title || 'Untitled Job',
      clientId: jobPayload.clientId,
      clientName: jobPayload.clientName,
      jobType: jobPayload.jobType || 'General Printing',
      paper: jobPayload.paper || 'Standard Paper',
      finishedSize: jobPayload.finishedSize || 'A4',
      pages: Number(jobPayload.pages) || 1,
      quantity: Number(jobPayload.quantity) || 1000,
      totalCost: totalCost,
      advancePaid: advancePaid,
      dueAmount: dueAmount,
      stage: jobPayload.stage || 'Pending', // Pending, Printing, Delivery, Delivered
      deliveryDate: jobPayload.deliveryDate || createdDate,
      createdDate: createdDate,
      notes: jobPayload.notes || '',
    };

    const updatedJobs = [newJob, ...data.jobs];
    saveStoredData(STORAGE_KEYS.JOBS, updatedJobs);

    // Create corresponding Invoice (No Tax)
    const newInvoice = {
      id: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      jobId: newJob.id,
      jobNo: newJob.jobNo,
      clientId: newJob.clientId,
      clientName: newJob.clientName,
      invoiceDate: createdDate,
      dueDate: newJob.deliveryDate,
      total: totalCost,
      paidAmount: advancePaid,
      balance: dueAmount,
      status: dueAmount === 0 ? 'Paid' : advancePaid > 0 ? 'Partial' : 'Unpaid',
      items: [
        {
          description: `${newJob.title} (${newJob.quantity.toLocaleString()} pcs)`,
          quantity: newJob.quantity,
          unitPrice: newJob.quantity > 0 ? (totalCost / newJob.quantity).toFixed(3) : 0,
          total: totalCost,
        },
      ],
    };
    saveStoredData(STORAGE_KEYS.INVOICES, [newInvoice, ...data.invoices]);

    // Update Client Account Balance (Billed & Paid)
    const updatedClients = data.clients.map((c) => {
      if (c.id === newJob.clientId) {
        const newBilled = (c.totalBilled || 0) + totalCost;
        const newPaid = (c.totalPaid || 0) + advancePaid;
        const newBal = Math.max(0, newBilled - newPaid);
        return { ...c, totalBilled: newBilled, totalPaid: newPaid, balance: newBal };
      }
      return c;
    });
    saveStoredData(STORAGE_KEYS.CLIENTS, updatedClients);

    // If advance payment was made, log in General Ledger
    if (advancePaid > 0) {
      const newLedgerEntry = {
        id: `LED-${Date.now().toString().slice(-4)}`,
        date: createdDate,
        type: 'Income',
        category: 'Advance Payment',
        description: `Advance for Job #${newJob.jobNo} (${newJob.clientName})`,
        amount: advancePaid,
        reference: newInvoice.id,
      };
      saveStoredData(STORAGE_KEYS.LEDGER, [newLedgerEntry, ...data.ledger]);
    }

    return newJob;
  },

  async updateJobStage(jobId, newStage) {
    await delay(API_DELAY);
    const data = loadAllAppData();
    const updatedJobs = data.jobs.map((j) => (j.id === jobId ? { ...j, stage: newStage } : j));
    saveStoredData(STORAGE_KEYS.JOBS, updatedJobs);
    return updatedJobs;
  },

  async deleteJob(jobId) {
    await delay(API_DELAY);
    const data = loadAllAppData();
    const updatedJobs = data.jobs.filter((j) => j.id !== jobId);
    saveStoredData(STORAGE_KEYS.JOBS, updatedJobs);
    return updatedJobs;
  },

  // ----------------------------------------------------
  // CLIENT ACCOUNTS & PAYMENTS API
  // ----------------------------------------------------
  async createClient(clientPayload) {
    await delay(API_DELAY);
    const data = loadAllAppData();
    const newClient = {
      id: `C-${Date.now().toString().slice(-4)}`,
      name: clientPayload.name,
      contactPerson: clientPayload.contactPerson || '',
      phone: clientPayload.phone || '',
      email: clientPayload.email || '',
      address: clientPayload.address || '',
      totalBilled: 0,
      totalPaid: 0,
      balance: 0,
    };

    const updatedClients = [newClient, ...data.clients];
    saveStoredData(STORAGE_KEYS.CLIENTS, updatedClients);
    return newClient;
  },

  async recordPayment({ clientId, amount, method, reference, notes, date }) {
    await delay(API_DELAY);
    const data = loadAllAppData();
    const paymentAmt = Number(amount) || 0;
    const payDate = date || new Date().toISOString().split('T')[0];

    // 1. Update Client Record
    const updatedClients = data.clients.map((c) => {
      if (c.id === clientId) {
        const newPaid = (c.totalPaid || 0) + paymentAmt;
        const newBal = Math.max(0, (c.balance || 0) - paymentAmt);
        return { ...c, totalPaid: newPaid, balance: newBal };
      }
      return c;
    });
    saveStoredData(STORAGE_KEYS.CLIENTS, updatedClients);

    // 2. Settle Client Invoices (FIFO)
    let remaining = paymentAmt;
    const updatedInvoices = data.invoices.map((inv) => {
      if (inv.clientId === clientId && inv.balance > 0 && remaining > 0) {
        const payVal = Math.min(inv.balance, remaining);
        remaining -= payVal;
        const newPaid = inv.paidAmount + payVal;
        const newBal = inv.total - newPaid;
        return {
          ...inv,
          paidAmount: newPaid,
          balance: newBal,
          status: newBal === 0 ? 'Paid' : 'Partial',
        };
      }
      return inv;
    });
    saveStoredData(STORAGE_KEYS.INVOICES, updatedInvoices);

    // 3. Settle Client Jobs Due Amount
    let jobRemaining = paymentAmt;
    const updatedJobs = data.jobs.map((j) => {
      if (j.clientId === clientId && j.dueAmount > 0 && jobRemaining > 0) {
        const payVal = Math.min(j.dueAmount, jobRemaining);
        jobRemaining -= payVal;
        return {
          ...j,
          advancePaid: (j.advancePaid || 0) + payVal,
          dueAmount: j.dueAmount - payVal,
        };
      }
      return j;
    });
    saveStoredData(STORAGE_KEYS.JOBS, updatedJobs);

    // 4. Log Income in General Ledger
    const targetClient = data.clients.find((c) => c.id === clientId);
    const newLedgerEntry = {
      id: `LED-${Date.now().toString().slice(-4)}`,
      date: payDate,
      type: 'Income',
      category: 'Client Due Payment',
      description: `Payment from ${targetClient?.name || 'Client'} (${method})`,
      amount: paymentAmt,
      reference: reference || `PAY-${Date.now().toString().slice(-4)}`,
    };
    saveStoredData(STORAGE_KEYS.LEDGER, [newLedgerEntry, ...data.ledger]);

    return loadAllAppData();
  },

  // ----------------------------------------------------
  // GENERAL LEDGER & EXPENSES API
  // ----------------------------------------------------
  async addLedgerEntry(entryPayload) {
    await delay(API_DELAY);
    const data = loadAllAppData();
    const newEntry = {
      id: `LED-${Date.now().toString().slice(-4)}`,
      date: entryPayload.date || new Date().toISOString().split('T')[0],
      type: entryPayload.type || 'Expense',
      category: entryPayload.category || 'General',
      description: entryPayload.description,
      amount: Number(entryPayload.amount) || 0,
      reference: entryPayload.reference || '',
    };

    const updatedLedger = [newEntry, ...data.ledger];
    saveStoredData(STORAGE_KEYS.LEDGER, updatedLedger);
    return updatedLedger;
  },

  // ----------------------------------------------------
  // INVENTORY API
  // ----------------------------------------------------
  async updateInventoryStock(itemId, addQty) {
    await delay(API_DELAY);
    const data = loadAllAppData();
    const updatedInventory = data.inventory.map((item) =>
      item.id === itemId ? { ...item, stock: item.stock + addQty } : item
    );
    saveStoredData(STORAGE_KEYS.INVENTORY, updatedInventory);
    return updatedInventory;
  },

  async addInventoryItem(itemPayload) {
    await delay(API_DELAY);
    const data = loadAllAppData();
    const newItem = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      name: itemPayload.name,
      category: itemPayload.category || 'Paper',
      stock: Number(itemPayload.stock) || 0,
      unit: itemPayload.unit || 'Units',
      minStock: Number(itemPayload.minStock) || 5,
      unitPrice: Number(itemPayload.unitPrice) || 0,
    };
    const updatedInventory = [...data.inventory, newItem];
    saveStoredData(STORAGE_KEYS.INVENTORY, updatedInventory);
    return updatedInventory;
  },

  // ----------------------------------------------------
  // SETTINGS API
  // ----------------------------------------------------
  async saveSettings(newSettings) {
    await delay(API_DELAY);
    const data = loadAllAppData();
    const updated = { ...data.settings, ...newSettings };
    saveStoredData(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  async resetData() {
    await delay(API_DELAY);
    clearAllAppData();
    return loadAllAppData();
  }
};
