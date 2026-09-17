import React from 'react';
import {
  LayoutDashboard,
  Printer,
  Users,
  FileText,
  ShoppingBag,
  Layers,
  Lock,
  Unlock
} from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'jobs', label: 'Job Orders', icon: Printer },
  { id: 'clients', label: 'Client Accounts', icon: Users },
  { id: 'invoices', label: 'Invoices & Billing', icon: FileText },
  { id: 'order_online', label: 'Online Order Portal', icon: ShoppingBag },
];

const PUBLIC_NAV_ITEMS = [
  { id: 'order_online', label: 'Order Online (Public)', icon: ShoppingBag },
];

export default function Sidebar({ activeTab, setActiveTab, companyName, isAdmin, onOpenAdminLogin }) {
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : PUBLIC_NAV_ITEMS;

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
        {navItems.map((item) => {
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

        {!isAdmin && (
          <button
            className="nav-item"
            style={{ marginTop: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
            onClick={onOpenAdminLogin}
          >
            <Lock size={18} />
            <span>Admin Login (PIN)</span>
          </button>
        )}
      </nav>

      <div className="sidebar-footer">
        <span style={{ color: isAdmin ? 'var(--success)' : 'var(--text-muted)' }}>
          {isAdmin ? '🔓 Admin Mode' : '🔒 Public Order Mode'}
        </span>
        <span className="badge badge-success">Online</span>
      </div>
    </aside>
  );
}
