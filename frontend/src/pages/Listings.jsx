import { useEffect, useState } from 'react';
import api from '../services/api';
import usePaginated from '../hooks/usePaginated';
import { CATEGORIES, LISTING_STATUSES, firstError, label, parseError, peso } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Alert from '../components/Alert';

const EMPTY = {
  crop_id: '', harvest_record_id: '', available_quantity: '', unit: 'kg',
  price_per_unit: '', harvest_date: '', status: 'available', description: '',
};

export default function Listings() {
  const { user } = useAuth();
  const isFarmer = user.role === 'farmer';
  const isBuyer = user.role === 'buyer';
  const isAdmin = user.role === 'admin';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [mine, setMine] = useState(false);
  const { items, meta, loading, error, reload } = usePaginated('/crop-listings', {
    page, search, category, status, mine: mine ? 1 : undefined,
  });

  const [crops, setCrops] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [flash, setFlash] = useState(null);
  const [saving, setSaving] = useState(false);

  // listing form (farmer / admin)
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [deleting, setDeleting] = useState(null);

  // purchase request form (buyer)
  const [requesting, setRequesting] = useState(null);
  const [reqForm, setReqForm] = useState({ requested_quantity: '', message: '' });
  const [reqErrors, setReqErrors] = useState({});

  useEffect(() => {
    api.get('/crops', { params: { all: 1 } }).then((res) => setCrops(res.data.data));
    if (isFarmer) api.get('/harvest-records', { params: { all: 1 } }).then((res) => setHarvests(res.data.data));
  }, [isFarmer]);

  const canManage = (l) => isAdmin || l.farmer_id === user.id;

  const openForm = (l) => {
    setEditing(l || 'new');
    setForm(
      l
        ? {
            crop_id: l.crop_id, harvest_record_id: l.harvest_record_id ?? '',
            available_quantity: l.available_quantity, unit: l.unit, price_per_unit: l.price_per_unit,
            harvest_date: l.harvest_date || '', status: l.status, description: l.description || '',
          }
        : EMPTY
    );
    setErrors({});
  };
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.crop_id) e.crop_id = ['Please choose a crop.'];
    if (form.available_quantity === '' || Number(form.available_quantity) < 0) e.available_quantity = ['Enter the available quantity (0 or more).'];
    if (!(Number(form.price_per_unit) > 0)) e.price_per_unit = ['Price must be greater than 0.'];
    if (!form.unit.trim()) e.unit = ['Unit is required.'];
    return e;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const ce = validate();
    setErrors(ce);
    if (Object.keys(ce).length) return;

    const payload = { ...form, harvest_date: form.harvest_date || null };
    // Harvest links are only offered to farmers; leave the link untouched when an admin edits.
    if (isFarmer) payload.harvest_record_id = form.harvest_record_id || null;
    else delete payload.harvest_record_id;

    setSaving(true);
    try {
      if (editing === 'new') await api.post('/crop-listings', payload);
      else await api.put(`/crop-listings/${editing.id}`, payload);
      setFlash({ type: 'success', text: editing === 'new' ? 'Listing published.' : 'Listing updated.' });
      setEditing(null);
      reload();
    } catch (err) {
      setErrors(parseError(err).fields);
      setFlash({ type: 'error', text: parseError(err).message });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/crop-listings/${deleting.id}`);
      setFlash({ type: 'success', text: 'Listing deleted.' });
      reload();
    } catch (err) {
      setFlash({ type: 'error', text: parseError(err).message });
    } finally {
      setSaving(false);
      setDeleting(null);
    }
  };

  const openRequest = (l) => {
    setRequesting(l);
    setReqForm({ requested_quantity: '', message: '' });
    setReqErrors({});
  };

  const onRequest = async (e) => {
    e.preventDefault();
    const qty = Number(reqForm.requested_quantity);
    const ce = {};
    if (!(qty > 0)) ce.requested_quantity = ['Enter a quantity greater than 0.'];
    else if (qty > Number(requesting.available_quantity)) ce.requested_quantity = [`Only ${requesting.available_quantity} ${requesting.unit} is available.`];
    setReqErrors(ce);
    if (Object.keys(ce).length) return;

    setSaving(true);
    try {
      await api.post('/buyer-requests', { crop_listing_id: requesting.id, ...reqForm });
      setFlash({ type: 'success', text: 'Purchase request sent! Track it under My Requests.' });
      setRequesting(null);
    } catch (err) {
      setReqErrors(parseError(err).fields);
      setFlash({ type: 'error', text: parseError(err).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>Crop Listings</h2>
        {isFarmer && <Button onClick={() => openForm()}>+ New listing</Button>}
      </div>
      <Alert type={flash?.type} onClose={() => setFlash(null)}>{flash?.text}</Alert>
      <Alert>{error}</Alert>

      <SearchBar placeholder="Search crop or farmer…" onSearch={(s) => { setSearch(s); setPage(1); }}>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Status">
          <option value="">{isBuyer ? 'Available only' : 'All statuses'}</option>
          {LISTING_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        {isFarmer && (
          <label className="check">
            <input type="checkbox" checked={mine} onChange={(e) => { setMine(e.target.checked); setPage(1); }} /> My listings
          </label>
        )}
      </SearchBar>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className="card empty">No crop listings match your search.</div>
      ) : (
        <div className="listing-grid">
          {items.map((l) => (
            <div className="card listing" key={l.id}>
              <div className="listing-top">
                <h3>{l.crop?.name}</h3>
                <StatusBadge status={l.status} />
              </div>
              <p className="muted">{l.crop?.category} · by {l.farmer?.name}</p>
              <p className="price">{peso(l.price_per_unit)} <small>/ {l.unit}</small></p>
              <p><strong>{l.available_quantity} {l.unit}</strong> available</p>
              {l.harvest_date && <p className="muted">Harvest date: {l.harvest_date}</p>}
              {l.description && <p className="muted">{l.description}</p>}
              <div className="row-actions">
                {isBuyer && l.status === 'available' && <Button size="sm" onClick={() => openRequest(l)}>Request to buy</Button>}
                {canManage(l) && isFarmer && <Button size="sm" variant="secondary" onClick={() => openForm(l)}>Edit</Button>}
                {isAdmin && <Button size="sm" variant="secondary" onClick={() => openForm(l)}>Edit</Button>}
                {canManage(l) && <Button size="sm" variant="danger" onClick={() => setDeleting(l)}>Delete</Button>}
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination meta={meta} onPage={setPage} />

      {/* Listing form */}
      <Modal title={editing === 'new' ? 'New crop listing' : 'Edit crop listing'} open={!!editing} onClose={() => setEditing(null)}>
        <form onSubmit={onSubmit} noValidate>
          <FormInput label="Crop" name="crop_id" as="select" value={form.crop_id} onChange={onChange} error={firstError(errors, 'crop_id')}>
            <option value="">— Select a crop —</option>
            {crops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </FormInput>
          {isFarmer && (
            <FormInput label="Linked harvest record (optional)" name="harvest_record_id" as="select" value={form.harvest_record_id} onChange={onChange} error={firstError(errors, 'harvest_record_id')}>
              <option value="">— None —</option>
              {harvests.map((h) => <option key={h.id} value={h.id}>{h.crop?.name} · {h.harvest_date}</option>)}
            </FormInput>
          )}
          <div className="form-row">
            <FormInput label="Available quantity" name="available_quantity" type="number" step="0.01" min="0" value={form.available_quantity} onChange={onChange} error={firstError(errors, 'available_quantity')} />
            <FormInput label="Unit" name="unit" value={form.unit} onChange={onChange} error={firstError(errors, 'unit')} />
          </div>
          <div className="form-row">
            <FormInput label="Price per unit (₱)" name="price_per_unit" type="number" step="0.01" min="0" value={form.price_per_unit} onChange={onChange} error={firstError(errors, 'price_per_unit')} />
            <FormInput label="Harvest date" name="harvest_date" type="date" value={form.harvest_date} onChange={onChange} error={firstError(errors, 'harvest_date')} />
          </div>
          <FormInput label="Status" name="status" as="select" options={LISTING_STATUSES.map((s) => ({ value: s, label: label(s) }))} value={form.status} onChange={onChange} error={firstError(errors, 'status')} />
          <FormInput label="Description" name="description" as="textarea" value={form.description} onChange={onChange} error={firstError(errors, 'description')} />
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>

      {/* Purchase request form (buyer) */}
      <Modal title={`Request ${requesting?.crop?.name || ''}`} open={!!requesting} onClose={() => setRequesting(null)}>
        {requesting && (
          <form onSubmit={onRequest} noValidate>
            <p className="muted">
              {peso(requesting.price_per_unit)} per {requesting.unit} · {requesting.available_quantity} {requesting.unit} available from {requesting.farmer?.name}
            </p>
            <FormInput label={`Quantity (${requesting.unit})`} name="requested_quantity" type="number" step="0.01" min="0" value={reqForm.requested_quantity} onChange={(e) => setReqForm({ ...reqForm, requested_quantity: e.target.value })} error={firstError(reqErrors, 'requested_quantity')} />
            <FormInput label="Message to the farmer (optional)" name="message" as="textarea" value={reqForm.message} onChange={(e) => setReqForm({ ...reqForm, message: e.target.value })} error={firstError(reqErrors, 'message')} />
            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={() => setRequesting(null)}>Cancel</Button>
              <Button type="submit" loading={saving}>Send request</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        danger
        title="Delete listing"
        message={`Delete the ${deleting?.crop?.name} listing? Related buyer requests will also be removed.`}
        confirmText="Delete"
        loading={saving}
        onConfirm={onDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
