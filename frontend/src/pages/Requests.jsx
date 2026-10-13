import { useState } from 'react';
import api from '../services/api';
import usePaginated from '../hooks/usePaginated';
import { REQUEST_STATUSES, firstError, label, parseError, peso } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Alert from '../components/Alert';

const ACTION_TEXT = {
  approved: { title: 'Approve request', verb: 'Approve' },
  rejected: { title: 'Reject request', verb: 'Reject' },
  completed: { title: 'Complete sale', verb: 'Mark completed' },
  cancelled: { title: 'Cancel request', verb: 'Cancel request' },
};

export default function Requests() {
  const { user } = useAuth();
  const isBuyer = user.role === 'buyer';
  const isAdmin = user.role === 'admin';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { items, meta, loading, error, reload } = usePaginated('/buyer-requests', { page, search, status });

  const [flash, setFlash] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusChange, setStatusChange] = useState(null); // { request, status }
  const [deleting, setDeleting] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ requested_quantity: '', message: '' });
  const [errors, setErrors] = useState({});

  const changeStatus = async () => {
    setSaving(true);
    try {
      await api.patch(`/buyer-requests/${statusChange.request.id}/status`, { status: statusChange.status });
      setFlash({ type: 'success', text: `Request ${statusChange.status}.` });
      reload();
    } catch (err) {
      setFlash({ type: 'error', text: parseError(err).message });
    } finally {
      setSaving(false);
      setStatusChange(null);
    }
  };

  const onDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/buyer-requests/${deleting.id}`);
      setFlash({ type: 'success', text: 'Request deleted.' });
      reload();
    } catch (err) {
      setFlash({ type: 'error', text: parseError(err).message });
    } finally {
      setSaving(false);
      setDeleting(null);
    }
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({ requested_quantity: r.requested_quantity, message: r.message || '' });
    setErrors({});
  };

  const onEdit = async (e) => {
    e.preventDefault();
    const qty = Number(form.requested_quantity);
    const ce = {};
    if (!(qty > 0)) ce.requested_quantity = ['Enter a quantity greater than 0.'];
    setErrors(ce);
    if (Object.keys(ce).length) return;

    setSaving(true);
    try {
      await api.put(`/buyer-requests/${editing.id}`, form);
      setFlash({ type: 'success', text: 'Request updated.' });
      setEditing(null);
      reload();
    } catch (err) {
      setErrors(parseError(err).fields);
      setFlash({ type: 'error', text: parseError(err).message });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: 'Crop', render: (r) => <strong>{r.crop_listing?.crop?.name}</strong> },
    { header: isBuyer ? 'Farmer' : 'Buyer', render: (r) => (isBuyer ? r.crop_listing?.farmer?.name : r.buyer?.name) },
    { header: 'Quantity', render: (r) => `${r.requested_quantity} ${r.crop_listing?.unit}` },
    { header: 'Est. total', render: (r) => peso(r.requested_quantity * r.crop_listing?.price_per_unit) },
    { header: 'Message', render: (r) => r.message || '—' },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { header: 'Date', render: (r) => r.created_at },
    {
      header: 'Actions',
      render: (r) => (
        <div className="row-actions">
          {!isBuyer && r.status === 'pending' && (
            <>
              <Button size="sm" onClick={() => setStatusChange({ request: r, status: 'approved' })}>Approve</Button>
              <Button size="sm" variant="danger" onClick={() => setStatusChange({ request: r, status: 'rejected' })}>Reject</Button>
            </>
          )}
          {!isBuyer && r.status === 'approved' && (
            <Button size="sm" onClick={() => setStatusChange({ request: r, status: 'completed' })}>Mark completed</Button>
          )}
          {isBuyer && r.status === 'pending' && (
            <>
              <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>Edit</Button>
              <Button size="sm" variant="danger" onClick={() => setStatusChange({ request: r, status: 'cancelled' })}>Cancel</Button>
            </>
          )}
          {isAdmin && <Button size="sm" variant="danger" onClick={() => setDeleting(r)}>Delete</Button>}
        </div>
      ),
    },
  ];

  const text = statusChange && ACTION_TEXT[statusChange.status];

  return (
    <>
      <div className="page-header">
        <h2>{isBuyer ? 'My Purchase Requests' : 'Buyer Requests'}</h2>
      </div>
      <Alert type={flash?.type} onClose={() => setFlash(null)}>{flash?.text}</Alert>
      <Alert>{error}</Alert>

      <SearchBar placeholder="Search by crop name…" onSearch={(s) => { setSearch(s); setPage(1); }}>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Status">
          <option value="">All statuses</option>
          {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
      </SearchBar>

      <div className="card">
        <DataTable columns={columns} rows={items} loading={loading} emptyText={isBuyer ? 'You have not made any requests yet. Browse Crop Listings to get started.' : 'No buyer requests yet.'} />
        <Pagination meta={meta} onPage={setPage} />
      </div>

      <ConfirmDialog
        open={!!statusChange}
        danger={statusChange?.status === 'rejected' || statusChange?.status === 'cancelled'}
        title={text?.title}
        message={statusChange && `${text.verb} the request for ${statusChange.request.requested_quantity} ${statusChange.request.crop_listing?.unit} of ${statusChange.request.crop_listing?.crop?.name}?${statusChange.status === 'completed' ? ' The quantity will be deducted from the listing.' : ''}`}
        confirmText={text?.verb}
        loading={saving}
        onConfirm={changeStatus}
        onCancel={() => setStatusChange(null)}
      />

      <ConfirmDialog
        open={!!deleting}
        danger
        title="Delete request"
        message="Delete this purchase request? This cannot be undone."
        confirmText="Delete"
        loading={saving}
        onConfirm={onDelete}
        onCancel={() => setDeleting(null)}
      />

      <Modal title="Edit request" open={!!editing} onClose={() => setEditing(null)}>
        <form onSubmit={onEdit} noValidate>
          <FormInput label="Quantity" name="requested_quantity" type="number" step="0.01" min="0" value={form.requested_quantity} onChange={(e) => setForm({ ...form, requested_quantity: e.target.value })} error={firstError(errors, 'requested_quantity')} />
          <FormInput label="Message" name="message" as="textarea" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} error={firstError(errors, 'message')} />
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
