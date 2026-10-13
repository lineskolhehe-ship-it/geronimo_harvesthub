import { useEffect, useState } from 'react';
import api from '../services/api';
import usePaginated from '../hooks/usePaginated';
import { HARVEST_STATUSES, firstError, label, parseError } from '../utils/helpers';
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

const EMPTY = {
  crop_id: '', expected_quantity: '', actual_quantity: '', unit: 'kg',
  harvest_date: '', status: 'planned', notes: '',
};

export default function HarvestRecords() {
  const { user } = useAuth();
  const isFarmer = user.role === 'farmer';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { items, meta, loading, error, reload } = usePaginated('/harvest-records', { page, search, status });

  const [crops, setCrops] = useState([]);
  const [flash, setFlash] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api.get('/crops', { params: { all: 1 } }).then((res) => setCrops(res.data.data));
  }, []);

  const openForm = (rec) => {
    setEditing(rec || 'new');
    setForm(
      rec
        ? {
            crop_id: rec.crop_id, expected_quantity: rec.expected_quantity,
            actual_quantity: rec.actual_quantity ?? '', unit: rec.unit,
            harvest_date: rec.harvest_date, status: rec.status, notes: rec.notes || '',
          }
        : EMPTY
    );
    setErrors({});
  };
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.crop_id) e.crop_id = ['Please choose a crop.'];
    if (!(Number(form.expected_quantity) > 0)) e.expected_quantity = ['Expected quantity must be greater than 0.'];
    if (form.actual_quantity !== '' && Number(form.actual_quantity) < 0) e.actual_quantity = ['Actual quantity cannot be negative.'];
    if (!form.unit.trim()) e.unit = ['Unit is required.'];
    if (!form.harvest_date) e.harvest_date = ['Harvest date is required.'];
    return e;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const ce = validate();
    setErrors(ce);
    if (Object.keys(ce).length) return;

    const payload = { ...form, actual_quantity: form.actual_quantity === '' ? null : form.actual_quantity };
    setSaving(true);
    try {
      if (editing === 'new') await api.post('/harvest-records', payload);
      else await api.put(`/harvest-records/${editing.id}`, payload);
      setFlash({ type: 'success', text: editing === 'new' ? 'Harvest record added.' : 'Harvest record updated.' });
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
      await api.delete(`/harvest-records/${deleting.id}`);
      setFlash({ type: 'success', text: 'Harvest record deleted.' });
      reload();
    } catch (err) {
      setFlash({ type: 'error', text: parseError(err).message });
    } finally {
      setSaving(false);
      setDeleting(null);
    }
  };

  const columns = [
    { header: 'Crop', render: (r) => <strong>{r.crop?.name}</strong> },
    ...(!isFarmer ? [{ header: 'Farmer', render: (r) => r.farmer?.name }] : []),
    { header: 'Expected', render: (r) => `${r.expected_quantity} ${r.unit}` },
    { header: 'Actual', render: (r) => (r.actual_quantity ? `${r.actual_quantity} ${r.unit}` : '—') },
    { header: 'Harvest date', render: (r) => r.harvest_date },
    { header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      render: (r) => (
        <div className="row-actions">
          <Button size="sm" variant="secondary" onClick={() => openForm(r)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => setDeleting(r)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <h2>{isFarmer ? 'My Harvest Records' : 'All Harvest Records'}</h2>
        {isFarmer && <Button onClick={() => openForm()}>+ Add harvest</Button>}
      </div>
      <Alert type={flash?.type} onClose={() => setFlash(null)}>{flash?.text}</Alert>
      <Alert>{error}</Alert>

      <SearchBar placeholder="Search by crop name…" onSearch={(s) => { setSearch(s); setPage(1); }}>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Status">
          <option value="">All statuses</option>
          {HARVEST_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
      </SearchBar>

      <div className="card">
        <DataTable columns={columns} rows={items} loading={loading} emptyText="No harvest records yet." />
        <Pagination meta={meta} onPage={setPage} />
      </div>

      <Modal title={editing === 'new' ? 'Add harvest record' : 'Edit harvest record'} open={!!editing} onClose={() => setEditing(null)}>
        <form onSubmit={onSubmit} noValidate>
          <FormInput label="Crop" name="crop_id" as="select" value={form.crop_id} onChange={onChange} error={firstError(errors, 'crop_id')}>
            <option value="">— Select a crop —</option>
            {crops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </FormInput>
          <div className="form-row">
            <FormInput label="Expected quantity" name="expected_quantity" type="number" step="0.01" min="0" value={form.expected_quantity} onChange={onChange} error={firstError(errors, 'expected_quantity')} />
            <FormInput label="Actual quantity" name="actual_quantity" type="number" step="0.01" min="0" value={form.actual_quantity} onChange={onChange} error={firstError(errors, 'actual_quantity')} />
          </div>
          <div className="form-row">
            <FormInput label="Unit" name="unit" value={form.unit} onChange={onChange} error={firstError(errors, 'unit')} />
            <FormInput label="Harvest date" name="harvest_date" type="date" value={form.harvest_date} onChange={onChange} error={firstError(errors, 'harvest_date')} />
          </div>
          <FormInput label="Status" name="status" as="select" options={HARVEST_STATUSES.map((s) => ({ value: s, label: label(s) }))} value={form.status} onChange={onChange} error={firstError(errors, 'status')} />
          <FormInput label="Notes" name="notes" as="textarea" value={form.notes} onChange={onChange} error={firstError(errors, 'notes')} />
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        danger
        title="Delete harvest record"
        message={`Delete the ${deleting?.crop?.name} harvest record? This cannot be undone.`}
        confirmText="Delete"
        loading={saving}
        onConfirm={onDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
