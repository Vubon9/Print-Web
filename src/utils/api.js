/**
 * Fullstack API Integration Utility for Press Ledger
 * Connects to Express REST API endpoints (/api/*) with client storage fallback for GitHub Pages.
 */

import {
  loadAllAppData,
  saveStoredData,
  STORAGE_KEYS
} from './storage';

const API_BASE = '/api';

async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Backend server endpoint unavailable at ${url}, using local storage storage layer.`, err.message);
    return null;
  }
}

export const api = {
  // Load All Data
  async loadAllData() {
    const jobs = await fetchJSON('/jobs');
    const clients = await fetchJSON('/clients');
    const invoices = await fetchJSON('/invoices');

    if (jobs && clients && invoices) {
      return { jobs, clients, invoices };
    }

    // Fallback to local storage
    return loadAllAppData();
  },

  // ----------------------------------------------------
  // JOB ORDERS API
  // ----------------------------------------------------
  async getJobs() {
    const jobs = await fetchJSON('/jobs');
    if (jobs) return jobs;
    return loadAllAppData().jobs;
  },

  async createJob(jobPayload) {
    const res = await fetchJSON('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobPayload),
    });
    if (res) return res;

    // Fallback local execution
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
      title: jobPayload.title || 'Untitled Order',
      clientId: jobPayload.clientId,
      clientName: jobPayload.clientName,
      jobType: jobPayload.jobType || 'General Printing',
      paper: jobPayload.paper || 'Standard Paper',
      finishedSize: jobPayload.finishedSize || 'A4',
      quantity: Number(jobPayload.quantity) || 1000,
      totalCost: totalCost,
      advancePaid: advancePaid,
      dueAmount: dueAmount,
      stage: 'Pending',
      deliveryDate: jobPayload.deliveryDate || createdDate,
      createdDate: createdDate,
      notes: jobPayload.notes || '',
    };

    saveStoredData(STORAGE_KEYS.JOBS, [newJob, ...data.jobs]);

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

    return newJob;
  },

  async updateJobStage(jobId, newStage) {
    const res = await fetchJSON(`/jobs/${jobId}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage: newStage }),
    });
    if (res) return res;

    const data = loadAllAppData();
    const updatedJobs = data.jobs.map((j) => (j.id === jobId ? { ...j, stage: newStage } : j));
    saveStoredData(STORAGE_KEYS.JOBS, updatedJobs);
    return updatedJobs;
  },

  async deleteJob(jobId) {
    const res = await fetchJSON(`/jobs/${jobId}`, {
      method: 'DELETE',
    });
    if (res) return res;

    const data = loadAllAppData();
    const updatedJobs = data.jobs.filter((j) => j.id !== jobId);
    saveStoredData(STORAGE_KEYS.JOBS, updatedJobs);
    return updatedJobs;
  },

  // ----------------------------------------------------
  // CLIENT ACCOUNTS API
  // ----------------------------------------------------
  async getClients() {
    const clients = await fetchJSON('/clients');
    if (clients) return clients;
    return loadAllAppData().clients;
  },

  async createClient(clientPayload) {
    const res = await fetchJSON('/clients', {
      method: 'POST',
      body: JSON.stringify(clientPayload),
    });
    if (res) return res;

    const data = loadAllAppData();
    const newClient = {
      id: `C-${Date.now().toString().slice(-4)}`,
      name: clientPayload.name,
      contactPerson: clientPayload.contactPerson || '',
      phone: clientPhone || clientPayload.phone || '',
      email: clientPayload.email || '',
      address: clientPayload.address || '',
      totalBilled: 0,
      totalPaid: 0,
      balance: 0,
    };

    saveStoredData(STORAGE_KEYS.CLIENTS, [newClient, ...data.clients]);
    return newClient;
  },

  // ----------------------------------------------------
  // PAYMENTS & PAY DUE API
  // ----------------------------------------------------
  async recordPayment(payData) {
    const res = await fetchJSON('/payments', {
      method: 'POST',
      body: JSON.stringify(payData),
    });
    if (res) return res;

    const data = loadAllAppData();
    const paymentAmt = Number(payData.amount) || 0;

    const updatedClients = data.clients.map((c) => {
      if (c.id === payData.clientId) {
        const newPaid = (c.totalPaid || 0) + paymentAmt;
        const newBal = Math.max(0, (c.balance || 0) - paymentAmt);
        return { ...c, totalPaid: newPaid, balance: newBal };
      }
      return c;
    });
    saveStoredData(STORAGE_KEYS.CLIENTS, updatedClients);

    let remaining = paymentAmt;
    const updatedInvoices = data.invoices.map((inv) => {
      if (inv.clientId === payData.clientId && inv.balance > 0 && remaining > 0) {
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

    let jobRemaining = paymentAmt;
    const updatedJobs = data.jobs.map((j) => {
      if (j.clientId === payData.clientId && j.dueAmount > 0 && jobRemaining > 0) {
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

    return loadAllAppData();
  }
};
