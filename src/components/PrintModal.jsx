import React from 'react';
import { Printer, X } from 'lucide-react';

export default function PrintModal({
  type, // 'ticket' | 'invoice' | 'statement'
  data,
  settings,
  onClose
}) {
  if (!data) return null;

  const currency = settings?.currency || '$';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Action Header - Hidden on Print */}
          <div className="modal-header no-print">
            <h3>
              {type === 'ticket' && `Job Production Ticket - ${data.jobNo}`}
              {type === 'invoice' && `Tax Invoice - ${data.id}`}
              {type === 'statement' && `Statement of Account - ${data.name}`}
              {type === 'challan' && `Delivery Challan / Gate Pass - ${data.jobNo}`}
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button className="btn btn-primary btn-sm" onClick={handlePrint}>
                <Printer size={16} /> Print Document
              </button>
              <button className="modal-close-btn" onClick={onClose}>×</button>
            </div>
          </div>

          {/* Printable Document Area */}
          <div className="printable-doc">
            {/* Company Brand Header */}
            <div className="doc-header">
              <div>
                <div className="doc-brand">{settings?.companyName || 'Apex Press'}</div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>
                  {settings?.address} <br />
                  Phone: {settings?.phone} | Email: {settings?.email} <br />
                  TRN / Tax ID: {settings?.taxId}
                </div>
              </div>

              <div className="doc-meta">
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {type === 'ticket' && 'JOB PRODUCTION TICKET'}
                  {type === 'invoice' && 'TAX INVOICE'}
                  {type === 'statement' && 'STATEMENT OF ACCOUNT'}
                  {type === 'challan' && 'DELIVERY CHALLAN / GATE PASS'}
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  {type === 'ticket' && <div><strong>Ticket #:</strong> {data.jobNo}</div>}
                  {type === 'invoice' && <div><strong>Invoice #:</strong> {data.id}</div>}
                  {type === 'statement' && <div><strong>Client ID:</strong> {data.id}</div>}
                  {type === 'challan' && <div><strong>Challan #:</strong> CH-{data.jobNo}</div>}
                  <div><strong>Date:</strong> {new Date().toISOString().split('T')[0]}</div>
                </div>
              </div>
            </div>

          {/* Type 1: JOB TICKET */}
          {type === 'ticket' && (
            <div>
              <div className="doc-details-grid">
                <div>
                  <h4 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '0.3rem', marginBottom: '0.5rem' }}>
                    Job Specifications
                  </h4>
                  <div><strong>Job Title:</strong> {data.title}</div>
                  <div><strong>Client Name:</strong> {data.clientName}</div>
                  <div><strong>Category:</strong> {data.jobType}</div>
                  <div><strong>Quantity:</strong> {data.quantity?.toLocaleString()} copies</div>
                  <div><strong>Total Pages:</strong> {data.pages} pages</div>
                </div>

                <div>
                  <h4 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '0.3rem', marginBottom: '0.5rem' }}>
                    Paper & Machine Details
                  </h4>
                  <div><strong>Paper Stock:</strong> {data.paper}</div>
                  <div><strong>Cut Size:</strong> {data.finishedSize}</div>
                  <div><strong>Machine Line:</strong> {data.operator || 'Standard Offset'}</div>
                  <div><strong>Delivery Due:</strong> {data.deliveryDate}</div>
                  <div><strong>Current Stage:</strong> {data.stage}</div>
                </div>
              </div>

              <h4 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '0.3rem', marginBottom: '0.5rem' }}>
                Special Operator Notes & Instructions
              </h4>
              <div style={{ background: '#f8fafc', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.9rem', marginBottom: '2rem' }}>
                {data.notes || 'Standard printing & finishing guidelines apply.'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '3rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b' }}>
                <div style={{ borderTop: '1px solid #0f172a', paddingTop: '0.5rem' }}>Pre-Press Sign Off</div>
                <div style={{ borderTop: '1px solid #0f172a', paddingTop: '0.5rem' }}>Press Operator Sign Off</div>
                <div style={{ borderTop: '1px solid #0f172a', paddingTop: '0.5rem' }}>Quality Check Sign Off</div>
              </div>
            </div>
          )}

          {/* Type 2: TAX INVOICE */}
          {type === 'invoice' && (
            <div>
              <div className="doc-details-grid">
                <div>
                  <h4 style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Billed To</h4>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{data.clientName}</div>
                  <div>Job Ref: {data.jobNo}</div>
                  <div>Due Date: {data.dueDate}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Payment Status</h4>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: data.status === 'Paid' ? '#10b981' : '#f59e0b' }}>
                    {data.status.toUpperCase()}
                  </div>
                </div>
              </div>

              <table className="doc-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Qty</th>
                    <th>Unit Rate ({currency})</th>
                    <th style={{ textAlign: 'right' }}>Total ({currency})</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.description}</td>
                      <td>{item.quantity?.toLocaleString()}</td>
                      <td>{currency}{item.unitPrice}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {currency}{item.total?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="doc-summary">
                <div className="doc-summary-row grand-total">
                  <span>Grand Total:</span>
                  <span>{currency}{data.total?.toLocaleString()}</span>
                </div>
                <div className="doc-summary-row" style={{ color: '#10b981', fontWeight: 600 }}>
                  <span>Amount Paid:</span>
                  <span>{currency}{data.paidAmount?.toLocaleString()}</span>
                </div>
                <div className="doc-summary-row" style={{ color: '#ef4444', fontWeight: 700 }}>
                  <span>Balance Due:</span>
                  <span>{currency}{data.balance?.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                Thank you for your business! Please remit payments to our official bank account mentioning Invoice #{data.id}.
              </div>
            </div>
          )}

          {/* Type 3: STATEMENT OF ACCOUNT */}
          {type === 'statement' && (
            <div>
              <div className="doc-details-grid">
                <div>
                  <h4 style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Client Account</h4>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{data.name}</div>
                  <div>Contact: {data.contactPerson} ({data.phone})</div>
                  <div>Email: {data.email}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Current Balance Due</h4>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: data.balance > 0 ? '#ef4444' : '#10b981' }}>
                    {currency}{data.balance?.toLocaleString()}
                  </div>
                </div>
              </div>

              <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Account Summary</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem', background: '#f8fafc', padding: '1rem', borderRadius: '6px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Billed</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{currency}{data.totalBilled?.toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Payments Settled</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>{currency}{data.totalPaid?.toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Net Outstanding</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>{currency}{data.balance?.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* Type 4: DELIVERY CHALLAN / GATE PASS */}
          {type === 'challan' && (
            <div>
              <div className="doc-details-grid">
                <div>
                  <h4 style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Deliver To Client</h4>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{data.clientName}</div>
                  <div>Delivery Date: {data.deliveryDate}</div>
                  <div>Job Order #: {data.jobNo}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <h4 style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Dispatch Info</h4>
                  <div>Carrier / Driver: Standard Press Delivery</div>
                  <div>Status: Ready for Shipment</div>
                </div>
              </div>

              <table className="doc-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Specifications & Finished Size</th>
                    <th>Delivered Qty</th>
                    <th>Pack Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 700 }}>{data.title}</td>
                    <td>{data.paper} ({data.finishedSize})</td>
                    <td style={{ fontWeight: 800 }}>{data.quantity?.toLocaleString()} pcs</td>
                    <td>Carton / Bundles Packed</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '4rem', fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b' }}>
                <div style={{ borderTop: '1px solid #0f172a', paddingTop: '0.5rem' }}>Prepared By (Press)</div>
                <div style={{ borderTop: '1px solid #0f172a', paddingTop: '0.5rem' }}>Driver / Transport Sign</div>
                <div style={{ borderTop: '1px solid #0f172a', paddingTop: '0.5rem' }}>Received By Client (Sign & Seal)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
