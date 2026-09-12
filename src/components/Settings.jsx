import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, CheckCircle } from 'lucide-react';

export default function Settings({ settings, onSaveSettings, onClearAllData }) {
  const [formState, setFormState] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formState);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="settings-view" style={{ maxWidth: '800px' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SettingsIcon size={22} style={{ color: 'var(--accent-primary)' }} />
          Press Business Profile & Configuration
        </h2>

        {savedSuccess && (
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <CheckCircle size={18} /> Press settings successfully saved!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: '1rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>
            Company & Contact Details
          </h3>

          <div className="form-group">
            <label>Press Business Name</label>
            <input
              type="text"
              className="form-control"
              value={formState.companyName || ''}
              onChange={(e) => handleChange('companyName', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Factory / Office Address</label>
            <input
              type="text"
              className="form-control"
              value={formState.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="text"
                className="form-control"
                value={formState.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Billing Email</label>
              <input
                type="email"
                className="form-control"
                value={formState.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Currency Symbol</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                className="form-select"
                style={{ width: '130px' }}
                value={formState.currency || '৳'}
                onChange={(e) => handleChange('currency', e.target.value)}
              >
                <option value="৳">৳ (BDT)</option>
                <option value="BDT">BDT</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="₹">₹ (INR)</option>
                <option value="Custom">Custom</option>
              </select>
              <input
                type="text"
                className="form-control"
                placeholder="Symbol"
                value={formState.currency || ''}
                onChange={(e) => handleChange('currency', e.target.value)}
                required
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />

          <h3 style={{ fontSize: '1rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>
            Default Press Machine Rates
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>CTP Plate Rate ({formState.currency})</label>
              <input
                type="number"
                className="form-control"
                value={formState.ctpPlateRate || 250}
                onChange={(e) => handleChange('ctpPlateRate', Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Impression Rate / 1,000 ({formState.currency})</label>
              <input
                type="number"
                className="form-control"
                value={formState.impressionRatePerThousand || 150}
                onChange={(e) => handleChange('impressionRatePerThousand', Number(e.target.value))}
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />

          <h3 style={{ fontSize: '1rem', color: 'var(--accent-primary)', marginBottom: '1rem' }}>
            Data Backup & Disaster Recovery
          </h3>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                const allData = {
                  settings: formState,
                  jobs: JSON.parse(localStorage.getItem('press_ledger_jobs') || '[]'),
                  clients: JSON.parse(localStorage.getItem('press_ledger_clients') || '[]'),
                  invoices: JSON.parse(localStorage.getItem('press_ledger_invoices') || '[]'),
                  inventory: JSON.parse(localStorage.getItem('press_ledger_inventory') || '[]'),
                  ledger: JSON.parse(localStorage.getItem('press_ledger_entries') || '[]'),
                  exportDate: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `press_ledger_backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
            >
              Export JSON Backup File
            </button>

            <label className="btn btn-secondary" style={{ margin: 0, cursor: 'pointer' }}>
              Import JSON Backup File
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    try {
                      const data = JSON.parse(evt.target.result);
                      if (data.jobs) localStorage.setItem('press_ledger_jobs', JSON.stringify(data.jobs));
                      if (data.clients) localStorage.setItem('press_ledger_clients', JSON.stringify(data.clients));
                      if (data.invoices) localStorage.setItem('press_ledger_invoices', JSON.stringify(data.invoices));
                      if (data.inventory) localStorage.setItem('press_ledger_inventory', JSON.stringify(data.inventory));
                      if (data.ledger) localStorage.setItem('press_ledger_entries', JSON.stringify(data.ledger));
                      if (data.settings) localStorage.setItem('press_ledger_settings', JSON.stringify(data.settings));
                      alert('Data successfully restored from backup! Refreshing...');
                      window.location.reload();
                    } catch (err) {
                      alert('Invalid backup JSON file.');
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </label>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all jobs, clients, invoices, inventory, and ledger entries?')) {
                  onClearAllData();
                }
              }}
            >
              Clear All Data & Reset
            </button>

            <button type="submit" className="btn btn-primary btn-lg">
              <Save size={18} /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
