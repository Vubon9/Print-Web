import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/press_ledger';
const DATA_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const ADMIN_PIN = '203317';

// ----------------------------------------------------
// MONGODB SCHEMAS & MODELS
// ----------------------------------------------------
let isMongoConnected = false;

const JobSchema = new mongoose.Schema({
  id: String,
  jobNo: String,
  title: String,
  clientId: String,
  clientName: String,
  phone: String,
  jobType: String,
  paper: String,
  finishedSize: String,
  quantity: Number,
  totalCost: Number,
  advancePaid: Number,
  dueAmount: Number,
  stage: { type: String, default: 'Pending' },
  deliveryDate: String,
  createdDate: String,
  notes: String,
  attachmentName: String,
  attachmentSize: String,
  attachmentData: String,
});

const ClientSchema = new mongoose.Schema({
  id: String,
  name: String,
  contactPerson: String,
  phone: String,
  email: String,
  address: String,
  totalBilled: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
});

const InvoiceSchema = new mongoose.Schema({
  id: String,
  jobId: String,
  jobNo: String,
  clientId: String,
  clientName: String,
  invoiceDate: String,
  dueDate: String,
  total: Number,
  paidAmount: Number,
  balance: Number,
  status: String,
  items: Array,
});

const JobModel = mongoose.model('Job', JobSchema);
const ClientModel = mongoose.model('Client', ClientSchema);
const InvoiceModel = mongoose.model('Invoice', InvoiceSchema);

// Connect MongoDB with Graceful Fallback
mongoose.connect(MONGODB_URI)
  .then(() => {
    isMongoConnected = true;
    console.log(`Connected to MongoDB database at ${MONGODB_URI}`);
  })
  .catch((err) => {
    isMongoConnected = false;
    console.warn(`MongoDB Connection Notice: Running in JSON file database mode. (${err.message})`);
  });

// JSON File DB Helpers (Fallback Mode)
const DEFAULT_DATA = { jobs: [], clients: [], invoices: [] };

function readDB() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
      return DEFAULT_DATA;
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (err) {
    return DEFAULT_DATA;
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('JSON DB write error:', err);
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
app.get('/api/dashboard', async (req, res) => {
  if (isMongoConnected) {
    try {
      const jobs = await JobModel.find().lean();
      const clients = await ClientModel.find().lean();
      const invoices = await InvoiceModel.find().lean();

      const totalBilled = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
      const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
      const totalDue = clients.reduce((sum, c) => sum + (c.balance || 0), 0);
      const activeJobs = jobs.filter((j) => j.stage !== 'Delivered');

      return res.json({ totalBilled, totalPaid, totalDue, activeJobsCount: activeJobs.length, activeJobs, clientsCount: clients.length });
    } catch (err) {
      console.error('Mongo Error in /api/dashboard:', err);
    }
  }

  // Fallback JSON DB
  const db = readDB();
  const totalBilled = db.invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalPaid = db.invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const totalDue = db.clients.reduce((sum, c) => sum + (c.balance || 0), 0);
  const activeJobs = db.jobs.filter((j) => j.stage !== 'Delivered');

  res.json({ totalBilled, totalPaid, totalDue, activeJobsCount: activeJobs.length, activeJobs, clientsCount: db.clients.length });
});

// 2. Jobs API (Online Order & Admin Creation)
app.get('/api/jobs', async (req, res) => {
  if (isMongoConnected) {
    try {
      const jobs = await JobModel.find().sort({ _id: -1 }).lean();
      return res.json(jobs);
    } catch (err) {
      console.error('Mongo Error in GET /api/jobs:', err);
    }
  }
  const db = readDB();
  res.json(db.jobs);
});

app.post('/api/jobs', async (req, res) => {
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
    title: body.title || 'Online Print Request',
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
    attachmentData: body.attachmentData || '',
  };

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

  if (isMongoConnected) {
    try {
      const createdJob = await JobModel.create(newJob);
      await InvoiceModel.create(newInvoice);

      // Update Client Billed & Balance in MongoDB (or create if missing)
      let clientObj = await ClientModel.findOne({
        $or: [{ id: newJob.clientId }, { name: new RegExp(`^${newJob.clientName}$`, 'i') }]
      });
      if (clientObj) {
        const newBilled = (clientObj.totalBilled || 0) + totalCost;
        const newPaid = (clientObj.totalPaid || 0) + advancePaid;
        const newBal = Math.max(0, newBilled - newPaid);
        await ClientModel.updateOne({ id: clientObj.id }, { totalBilled: newBilled, totalPaid: newPaid, balance: newBal });
      } else if (newJob.clientName) {
        await ClientModel.create({
          id: newJob.clientId || `C-${Date.now().toString().slice(-4)}`,
          name: newJob.clientName,
          contactPerson: newJob.clientName,
          phone: newJob.phone || '',
          email: '',
          address: '',
          totalBilled: totalCost,
          totalPaid: advancePaid,
          balance: dueAmount,
        });
      }

      return res.status(201).json(createdJob);
    } catch (err) {
      console.error('Mongo Error in POST /api/jobs:', err);
    }
  }

  // Fallback JSON DB
  const db = readDB();
  db.jobs.unshift(newJob);
  db.invoices.unshift(newInvoice);

  let clientFound = false;
  db.clients = db.clients.map((c) => {
    if (c.id === newJob.clientId || (c.name && c.name.toLowerCase() === (newJob.clientName || '').toLowerCase())) {
      clientFound = true;
      const newBilled = (c.totalBilled || 0) + totalCost;
      const newPaid = (c.totalPaid || 0) + advancePaid;
      const newBal = Math.max(0, newBilled - newPaid);
      return { ...c, totalBilled: newBilled, totalPaid: newPaid, balance: newBal };
    }
    return c;
  });

  if (!clientFound && newJob.clientName) {
    db.clients.unshift({
      id: newJob.clientId || `C-${Date.now().toString().slice(-4)}`,
      name: newJob.clientName,
      contactPerson: newJob.clientName,
      phone: newJob.phone || '',
      email: '',
      address: '',
      totalBilled: totalCost,
      totalPaid: advancePaid,
      balance: dueAmount,
    });
  }

  writeDB(db);
  res.status(201).json(newJob);
});

app.patch('/api/jobs/:id/stage', async (req, res) => {
  const { id } = req.params;
  const { stage } = req.body;

  if (isMongoConnected) {
    try {
      await JobModel.updateOne({ id }, { stage });
      return res.json({ success: true, stage });
    } catch (err) {
      console.error('Mongo Error in PATCH /api/jobs/:id/stage:', err);
    }
  }

  const db = readDB();
  db.jobs = db.jobs.map((j) => (j.id === id ? { ...j, stage } : j));
  writeDB(db);
  res.json({ success: true, stage });
});

app.delete('/api/jobs/:id', async (req, res) => {
  const { id } = req.params;

  if (isMongoConnected) {
    try {
      await JobModel.deleteOne({ id });
      return res.json({ success: true, id });
    } catch (err) {
      console.error('Mongo Error in DELETE /api/jobs/:id:', err);
    }
  }

  const db = readDB();
  db.jobs = db.jobs.filter((j) => j.id !== id);
  writeDB(db);
  res.json({ success: true, id });
});

// 3. Clients API
app.get('/api/clients', async (req, res) => {
  if (isMongoConnected) {
    try {
      const clients = await ClientModel.find().lean();
      return res.json(clients);
    } catch (err) {
      console.error('Mongo Error in GET /api/clients:', err);
    }
  }
  const db = readDB();
  res.json(db.clients);
});

app.post('/api/clients', async (req, res) => {
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

  if (isMongoConnected) {
    try {
      const createdClient = await ClientModel.create(newClient);
      return res.status(201).json(createdClient);
    } catch (err) {
      console.error('Mongo Error in POST /api/clients:', err);
    }
  }

  const db = readDB();
  db.clients.push(newClient);
  writeDB(db);
  res.status(201).json(newClient);
});

// 4. Invoices API
app.get('/api/invoices', async (req, res) => {
  if (isMongoConnected) {
    try {
      const invoices = await InvoiceModel.find().sort({ _id: -1 }).lean();
      return res.json(invoices);
    } catch (err) {
      console.error('Mongo Error in GET /api/invoices:', err);
    }
  }
  const db = readDB();
  res.json(db.invoices);
});

// 5. Payments API (Pay Due)
app.post('/api/payments', async (req, res) => {
  const { clientId, amount } = req.body;
  const paymentAmt = Number(amount) || 0;

  if (isMongoConnected) {
    try {
      const clientObj = await ClientModel.findOne({ id: clientId });
      if (clientObj) {
        const newPaid = (clientObj.totalPaid || 0) + paymentAmt;
        const newBal = Math.max(0, (clientObj.balance || 0) - paymentAmt);
        await ClientModel.updateOne({ id: clientId }, { totalPaid: newPaid, balance: newBal });
      }

      // Settle Invoices (FIFO)
      let remaining = paymentAmt;
      const unpaidInvoices = await InvoiceModel.find({ clientId, balance: { $gt: 0 } });
      for (const inv of unpaidInvoices) {
        if (remaining <= 0) break;
        const payVal = Math.min(inv.balance, remaining);
        remaining -= payVal;
        const newPaid = inv.paidAmount + payVal;
        const newBal = inv.total - newPaid;
        await InvoiceModel.updateOne(
          { id: inv.id },
          { paidAmount: newPaid, balance: newBal, status: newBal === 0 ? 'Paid' : 'Partial' }
        );
      }

      // Settle Jobs
      let jobRemaining = paymentAmt;
      const unpaidJobs = await JobModel.find({ clientId, dueAmount: { $gt: 0 } });
      for (const j of unpaidJobs) {
        if (jobRemaining <= 0) break;
        const payVal = Math.min(j.dueAmount, jobRemaining);
        jobRemaining -= payVal;
        await JobModel.updateOne(
          { id: j.id },
          { advancePaid: (j.advancePaid || 0) + payVal, dueAmount: j.dueAmount - payVal }
        );
      }

      return res.json({ success: true, message: 'Payment recorded in MongoDB' });
    } catch (err) {
      console.error('Mongo Error in POST /api/payments:', err);
    }
  }

  // Fallback JSON DB
  const db = readDB();
  db.clients = db.clients.map((c) => {
    if (c.id === clientId) {
      const newPaid = (c.totalPaid || 0) + paymentAmt;
      const newBal = Math.max(0, (c.balance || 0) - paymentAmt);
      return { ...c, totalPaid: newPaid, balance: newBal };
    }
    return c;
  });

  let remaining = paymentAmt;
  db.invoices = db.invoices.map((inv) => {
    if (inv.clientId === clientId && inv.balance > 0 && remaining > 0) {
      const payVal = Math.min(inv.balance, remaining);
      remaining -= payVal;
      const newPaid = inv.paidAmount + payVal;
      const newBal = inv.total - newPaid;
      return { ...inv, paidAmount: newPaid, balance: newBal, status: newBal === 0 ? 'Paid' : 'Partial' };
    }
    return inv;
  });

  let jobRemaining = paymentAmt;
  db.jobs = db.jobs.map((j) => {
    if (j.clientId === clientId && j.dueAmount > 0 && jobRemaining > 0) {
      const payVal = Math.min(j.dueAmount, jobRemaining);
      jobRemaining -= payVal;
      return { ...j, advancePaid: (j.advancePaid || 0) + payVal, dueAmount: j.dueAmount - payVal };
    }
    return j;
  });

  writeDB(db);
  res.json({ success: true, message: 'Payment recorded in JSON DB' });
});

// Reset Database API
app.post('/api/reset', async (req, res) => {
  if (isMongoConnected) {
    try {
      await JobModel.deleteMany({});
      await ClientModel.deleteMany({});
      await InvoiceModel.deleteMany({});
    } catch (err) {
      console.error('Mongo reset error:', err);
    }
  }
  writeDB(DEFAULT_DATA);
  res.json({ success: true, message: 'Database reset to empty' });
});

// Serve Production Static Build
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Press Ledger Fullstack Backend Server listening on port ${PORT}`);
});
