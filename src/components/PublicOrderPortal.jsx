import React, { useState } from 'react';
import { ShoppingBag, CheckCircle, Send, Phone, User, Link, Search, MessageSquare, Printer, Tag } from 'lucide-react';

export default function PublicOrderPortal({ onSubmitClientOrder, jobs, currency }) {
  const WHATSAPP_NUMBER = '8801700000000'; // Change to your official WhatsApp number

  const PRICING_LIST = [
    { id: 'color_single', name: 'Color (Single Side)', rate: 5, desc: '5 TK per page' },
    { id: 'bw_single', name: 'B&W (Single Side)', rate: 3, desc: '3 TK per page' },
    { id: 'bw_both', name: 'B&W (Both Side)', rate: 5, desc: '5 TK per sheet' },
    { id: 'color_both', name: 'Color (Both Side)', rate: 8, desc: '8 TK per sheet' },
  ];

  const [activeTabMode, setActiveTabMode] = useState('new'); // 'new' | 'track'

  // New Order Form State
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [printType, setPrintType] = useState('color_single');
  const [pagesCount, setPagesCount] = useState(1);
  const [quantity, setQuantity] = useState(100);
  const [paperStock, setPaperStock] = useState('80gsm Offset Paper');
  const [artworkLink, setArtworkLink] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [instructions, setInstructions] = useState('');

  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Track Order State
  const [searchRef, setSearchRef] = useState('');
  const [trackedJob, setTrackedJob] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Dynamic Rate & Price Calculation based on user's exact rates:
  // 1. Color Single Side: 5 TK
  // 2. B&W Single Side: 3 TK
  // 3. B&W Both Side: 5 TK
  // 4. Color Both Side: 8 TK
  const selectedPriceItem = PRICING_LIST.find((p) => p.id === printType) || PRICING_LIST[0];
  const unitRate = selectedPriceItem.rate;
  const estimatedTotal = (Number(quantity) || 0) * (Number(pagesCount) || 1) * unitRate;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName || !phone || !jobTitle) return;

    const fullTitle = `${jobTitle} [${selectedPriceItem.name}]`;
    const fullNotes = `Print Type: ${selectedPriceItem.name}. Pages: ${pagesCount}. Artwork: ${artworkLink || 'None provided'}. ${instructions || ''}`;

    const res = await onSubmitClientOrder({
      clientName,
      phone,
      email,
      title: fullTitle,
      jobType: selectedPriceItem.name,
      quantity: Number(quantity),
      paper: paperStock,
      deliveryDate,
      totalCost: estimatedTotal,
      notes: fullNotes,
    });

    if (res) {
      setSubmittedTicket({ ...res, calculatedPrice: estimatedTotal });
    }
  };

  const handleWhatsAppOrder = () => {
    const textMessage = `Hello Press Ledger! I want to place a print order:
- *Customer Name*: ${clientName || 'N/A'}
- *Phone*: ${phone || 'N/A'}
- *Job Description*: ${jobTitle || 'Print Order'}
- *Print Type*: ${selectedPriceItem.name} (${selectedPriceItem.rate} TK)
- *Pages*: ${pagesCount}
- *Quantity*: ${quantity} pcs
- *Estimated Total*: ৳${estimatedTotal.toLocaleString()}
- *Artwork Link*: ${artworkLink || 'N/A'}
- *Special Instructions*: ${instructions || 'N/A'}`;

    const encoded = encodeURIComponent(textMessage);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
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
            Thank you, <strong>{submittedTicket.clientName}</strong>! Your print order has been received by our press team.
          </p>

          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem',
              textAlign: 'left',
              marginBottom: '1.5rem'
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
              <span style={{ color: 'var(--text-muted)' }}>Total Price:</span>
              <strong style={{ color: 'var(--success)', fontSize: '1.1rem' }}>{currency}{(submittedTicket.calculatedPrice || submittedTicket.totalCost)?.toLocaleString()}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Target Delivery Date:</span>
              <strong>{submittedTicket.deliveryDate}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setSubmittedTicket(null)}>
              Place Another Order
            </button>
            <button className="btn btn-success" onClick={handleWhatsAppOrder} style={{ background: '#25D366', color: '#fff', border: 'none' }}>
              <MessageSquare size={16} /> Send via WhatsApp
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-portal-container" style={{ maxWidth: '850px', margin: '1rem auto' }}>
      {/* Official Printing Rate Price List Box */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(16, 185, 129, 0.08))',
          border: '1px solid var(--accent-primary)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tag size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Official Printing Rates & Price List</h3>
          </div>

          <button
            className="btn btn-success btn-sm"
            style={{ background: '#25D366', color: '#fff', border: 'none' }}
            onClick={handleWhatsAppOrder}
          >
            <MessageSquare size={16} /> Special Bulk Order? Chat on WhatsApp
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
          <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Color (Single Side)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>5 TK</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>per page</div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>B&W (Single Side)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>3 TK</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>per page</div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>B&W (Both Side)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>5 TK</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>per sheet</div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Color (Both Side)</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>8 TK</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>per sheet</div>
          </div>
        </div>
      </div>

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
                Select print rates and submit your job directly to our press queue or WhatsApp!
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
                2. Print Specifications & Select Rate
              </h4>

              <div className="form-group">
                <label>Print Item Description *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Brochure / Document Printing / Cash Memo"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Select Print Rate & Type *</label>
                  <select className="form-select" value={printType} onChange={(e) => setPrintType(e.target.value)}>
                    {PRICING_LIST.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - {item.desc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Number of Pages per Copy</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={pagesCount}
                    onChange={(e) => setPagesCount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Total Copies / Quantity *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Paper Type</label>
                  <input
                    type="text"
                    className="form-control"
                    value={paperStock}
                    onChange={(e) => setPaperStock(e.target.value)}
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
                  placeholder="Specify Lamination, Binding, Stapling, or special requests..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* Live Price Estimation Box based on rates */}
            <div
              style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                marginBottom: '1.5rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Order Total</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>
                  {currency}{estimatedTotal.toLocaleString()}
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                Rate: <strong>{unitRate} TK</strong> ({selectedPriceItem.name})
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ justifyContent: 'center' }}
              >
                <Send size={18} />
                <span>Submit Web Order</span>
              </button>

              <button
                type="button"
                className="btn btn-success btn-lg"
                style={{ background: '#25D366', color: '#fff', border: 'none', justifyContent: 'center' }}
                onClick={handleWhatsAppOrder}
              >
                <MessageSquare size={18} />
                <span>Order via WhatsApp</span>
              </button>
            </div>
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
