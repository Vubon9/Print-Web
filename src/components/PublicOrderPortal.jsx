import React, { useState } from 'react';
import { ShoppingBag, CheckCircle, Send, Phone, User, Link, Search, Clock, Printer } from 'lucide-react';

export default function PublicOrderPortal({ onSubmitClientOrder, jobs, currency }) {
  const [activeTabMode, setActiveTabMode] = useState('new'); // 'new' | 'track'

  // New Order Form State
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [category, setCategory] = useState('Flyer');
  const [quantity, setQuantity] = useState(1000);
  const [paperStock, setPaperStock] = useState('150gsm Art Paper');
  const [artworkLink, setArtworkLink] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [instructions, setInstructions] = useState('');

  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Track Order State
  const [searchRef, setSearchRef] = useState('');
  const [trackedJob, setTrackedJob] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Estimated Price Calculation
  const estimatedUnitPrice = category === 'Business Cards' ? 0.3 : category === 'Booklet / Catalog' ? 3.5 : 0.6;
  const estimatedTotal = (Number(quantity) || 0) * estimatedUnitPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName || !phone || !jobTitle) return;

    const fullNotes = `Artwork: ${artworkLink || 'None provided'}. ${instructions || ''}`;

    const res = await onSubmitClientOrder({
      clientName,
      phone,
      email,
      title: jobTitle,
      jobType: category,
      quantity: Number(quantity),
      paper: paperStock,
      deliveryDate,
      notes: fullNotes,
    });

    if (res) {
      setSubmittedTicket(res);
    }
  };

  const handleTrackSearch = (e) => {
    e.preventDefault();
    if (!searchRef) return;
    setHasSearched(true);

    const match = (jobs || []).find(
      (j) =>
        j.jobNo?.toLowerCase() === searchRef.trim().toLowerCase() ||
        j.id?.toLowerCase() === searchRef.trim().toLowerCase() ||
        (j.phone && j.phone === searchRef.trim())
    );

    setTrackedJob(match || null);
  };

  if (submittedTicket) {
    return (
      <div className="public-portal-container" style={{ maxWidth: '650px', margin: '2rem auto' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}
          >
            <CheckCircle size={36} />
          </div>

          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Print Order Placed Successfully!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Thank you, <strong>{submittedTicket.clientName}</strong>! Your print order has been sent directly to our production queue.
          </p>

          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '2rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Order Reference #:</span>
              <strong className="mono" style={{ color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{submittedTicket.jobNo}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Print Item:</span>
              <strong>{submittedTicket.title}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Quantity:</span>
              <strong>{submittedTicket.quantity?.toLocaleString()} pcs</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Price:</span>
              <strong style={{ color: 'var(--success)' }}>{currency}{submittedTicket.totalCost?.toLocaleString()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Target Delivery Date:</span>
              <strong>{submittedTicket.deliveryDate}</strong>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              setSubmittedTicket(null);
              setJobTitle('');
              setInstructions('');
              setArtworkLink('');
            }}
          >
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-portal-container" style={{ maxWidth: '780px', margin: '1rem auto' }}>
      {/* Sub Header Navigation: Place Order vs Track Order */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${activeTabMode === 'new' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTabMode('new')}
          style={{ flexGrow: 1, justifyContent: 'center' }}
        >
          <ShoppingBag size={18} /> Place New Print Order
        </button>

        <button
          className={`btn ${activeTabMode === 'track' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTabMode('track')}
          style={{ flexGrow: 1, justifyContent: 'center' }}
        >
          <Search size={18} /> Track Existing Order Status
        </button>
      </div>

      {activeTabMode === 'new' ? (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-gradient)',
                color: '#ffffff'
              }}
            >
              <ShoppingBag size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Online Print Order Form</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                Fill in your print requirements below to submit your job directly to our press queue.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Customer Details */}
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                1. Customer & Contact Details
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Company / Customer Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-control"
                      style={{ paddingLeft: '2.2rem' }}
                      placeholder="e.g. Rahman Traders"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Mobile / Phone Number *</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-control"
                      style={{ paddingLeft: '2.2rem' }}
                      placeholder="e.g. 01700000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Email Address (Optional)</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Order Specifications */}
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                2. Print Specifications
              </h4>

              <div className="form-group">
                <label>Print Item Description *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 2,000 Pcs Brochure / Cash Memo / Packaging Box"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Flyer">Flyer / Leaflet</option>
                    <option value="Booklet / Catalog">Booklet / Catalog</option>
                    <option value="Packaging Box">Packaging Box</option>
                    <option value="Business Cards">Business Cards</option>
                    <option value="General Printing">General Printing</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity (Pcs) *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Target Delivery Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Artwork File Drive / Cloud Link (Google Drive, Dropbox, wetransfer)</label>
                <div style={{ position: 'relative' }}>
                  <Link size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="url"
                    className="form-control"
                    style={{ paddingLeft: '2.2rem' }}
                    placeholder="https://drive.google.com/file/d/..."
                    value={artworkLink}
                    onChange={(e) => setArtworkLink(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Special Instructions & Finishing Notes</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Specify paper GSM, Gloss/Matte Lamination, Creasing, or Folding instructions..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Live Price Estimation Box */}
            <div
              style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                marginBottom: '1.5rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Order Total</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--success)' }}>
                  {currency}{estimatedTotal.toLocaleString()}
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                Rate: ~{currency}{estimatedUnitPrice} / pcs
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Send size={18} />
              <span>Submit Print Order Request</span>
            </button>
          </form>
        </div>
      ) : (
        /* Track Order Tab */
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-gradient)',
                color: '#ffffff'
              }}
            >
              <Search size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Track Your Print Order</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                Enter your Order Reference # (e.g. JOB-2026-xxx) to check live status.
              </p>
            </div>
          </div>

          <form onSubmit={handleTrackSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. JOB-2026-104 or Mobile #"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">
              Track Order
            </button>
          </form>

          {hasSearched && (
            <div>
              {trackedJob ? (
                <div
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{trackedJob.title}</h3>
                    <span className={`badge ${trackedJob.stage === 'Delivered' ? 'badge-success' : 'badge-info'}`}>
                      {trackedJob.stage}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                    <div>Order Ref #: <strong>{trackedJob.jobNo}</strong></div>
                    <div>Client Name: <strong>{trackedJob.clientName}</strong></div>
                    <div>Quantity: <strong>{trackedJob.quantity?.toLocaleString()} pcs</strong></div>
                    <div>Delivery Date: <strong>{trackedJob.deliveryDate}</strong></div>
                    <div>Total Price: <strong>{currency}{trackedJob.totalCost?.toLocaleString()}</strong></div>
                    <div>Due Balance: <strong style={{ color: trackedJob.dueAmount > 0 ? 'var(--danger)' : 'var(--success)' }}>{currency}{trackedJob.dueAmount?.toLocaleString()}</strong></div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No order found matching "<strong>{searchRef}</strong>". Please check your Order Reference #.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
