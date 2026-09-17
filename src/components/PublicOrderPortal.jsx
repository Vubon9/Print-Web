import React, { useState } from 'react';
import { ShoppingBag, CheckCircle, Send, Phone, User, Link, Search, MessageSquare, Tag, Check } from 'lucide-react';

export default function PublicOrderPortal({ onSubmitClientOrder, jobs, currency }) {
  const [whatsAppNumber, setWhatsAppNumber] = useState('8801700000000'); // Default WhatsApp number

  const PRICING_LIST = [
    { id: 'color_single', num: '1', name: 'Color (Single Side)', rate: 5, unit: 'per page', badge: '5 TK' },
    { id: 'bw_single', num: '2', name: 'B&W (Single Side)', rate: 3, unit: 'per page', badge: '3 TK' },
    { id: 'bw_both', num: '3', name: 'B&W (Both Side)', rate: 5, unit: 'per sheet', badge: '5 TK' },
    { id: 'color_both', num: '4', name: 'Color (Both Side)', rate: 8, unit: 'per sheet', badge: '8 TK' },
  ];

  const [activeTabMode, setActiveTabMode] = useState('new'); // 'new' | 'track'

  // Form State
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [selectedRateId, setSelectedRateId] = useState('color_single');
  const [pagesCount, setPagesCount] = useState(1);
  const [quantity, setQuantity] = useState(100);
  const [paperStock, setPaperStock] = useState('80gsm Offset Paper');
  const [artworkLink, setArtworkLink] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [instructions, setInstructions] = useState('');

  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Track Order State
  const [searchRef, setSearchRef] = useState('');
  const [trackedJob, setTrackedJob] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Selected Rate Item
  const selectedPriceItem = PRICING_LIST.find((p) => p.id === selectedRateId) || PRICING_LIST[0];
  const unitRate = selectedPriceItem.rate;
  const estimatedTotal = (Number(quantity) || 0) * (Number(pagesCount) || 1) * unitRate;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName || !phone || !jobTitle) return;

    const fullTitle = `${jobTitle} (${selectedPriceItem.name})`;
    const fullNotes = `Rate: ${selectedPriceItem.name} @ ${unitRate} TK. Pages: ${pagesCount}. Artwork: ${attachedFile ? attachedFile.name : artworkLink || 'None provided'}. ${instructions || ''}`;

    try {
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
        attachmentName: attachedFile ? attachedFile.name : '',
        attachmentSize: attachedFile ? attachedFile.size : '',
        attachmentData: attachedFile ? attachedFile.data : '',
      });

      const ticket = res || {
        jobNo: `JOB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        clientName: clientName,
        title: fullTitle,
        quantity: Number(quantity),
        totalCost: estimatedTotal,
        deliveryDate: deliveryDate,
      };

      setSubmittedTicket({ ...ticket, calculatedPrice: estimatedTotal });
    } catch (err) {
      console.error('Error submitting online order:', err);
      setSubmittedTicket({
        jobNo: `JOB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        clientName: clientName,
        title: fullTitle,
        quantity: Number(quantity),
        totalCost: estimatedTotal,
        deliveryDate: deliveryDate,
        calculatedPrice: estimatedTotal,
      });
    }
  };

  const handleWhatsAppOrder = () => {
    const cleanNumber = whatsAppNumber.replace(/[^0-9]/g, '');
    const textMessage = `Hello! I would like to place a print order via your website:
- *Customer Name*: ${clientName || 'N/A'}
- *Phone*: ${phone || 'N/A'}
- *Job Description*: ${jobTitle || 'Print Order'}
- *Print Rate*: ${selectedPriceItem.num}. ${selectedPriceItem.name} (${selectedPriceItem.rate} TK)
- *Pages*: ${pagesCount}
- *Quantity*: ${quantity} pcs
- *Estimated Total*: ৳${estimatedTotal.toLocaleString()}
- *Artwork Link*: ${artworkLink || 'N/A'}
- *Instructions*: ${instructions || 'N/A'}`;

    const encoded = encodeURIComponent(textMessage);
    window.open(`https://wa.me/${cleanNumber}?text=${encoded}`, '_blank');
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tag size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Official Printing Rate List</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>WhatsApp Number:</span>
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ width: '150px', fontSize: '0.8rem' }}
              value={whatsAppNumber}
              onChange={(e) => setWhatsAppNumber(e.target.value)}
              placeholder="8801700000000"
            />
            <button
              className="btn btn-success btn-sm"
              style={{ background: '#25D366', color: '#fff', border: 'none' }}
              onClick={handleWhatsAppOrder}
            >
              <MessageSquare size={14} /> WhatsApp Order
            </button>
          </div>
        </div>

        {/* Clickable Pricing Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {PRICING_LIST.map((item) => {
            const isSelected = selectedRateId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedRateId(item.id)}
                style={{
                  background: isSelected ? 'var(--accent-gradient)' : 'var(--bg-primary)',
                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {isSelected && (
                  <div style={{ position: 'absolute', top: '6px', right: '6px', background: '#fff', color: 'var(--accent-primary)', borderRadius: '50%', padding: '2px' }}>
                    <Check size={12} />
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', opacity: isSelected ? 0.9 : 0.7, fontWeight: 700 }}>
                  {item.num}. {item.name}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.2rem 0' }}>
                  {item.badge}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: isSelected ? 0.9 : 0.7 }}>
                  {item.unit}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation: Place Order vs Track Order */}
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
                Selected Rate: <strong>{selectedPriceItem.num}. {selectedPriceItem.name} ({selectedPriceItem.badge})</strong>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Customer Details */}
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                1. Customer & Contact Information
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
                2. Print Specifications & Quantities
              </h4>

              <div className="form-group">
                <label>Print Item Description *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Brochure / Cash Memo / Document Printing / Packaging Box"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Selected Printing Rate Option *</label>
                  <select className="form-select" value={selectedRateId} onChange={(e) => setSelectedRateId(e.target.value)}>
                    {PRICING_LIST.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.num}. {item.name} - {item.badge} ({item.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Number of Pages</label>
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

              {/* Artwork File Attachment & Drive Link */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Attach Artwork / Document File (PDF, PNG, JPG, ZIP)</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.psd,.ai,.zip"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setAttachedFile({
                            name: file.name,
                            size: (file.size / 1024).toFixed(1) + ' KB',
                            data: reader.result
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {attachedFile && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.4rem', fontWeight: 600 }}>
                      📎 Attached: {attachedFile.name} ({attachedFile.size})
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Or Cloud Drive Link (Google Drive, Dropbox, WeTransfer)</label>
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

            {/* Live Price Estimation Box based on selected rate */}
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
                Rate: <strong>{selectedPriceItem.badge}</strong> ({selectedPriceItem.name})
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
