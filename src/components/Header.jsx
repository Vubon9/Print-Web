import React from 'react';
import { Sun, Moon, Plus, UserPlus } from 'lucide-react';

const TAB_TITLES = {
  dashboard: 'Press Executive Dashboard',
  jobs: 'Job Orders & Due Tracking',
  clients: 'Client Accounts & Pay Ledger',
  invoices: 'Invoices & Billing Receipts',
};

export default function Header({
  activeTab,
  theme,
  setTheme,
  onOpenNewJob,
  onOpenNewClient,
}) {
  return (
    <header className="top-header no-print">
      <div className="header-left">
        <h1 className="page-heading-title">{TAB_TITLES[activeTab] || 'Dashboard'}</h1>
      </div>

      <div className="header-right">
        <button className="btn btn-secondary btn-sm" onClick={onOpenNewClient}>
          <UserPlus size={16} />
          <span>New Client</span>
        </button>

        <button className="btn btn-primary btn-sm" onClick={onOpenNewJob}>
          <Plus size={16} />
          <span>New Job Order</span>
        </button>

        <button
          className="theme-toggle-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
