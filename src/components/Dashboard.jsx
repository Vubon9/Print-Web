import React from 'react';
import {
  DollarSign,
  Clock,
  Printer,
  Users,
  ArrowUpRight,
  CreditCard
} from 'lucide-react';

export default function Dashboard({
  jobs,
  clients,
  invoices,
  currency,
  setActiveTab,
  onSelectJob,
}) {
  // Calculations
  const totalBilled = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
  const totalReceived = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
  const pendingReceivables = clients.reduce((acc, c) => acc + (c.balance || 0), 0);
  const activeJobs = jobs.filter((j) => j.stage !== 'Delivered');

  return (
    <div className="dashboard-view">
      {/* KPI Cards */}
      <div className="dashboard-grid">
        <div className="glass-card kpi-card">
          <div className="kpi-icon-wrapper" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="kpi-title">Total Revenue Billed</div>
            <div className="kpi-value">{currency}{totalBilled.toLocaleString()}</div>
            <div className="kpi-sub" style={{ color: 'var(--success)' }}>
              <ArrowUpRight size={14} style={{ verticalAlign: 'middle' }} /> Settled: {currency}{totalReceived.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div className="kpi-icon-wrapper" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="kpi-title">Pending Receivables (Due)</div>
            <div className="kpi-value" style={{ color: pendingReceivables > 0 ? 'var(--danger)' : 'var(--success)' }}>
              {currency}{pendingReceivables.toLocaleString()}
            </div>
            <div className="kpi-sub">{clients.filter(c => c.balance > 0).length} Clients with Due</div>
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div className="kpi-icon-wrapper" style={{ background: 'linear-gradient(135deg, #0ea5e9, #2563eb)' }}>
            <Printer size={24} />
          </div>
          <div>
            <div className="kpi-title">Active Job Orders</div>
            <div className="kpi-value">{activeJobs.length} Jobs</div>
            <div className="kpi-sub">{jobs.length} total orders recorded</div>
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div className="kpi-icon-wrapper" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="kpi-title">Client Accounts</div>
            <div className="kpi-value">{clients.length} Clients</div>
            <div className="kpi-sub">Total registered client base</div>
          </div>
        </div>
      </div>

      {/* Active Jobs Section */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div className="chart-card-title">
          <span><Printer size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Recent Job Orders & Status</span>
          <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('jobs')}>
            View All Job Orders
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job No</th>
                <th>Title & Client</th>
                <th>Quantity & Paper</th>
                <th>Total Price</th>
                <th>Advance Paid</th>
                <th>Due Amount</th>
                <th>Stage</th>
                <th>Delivery</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No job orders recorded yet. Click "+ New Job Order" above to take a record!
                  </td>
                </tr>
              ) : (
                jobs.slice(0, 5).map((job) => (
                  <tr key={job.id} onClick={() => onSelectJob(job)} style={{ cursor: 'pointer' }}>
                    <td className="mono" style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {job.jobNo}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{job.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.clientName}</div>
                    </td>
                    <td>
                      <div>{job.quantity?.toLocaleString()} pcs</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.paper}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{currency}{job.totalCost?.toLocaleString()}</td>
                    <td style={{ color: 'var(--success)' }}>{currency}{job.advancePaid?.toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: job.dueAmount > 0 ? 'var(--danger)' : 'var(--success)' }}>
                      {currency}{job.dueAmount?.toLocaleString()}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          job.stage === 'Printing'
                            ? 'badge-info'
                            : job.stage === 'Finishing'
                            ? 'badge-warning'
                            : job.stage === 'Pending'
                            ? 'badge-neutral'
                            : 'badge-success'
                        }`}
                      >
                        {job.stage}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{job.deliveryDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
