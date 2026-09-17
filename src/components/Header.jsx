import React from 'react';
import { Sun, Moon, Plus, UserPlus, ShoppingBag, RotateCcw, Lock, Unlock } from 'lucide-react';

const TAB_TITLES = {
  order_online: 'Client Online Order Request Portal',
  dashboard: 'Press Executive Dashboard',
  jobs: 'Job Orders & Due Tracking',
  clients: 'Client Accounts & Pay Ledger',
  invoices: 'Invoices & Billing Receipts',
};

export default function Header({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  isAdmin,
  onOpenAdminLogin,
  onAdminLogout,
  onOpenNewJob,
  onOpenNewClient,
  onResetData,
}) {
  return (
    <header className="top-header no-print">
      <div className="header-left">
        <h1 className="page-heading-title">{TAB_TITLES[activeTab] || 'Press Ledger'}</h1>
      </div>

      <div className="header-right">
        {/* Public Order Button */}
        {activeTab !== 'order_online' && (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setActiveTab && setActiveTab('order_online')}
          >
            <ShoppingBag size={16} />
            <span>Order Online</span>
          </button>
        )}

        {/* Admin Login / Logout Control */}
        {isAdmin ? (
          <>
            <button className="btn btn-secondary btn-sm" onClick={onOpenNewClient}>
              <UserPlus size={16} />
              <span>New Client</span>
            </button>

            <button className="btn btn-primary btn-sm" onClick={onOpenNewJob}>
              <Plus size={16} />
              <span>New Job Order</span>
            </button>

            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all data to empty?')) {
                  onResetData && onResetData();
                }
              }}
              title="Reset All Data"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>

            <button
              className="btn btn-warning btn-sm"
              onClick={onAdminLogout}
              title="Lock Admin Panel"
            >
              <Unlock size={15} />
              <span>Lock Admin</span>
            </button>
          </>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={onOpenAdminLogin}
          >
            <Lock size={15} />
            <span>Manager Login</span>
          </button>
        )}

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
