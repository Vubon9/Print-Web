import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'database.json');

// Increase JSON payload limit to 50mb for image/file uploads
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Secret Admin PIN
const ADMIN_PIN = '203317';

// Initialize Database Storage File
const DEFAULT_DATA = {
  jobs: [],
  clients: [],
  invoices: [],
};

function readDB() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
      return DEFAULT_DATA;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB file:', err);
    return DEFAULT_DATA;
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing DB file:', err);
  }
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// Admin PIN Authentication Endpoint
app.post('/api/admin/login', (req, res) => {
  const { pin } = req.body;
  if (pin === ADMIN_PIN) {
    res.json({ success: true, message: 'Admin authenticated successfully' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid Admin PIN' });
  }
});

// 1. Dashboard Metrics
app.get('/api/dashboard', (req, res) => {
  const db = readDB();
  const totalBilled = db.invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalPaid = db.invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const totalDue = db.clients.reduce((sum, c) => sum + (c.balance || 0), 0);
  const activeJobs = db.jobs.filter((j) => j.stage !== 'Delivered');

  res.json({
    totalBilled,
    totalPaid,
    totalDue,
    activeJobsCount: activeJobs.length,
    activeJobs,
    clientsCount: db.clients.length,
  });
});

// 2. Jobs API
app.get('/api/jobs', (req, res) => {
  const db = readDB();
  res.json(db.jobs);
});

app.post('/api/jobs', (req, res) => {
  const db = readDB();
  const body = req.body;

  const jobId = `PL-${Date.now().toString().slice(-4)}`;
  const jobNo = `JOB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  const createdDate = new Date().toISOString().split('T')[0];

  const totalCost = Number(body.totalCost) || 0;
  const advancePaid = Number(body.advancePaid) || 0;
  const dueAmount = Math.max(0, totalCost - advancePaid);

  const newJob = {
    id: jobId,
    jobNo: jobNo,
    title: body.title || 'Untitled Order',
    clientId: body.clientId,
    clientName: body.clientName,
    phone: body.phone || '',
    jobType: body.jobType || 'General Printing',
    paper: body.paper || 'Standard Paper',
    finishedSize: body.finishedSize || 'A4',
    quantity: Number(body.quantity) || 1000,
    totalCost: totalCost,
    advancePaid: advancePaid,
    dueAmount: dueAmount,
    stage: 'Pending',
    deliveryDate: body.deliveryDate || createdDate,
    createdDate: createdDate,
    notes: body.notes || '',
    attachmentName: body.attachmentName || '',
    attachmentSize: body.attachmentSize || '',
    attachmentData: body.attachmentData || '', // Base64 or file URL
  };

  db.jobs.unshift(newJob);

  // Generate Invoice (No Tax)
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
  db.invoices.unshift(newInvoice);

  // Update Client Account Balance
  db.clients = db.clients.map((c) => {
    if (c.id === newJob.clientId) {
      const newBilled = (c.totalBilled || 0) + totalCost;
      const newPaid = (c.totalPaid || 0) + advancePaid;
      const newBal = Math.max(0, newBilled - newPaid);
      return { ...c, totalBilled: newBilled, totalPaid: newPaid, balance: newBal };
    }
    return c;
  });

  writeDB(db);
  res.status(201).json(newJob);
});

app.patch('/api/jobs/:id/stage', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { stage } = req.body;

  db.jobs = db.jobs.map((j) => (j.id === id ? { ...j, stage } : j));
  writeDB(db);
  res.json({ success: true, stage });
});

app.delete('/api/jobs/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;

  db.jobs = db.jobs.filter((j) => j.id !== id);
  writeDB(db);
  res.json({ success: true, id });
});

// 3. Clients API
app.get('/api/clients', (req, res) => {
  const db = readDB();
  res.json(db.clients);
});

app.post('/api/clients', (req, res) => {
  const db = readDB();
  const body = req.body;

  const newClient = {
    id: `C-${Date.now().toString().slice(-4)}`,
    name: body.name,
    contactPerson: body.contactPerson || '',
    phone: body.phone || '',
    email: body.email || '',
    address: body.address || '',
    totalBilled: 0,
    totalPaid: 0,
    balance: 0,
  };

  db.clients.push(newClient);
  writeDB(db);
  res.status(201).json(newClient);
});

// 4. Invoices API
app.get('/api/invoices', (req, res) => {
  const db = readDB();
  res.json(db.invoices);
});

// 5. Payments API (Pay Due)
app.post('/api/payments', (req, res) => {
  const db = readDB();
  const { clientId, amount, method, reference } = req.body;
  const paymentAmt = Number(amount) || 0;

  // 1. Update Client Record
  db.clients = db.clients.map((c) => {
    if (c.id === clientId) {
      const newPaid = (c.totalPaid || 0) + paymentAmt;
      const newBal = Math.max(0, (c.balance || 0) - paymentAmt);
      return { ...c, totalPaid: newPaid, balance: newBal };
    }
    return c;
  });

  // 2. Settle Client Invoices (FIFO)
  let remaining = paymentAmt;
  db.invoices = db.invoices.map((inv) => {
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

  // 3. Settle Client Jobs Due Amount
  let jobRemaining = paymentAmt;
  db.jobs = db.jobs.map((j) => {
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

  writeDB(db);
  res.json({ success: true, message: 'Payment recorded successfully' });
});

// Reset Database API
app.post('/api/reset', (req, res) => {
  writeDB(DEFAULT_DATA);
  res.json({ success: true, message: 'Database reset to empty' });
});

// Serve Production Build if static
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Press Ledger Backend API server running on port ${PORT}`);
});
