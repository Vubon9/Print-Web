import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import JobOrders from './components/JobOrders';
import ClientLedger from './components/ClientLedger';
import Invoices from './components/Invoices';
import PublicOrderPortal from './components/PublicOrderPortal';
import PrintModal from './components/PrintModal';

import { api } from './utils/api';
import './App.css';

function App() {
  const [appData, setAppData] = useState({
    jobs: [],
    clients: [],
    invoices: [],
  });

  // Default Landing Page: Online Order Portal (Open for Everyone)
  const [activeTab, setActiveTab] = useState('order_online');
  const [theme, setTheme] = useState('dark');

  // Admin Mode & PIN Authentication
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminError, setAdminError] = useState('');

  // Modals
  const [newJobModalOpen, setNewJobModalOpen] = useState(false);
  const [newClientModalOpen, setNewClientModalOpen] = useState(false);
  const [printModalState, setPrintModalState] = useState({ open: false, type: null, data: null });

  // New Job Form State
  const [jobTitle, setJobTitle] = useState('');
  const [jobClientId, setJobClientId] = useState('');
  const [jobType, setJobType] = useState('1. Color (Single Side)');
  const [jobPaper, setJobPaper] = useState('150gsm Art Paper');
  const [jobFinishedSize, setJobFinishedSize] = useState('A4');
  const [jobQuantity, setJobQuantity] = useState(1000);
  const [jobCost, setJobCost] = useState(500);
  const [jobAdvancePaid, setJobAdvancePaid] = useState(0);
  const [jobDeliveryDate, setJobDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [jobNotes, setJobNotes] = useState('');

  // New Client Form State
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  // Initial Load from Fullstack API
  const refreshData = async () => {
    const data = await api.loadAllData();
    setAppData(data);
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Tab Switch with Admin Authentication Safeguard
  const handleTabChange = (tabId) => {
    const adminOnlyTabs = ['dashboard', 'jobs', 'clients', 'invoices'];
    if (adminOnlyTabs.includes(tabId) && !isAdmin) {
      setAdminError('');
      setAdminLoginModalOpen(true);
      return;
    }
    setActiveTab(tabId);
  };

  // Admin PIN Login Handler
  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    const success = await api.adminLogin(adminPinInput);
    if (success) {
      setIsAdmin(true);
      setAdminLoginModalOpen(false);
      setAdminPinInput('');
      setAdminError('');
      setActiveTab('dashboard'); // Switch to Dashboard after successful Admin login
    } else {
      setAdminError('Invalid Admin PIN! Please try again.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setActiveTab('order_online'); // Return to Public Online Order Portal
  };

  // Action Handlers
  const handleUpdateJobStage = async (jobId, newStage) => {
    await api.updateJobStage(jobId, newStage);
    await refreshData();
  };

  const handleDeleteJob = async (jobId) => {
    await api.deleteJob(jobId);
    await refreshData();
  };

  const handleCreateJob = async (jobPayload) => {
    const res = await api.createJob(jobPayload);
    await refreshData();
    return res;
  };

  const handleCreateJobSubmit = async (e) => {
    e.preventDefault();
    const selectedClient = appData.clients.find((c) => c.id === jobClientId) || appData.clients[0];
    
    if (!selectedClient) {
      alert('Please add a Client first before creating a Job Order!');
      setNewClientModalOpen(true);
      return;
    }

    await handleCreateJob({
      title: jobTitle || 'Custom Print Order',
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      jobType,
      paper: jobPaper,
      finishedSize: jobFinishedSize,
      quantity: Number(jobQuantity),
      totalCost: Number(jobCost),
      advancePaid: Number(jobAdvancePaid) || 0,
      deliveryDate: jobDeliveryDate,
      notes: jobNotes,
    });

    setNewJobModalOpen(false);
    setJobTitle('');
    setJobCost(500);
    setJobAdvancePaid(0);
  };

  // Online Client Order Submission (Public Portal)
  const handleSubmitOnlineClientOrder = async (orderData) => {
    try {
      let client = (appData.clients || []).find(
        (c) => c.name?.toLowerCase() === orderData.clientName?.toLowerCase() || (c.phone && c.phone === orderData.phone)
      );

      if (!client) {
        client = await api.createClient({
          name: orderData.clientName,
          phone: orderData.phone,
          email: orderData.email || '',
          contactPerson: orderData.clientName,
        });
      }

      const clientId = client?.id || `C-${Date.now().toString().slice(-4)}`;
      const clientName = client?.name || orderData.clientName;

      const newJob = await handleCreateJob({
        title: orderData.title,
        clientId: clientId,
        clientName: clientName,
        phone: orderData.phone,
        jobType: orderData.jobType,
        paper: orderData.paper,
        finishedSize: 'Standard',
        quantity: orderData.quantity,
        totalCost: orderData.totalCost || (orderData.quantity * 5),
        advancePaid: 0,
        deliveryDate: orderData.deliveryDate,
        notes: `Online Request. ${orderData.notes || ''}`,
        attachmentName: orderData.attachmentName || '',
        attachmentSize: orderData.attachmentSize || '',
        attachmentData: orderData.attachmentData || '',
      });

      return newJob || {
        id: `PL-${Date.now().toString().slice(-4)}`,
        jobNo: `JOB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        clientName: orderData.clientName,
        title: orderData.title,
        quantity: orderData.quantity,
        totalCost: orderData.totalCost,
        deliveryDate: orderData.deliveryDate,
        stage: 'Pending',
      };
    } catch (err) {
      console.error('Error submitting online client order:', err);
      return {
        id: `PL-${Date.now().toString().slice(-4)}`,
        jobNo: `JOB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        clientName: orderData.clientName,
        title: orderData.title,
        quantity: orderData.quantity,
        totalCost: orderData.totalCost,
        deliveryDate: orderData.deliveryDate,
        stage: 'Pending',
      };
    }
  };

  const handleCreateClientSubmit = async (e) => {
    e.preventDefault();
    if (!clientName) return;

    await api.createClient({
      name: clientName,
      contactPerson: clientContact,
      phone: clientPhone,
      email: clientEmail,
      address: clientAddress,
    });

    await refreshData();
    setNewClientModalOpen(false);
    setClientName('');
    setClientContact('');
    setClientPhone('');
    setClientEmail('');
    setClientAddress('');
  };

  const handleRecordPayment = async (payData) => {
    await api.recordPayment(payData);
    await refreshData();
  };

  const handleResetData = async () => {
    await api.resetData();
    await refreshData();
  };

  const currencySymbol = '৳';

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        companyName="Press Ledger"
        isAdmin={isAdmin}
        onOpenAdminLogin={() => {
          setAdminError('');
          setAdminLoginModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          theme={theme}
          setTheme={setTheme}
          isAdmin={isAdmin}
          onOpenAdminLogin={() => {
            setAdminError('');
            setAdminLoginModalOpen(true);
          }}
          onAdminLogout={handleAdminLogout}
          onOpenNewJob={() => setNewJobModalOpen(true)}
          onOpenNewClient={() => setNewClientModalOpen(true)}
          onResetData={handleResetData}
        />

        <main className="content-body">
          {/* Public Order Portal (Open for Everyone) */}
          {activeTab === 'order_online' && (
            <PublicOrderPortal
              onSubmitClientOrder={handleSubmitOnlineClientOrder}
              jobs={appData.jobs || []}
              currency={currencySymbol}
            />
          )}

          {/* Admin Protected Views */}
          {isAdmin && (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  jobs={appData.jobs || []}
                  clients={appData.clients || []}
                  invoices={appData.invoices || []}
                  currency={currencySymbol}
                  setActiveTab={handleTabChange}
                  onSelectJob={(job) => setPrintModalState({ open: true, type: 'ticket', data: job })}
                />
              )}

              {activeTab === 'jobs' && (
                <JobOrders
                  jobs={appData.jobs || []}
                  currency={currencySymbol}
                  onUpdateJobStage={handleUpdateJobStage}
                  onDeleteJob={handleDeleteJob}
                  onOpenPrintTicket={(job) => setPrintModalState({ open: true, type: 'ticket', data: job })}
                  onOpenChallanTicket={(job) => setPrintModalState({ open: true, type: 'challan', data: job })}
                  onOpenNewJob={() => setNewJobModalOpen(true)}
                />
              )}

              {activeTab === 'clients' && (
                <ClientLedger
                  clients={appData.clients || []}
                  invoices={appData.invoices || []}
                  currency={currencySymbol}
                  onOpenNewClient={() => setNewClientModalOpen(true)}
                  onRecordPayment={handleRecordPayment}
                  onOpenClientStatement={(client) => setPrintModalState({ open: true, type: 'statement', data: client })}
                />
              )}

              {activeTab === 'invoices' && (
                <Invoices
                  invoices={appData.invoices || []}
                  currency={currencySymbol}
                  onOpenInvoiceModal={(inv) => setPrintModalState({ open: true, type: 'invoice', data: inv })}
                  onPayDue={() => {
                    setActiveTab('clients');
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Admin PIN Login Modal */}
      {adminLoginModalOpen && (
        <div className="modal-overlay" onClick={() => setAdminLoginModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Press Manager PIN Login</h3>
              <button className="modal-close-btn" onClick={() => setAdminLoginModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleAdminLoginSubmit}>
              <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Enter your 4-digit Admin PIN to access Dashboard, Job Orders, Client Accounts, and Billing.
                </div>

                <div className="form-group">
                  <input
                    type="password"
                    className="form-control mono"
                    style={{ fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center' }}
                    placeholder="******"
                    maxLength="6"
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                {adminError && (
                  <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.5rem' }}>
                    {adminError}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flexGrow: 1 }} onClick={() => setAdminLoginModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                  Unlock Admin Panel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Job Modal (Admin Only) */}
      {newJobModalOpen && (
        <div className="modal-overlay" onClick={() => setNewJobModalOpen(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Take New Job Record (Order & Due Record)</h3>
              <button className="modal-close-btn" onClick={() => setNewJobModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleCreateJobSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Job Title / Product Description</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 5,000 Pcs Flyer / Cash Memo"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Select Client</label>
                  {(appData.clients || []).length === 0 ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="text" className="form-control" placeholder="No client found. Add new!" disabled />
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setNewClientModalOpen(true)}
                      >
                        + Add Client
                      </button>
                    </div>
                  ) : (
                    <select
                      className="form-select"
                      value={jobClientId}
                      onChange={(e) => setJobClientId(e.target.value)}
                    >
                      {(appData.clients || []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} (Phone: {c.phone || 'N/A'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Category / Print Rate</label>
                  <select className="form-select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                    <option value="1. Color (Single Side)">1. Color (Single Side) - 5 TK</option>
                    <option value="2. B&W (Single Side)">2. B&W (Single Side) - 3 TK</option>
                    <option value="3. B&W (Both Side)">3. B&W (Both Side) - 5 TK</option>
                    <option value="4. Color (Both Side)">4. Color (Both Side) - 8 TK</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Paper Stock</label>
                  <input
                    type="text"
                    className="form-control"
                    value={jobPaper}
                    onChange={(e) => setJobPaper(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Finished Cut Size</label>
                  <input
                    type="text"
                    className="form-control"
                    value={jobFinishedSize}
                    onChange={(e) => setJobFinishedSize(e.target.value)}
                  />
                </div>
              </div>

              {/* Order Cost & Advance Paid Box */}
              <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', margin: '1rem 0' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--accent-primary)' }}>
                  Financial Record (Total Price, Advance Paid & Calculated Due)
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Total Price ({currencySymbol})</label>
                    <input
                      type="number"
                      className="form-control"
                      value={jobCost}
                      onChange={(e) => setJobCost(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Advance Paid ({currencySymbol})</label>
                    <input
                      type="number"
                      className="form-control"
                      value={jobAdvancePaid}
                      onChange={(e) => setJobAdvancePaid(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Calculated Due ({currencySymbol})</label>
                    <input
                      type="text"
                      className="form-control mono"
                      style={{ fontWeight: 800, color: (Number(jobCost) - Number(jobAdvancePaid)) > 0 ? 'var(--danger)' : 'var(--success)' }}
                      value={`${currencySymbol}${Math.max(0, Number(jobCost) - Number(jobAdvancePaid)).toLocaleString()}`}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Quantity (pcs)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={jobQuantity}
                    onChange={(e) => setJobQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Target Delivery Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={jobDeliveryDate}
                    onChange={(e) => setJobDeliveryDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Special Instructions</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={jobNotes}
                  onChange={(e) => setJobNotes(e.target.value)}
                  placeholder="e.g. Gloss lamination on cover. Double sided."
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setNewJobModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Order Record & Update Account Due
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Client Modal */}
      {newClientModalOpen && (
        <div className="modal-overlay" onClick={() => setNewClientModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Client Account</h3>
              <button className="modal-close-btn" onClick={() => setNewClientModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleCreateClientSubmit}>
              <div className="form-group">
                <label>Company / Client Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Acme Printing Client"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Contact Person</label>
                  <input
                    type="text"
                    className="form-control"
                    value={clientContact}
                    onChange={(e) => setClientContact(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Billing Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setNewClientModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Document Modal */}
      {printModalState.open && (
        <PrintModal
          type={printModalState.type}
          data={printModalState.data}
          settings={{ companyName: 'Press Ledger', currency: '৳' }}
          onClose={() => setPrintModalState({ open: false, type: null, data: null })}
        />
      )}
    </div>
  );
}

export default App;
