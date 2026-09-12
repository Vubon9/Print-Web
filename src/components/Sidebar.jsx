import React from 'react';
import {
  LayoutDashboard,
  Printer,
  Users,
  FileText,
  Layers
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'jobs', label: 'Job Orders', icon: Printer },
  { id: 'clients', label: 'Client Accounts', icon: Users },
  { id: 'invoices', label: 'Invoices & Billing', icon: FileText },
];

export default function Sidebar({ activeTab, setActiveTab, companyName }) {
  return (
    <aside className="sidebar no-print">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Layers size={24} />
        </div>
        <div>
          <div className="sidebar-title">Press Ledger</div>
          <div className="sidebar-subtitle">{companyName || 'Order & Payment Tracker'}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span>Fullstack API</span>
        <span className="badge badge-success">Online</span>
      </div>
    </aside>
  );
}
