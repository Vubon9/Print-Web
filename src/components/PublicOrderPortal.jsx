import React, { useState } from 'react';
import { ShoppingBag, CheckCircle, Send, Phone, User, Calendar, FileText } from 'lucide-react';

export default function PublicOrderPortal({ onSubmitClientOrder, currency }) {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [category, setCategory] = useState('General Printing');
  const [quantity, setQuantity] = useState(1000);
  const [paperStock, setPaperStock] = useState('150gsm Art Paper');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [instructions, setInstructions] = useState('');

  const [submittedTicket, setSubmittedTicket] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName || !phone || !jobTitle) return;

    const res = await onSubmitClientOrder({
      clientName,
      phone,
      email,
      title: jobTitle,
      jobType: category,
      quantity: Number(quantity),
      paper: paperStock,
      deliveryDate,
      notes: instructions,
    });

    if (res) {
      setSubmittedTicket(res);
    }
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

          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Order Submitted Successfully!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Thank you, <strong>{submittedTicket.clientName}</strong>! Your print order request has been received by our press team.
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
              <strong className="mono" style={{ color: 'var(--accent-primary)' }}>{submittedTicket.jobNo}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Print Description:</span>
              <strong>{submittedTicket.title}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Quantity:</span>
              <strong>{submittedTicket.quantity?.toLocaleString()} pcs</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Expected Delivery Date:</span>
              <strong>{submittedTicket.deliveryDate}</strong>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              setSubmittedTicket(null);
              setJobTitle('');
              setInstructions('');
            }}
          >
            Submit Another Print Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-portal-container" style={{ maxWidth: '750px', margin: '1rem auto' }}>
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
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Online Print Order Request</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Submit your printing job details directly to our press production team.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Customer Details */}
          <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              1. Your Contact Information
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Company / Your Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '2.2rem' }}
                    placeholder="e.g. Acme Trading / Mr. Rahman"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
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
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Order Details */}
          <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              2. Print Specifications & Quantity
            </h4>

            <div className="form-group">
              <label>Job Description / Product Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 5,000 Pcs Full Color Leaflet / Catalogue"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Print Category</label>
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

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Special Machine / Paper & Finishing Notes</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Specify paper GSM, Lamination (Gloss/Matte), Folding, or artwork drive link..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              ></textarea>
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
    </div>
  );
}
