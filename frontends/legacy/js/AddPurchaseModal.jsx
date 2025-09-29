// FILE: frontend/js/AddPurchaseModal.jsx
// PURPOSE: React pop-out to manually add a purchase to /api/purchases
// Notes:
// - Inline styles are namespaced (.sp-*) to avoid touching your CSS.
// - Works with either POST response shape: `{status:"ok", purchase:{}}` OR the raw created object.

const { useState, useEffect } = React;

function AddPurchaseModal({ open, onClose, onSaved }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const statusOptions = [
    'Purchased',
    'Marked as despatched',
    'Delivered',
    'Verified',
    'Feedback left',
    'Returned'
  ];

  const sourceOptions = ['Auction', 'Vinted', 'Regular Stock', 'Other'];

  const [form, setForm] = useState({
    identifier: '',
    category: '',
    brand: '',
    model: '',
    generation: '',
    source: 'Other',
    seller_username: '',
    order_id: '',
    dateOfPurchase: new Date().toISOString().slice(0, 10),
    price_paid: '',
    shipping_cost: '',
    fees: '',
    tracking_ref: '',
    status: 'Purchased',
    return_reason: '',
    parts_total: '',
    photos: '',
    video_url: '',
    notes: ''
  });

  useEffect(() => {
    if (open) {
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.dateOfPurchase) return 'Date of purchase is required.';
    const nn = (v) => v === '' || v === null || isNaN(Number(v)) ? 0 : Number(v);
    if (nn(form.price_paid) < 0) return 'Price paid cannot be negative.';
    if (nn(form.shipping_cost) < 0) return 'Shipping cost cannot be negative.';
    if (nn(form.fees) < 0) return 'Fees cannot be negative.';
    if (!statusOptions.includes(form.status)) return 'Invalid status.';
    return null;
  };

  const toPayload = () => {
    const n = (v) => v === '' ? undefined : Number(v);
    const photosArr =
      (form.photos || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

    return {
      identifier: form.identifier || undefined,
      category: form.category || undefined,
      brand: form.brand || undefined,
      model: form.model || undefined,
      generation: form.generation || undefined,
      source: form.source || 'Other',
      seller_username: form.seller_username || undefined,
      order_id: form.order_id || undefined,
      dateOfPurchase: form.dateOfPurchase, // YYYY-MM-DD
      price_paid: n(form.price_paid) ?? 0,
      shipping_cost: n(form.shipping_cost) ?? 0,
      fees: n(form.fees) ?? 0,
      tracking_ref: form.tracking_ref || undefined,
      status: form.status,
      return_reason: form.status === 'Returned' ? (form.return_reason || '') : undefined,
      parts_total: form.parts_total === '' ? undefined : Number(form.parts_total),
      photos: photosArr,
      video_url: form.video_url || undefined,
      notes: form.notes || undefined
    };
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toPayload())
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();
      const created = data.purchase || data; // supports both shapes
      onSaved?.(created);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="sp-modal-backdrop" onClick={onClose}>
      <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sp-modal-header">
          <h3>➕ Add Purchase (Manual)</h3>
          <button className="sp-close" onClick={onClose} aria-label="Close">✖</button>
        </div>

        {error && <div className="sp-alert sp-alert-error">❌ {error}</div>}

        <form onSubmit={submit} className="sp-form">
          <div className="sp-grid">
            <label>
              Identifier
              <input name="identifier" value={form.identifier} onChange={handleChange} placeholder="ELECTRONICS-20250911-0001" />
            </label>

            <label>
              Category
              <input name="category" value={form.category} onChange={handleChange} placeholder="AirPods / Speakers / …" />
            </label>

            <label>
              Brand
              <input name="brand" value={form.brand} onChange={handleChange} />
            </label>

            <label>
              Model
              <input name="model" value={form.model} onChange={handleChange} />
            </label>

            <label>
              Generation
              <input name="generation" value={form.generation} onChange={handleChange} />
            </label>

            <label>
              Source
              <select name="source" value={form.source} onChange={handleChange}>
                {sourceOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label>
              Seller Username
              <input name="seller_username" value={form.seller_username} onChange={handleChange} placeholder="(Vinted/eBay)" />
            </label>

            <label>
              Order ID
              <input name="order_id" value={form.order_id} onChange={handleChange} />
            </label>

            <label>
              Date of Purchase
              <input type="date" name="dateOfPurchase" value={form.dateOfPurchase} onChange={handleChange} required />
            </label>

            <label>
              Price Paid (£)
              <input type="number" step="0.01" name="price_paid" value={form.price_paid} onChange={handleChange} />
            </label>

            <label>
              Shipping (£)
              <input type="number" step="0.01" name="shipping_cost" value={form.shipping_cost} onChange={handleChange} />
            </label>

            <label>
              Fees (£)
              <input type="number" step="0.01" name="fees" value={form.fees} onChange={handleChange} />
            </label>

            <label>
              Tracking Ref
              <input name="tracking_ref" value={form.tracking_ref} onChange={handleChange} />
            </label>

            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            {form.status === 'Returned' && (
              <label className="sp-grid-span-2">
                Return Reason
                <input name="return_reason" value={form.return_reason} onChange={handleChange} />
              </label>
            )}

            <label>
              Parts Total
              <input type="number" min="0" name="parts_total" value={form.parts_total} onChange={handleChange} />
            </label>

            <label className="sp-grid-span-2">
              Photos (comma-separate URLs)
              <input name="photos" value={form.photos} onChange={handleChange} placeholder="https://.../p1.jpg, https://.../p2.jpg" />
            </label>

            <label className="sp-grid-span-2">
              Video URL
              <input name="video_url" value={form.video_url} onChange={handleChange} placeholder="https://.../unboxing.mp4" />
            </label>

            <label className="sp-grid-span-2">
              Notes
              <textarea name="notes" value={form.notes} onChange={handleChange} rows="3" />
            </label>
          </div>

          <div className="sp-actions">
            <button type="button" className="sp-btn sp-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="sp-btn" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Purchase'}
            </button>
          </div>
        </form>
      </div>

      {/* Inline styles (scoped to .sp-*) */}
      <style>{`
        .sp-modal-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .sp-modal {
          width: min(920px, 92vw);
          background: #fff; border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          padding: 16px 18px 18px 18px; border: 2px solid #1a365d;
          animation: spPop .2s ease-out;
        }
        @keyframes spPop { from { transform: scale(.98); opacity: .6 } to { transform: scale(1); opacity: 1 } }
        .sp-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .sp-modal-header h3 { color:#1a365d; margin: 0; }
        .sp-close { background: transparent; border: 0; font-size: 18px; cursor: pointer; color:#1a365d; }
        .sp-form label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; color:#1a365d; font-weight: 600; }
        .sp-form input, .sp-form select, .sp-form textarea {
          border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 10px; font-size: 14px;
        }
        .sp-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .sp-grid-span-2 { grid-column: span 2; }
        .sp-actions { display:flex; justify-content:flex-end; gap: 10px; margin-top: 12px; }
        .sp-btn { background: linear-gradient(135deg,#1a365d,#2c5282); color:#fff; border:0; padding: 10px 14px; border-radius: 10px; font-weight: 700; cursor: pointer; }
        .sp-btn[disabled] { opacity: .65; cursor: not-allowed; }
        .sp-btn-ghost { background: #eef2f7; color:#1a365d; }
        @media (max-width: 720px) { .sp-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

function mountAddPurchaseModal(rootId) {
  const root = document.getElementById(rootId);
  if (!root) return;

  function App() {
    const [open, setOpen] = useState(false);
    useEffect(() => { window.showAddPurchaseModal = () => setOpen(true); }, []);
    const onSaved = () => {
      if (window.loadPurchases) window.loadPurchases();
      if (window.showStatus) window.showStatus('✅ Purchase saved', 'success');
    };
    return <AddPurchaseModal open={open} onClose={() => setOpen(false)} onSaved={onSaved} />;
  }

  ReactDOM.createRoot(root).render(<App />);
}

window.mountAddPurchaseModal = mountAddPurchaseModal;
