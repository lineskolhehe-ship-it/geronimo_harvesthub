import { useState } from 'react';
import api from '../services/api';
import usePaginated from '../hooks/usePaginated';
import { CATEGORIES, firstError, parseError } from '../utils/helpers';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Alert from '../components/Alert';

const EMPTY = { name: '', category: CATEGORIES[0], description: '' };

export default function Crops() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { items, meta, loading, error, reload } = usePaginated('/crops', { page, search, category });

  const [flash, setFlash] = useState(null);
  const [editing, setEditing] = useState(null); // null | 'new' | crop
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const openForm = (crop) => {
    setEditing(crop || 'new');
    setForm(crop ? { name: crop.name, category: crop.category, description: crop.description || '' } : EMPTY);
    setErrors({});
  };
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const ce = {};
    if (!form.name.trim()) ce.name = ['Crop name is required.'];
    setErrors(ce);
    if (Object.keys(ce).length) return;

    setSaving(true);
    try {
      if (editing === 'new') await api.post('/crops', form);
      else await api.put(`/crops/${editing.id}`, form);
      setFlash({ type: 'success', text: editing === 'new' ? 'Crop added.' : 'Crop updated.' });
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
      await api.delete(`/crops/${deleting.id}`);
      setFlash({ type: 'success', text: 'Crop deleted.' });
      reload();
    } catch (err) {
      setFlash({ type: 'error', text: parseError(err).message });
    } finally {
      setSaving(false);
      setDeleting(null);
    }
  };

  const columns = [
    { header: 'Crop', render: (c) => <strong>{c.name}</strong> },
    { header: 'Category', render: (c) => c.category },
    { header: 'Description', render: (c) => c.description || '—' },
    { header: 'Listings', render: (c) => c.listings_count },
    {
      header: 'Actions',
      render: (c) => (
        <div className="row-actions">
          <Button size="sm" variant="secondary" onClick={() => openForm(c)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => setDeleting(c)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <h2>Crop Catalog</h2>
        <Button onClick={() => openForm()}>+ Add crop</Button>
      </div>
      <Alert type={flash?.type} onClose={() => setFlash(null)}>{flash?.text}</Alert>
      <Alert>{error}</Alert>

      <SearchBar placeholder="Search crops…" onSearch={(s) => { setSearch(s); setPage(1); }}>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </SearchBar>

      <div className="card">
        <DataTable columns={columns} rows={items} loading={loading} emptyText="No crops match your search." />
        <Pagination meta={meta} onPage={setPage} />
      </div>

      <Modal title={editing === 'new' ? 'Add crop' : 'Edit crop'} open={!!editing} onClose={() => setEditing(null)}>
        <form onSubmit={onSubmit} noValidate>
          <FormInput label="Crop name" name="name" value={form.name} onChange={onChange} error={firstError(errors, 'name')} />
          <FormInput label="Category" name="category" as="select" options={CATEGORIES} value={form.category} onChange={onChange} error={firstError(errors, 'category')} />
          <FormInput label="Description" name="description" as="textarea" value={form.description} onChange={onChange} error={firstError(errors, 'description')} />
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        danger
        title="Delete crop"
        message={`Delete "${deleting?.name}"? This cannot be undone.`}
        confirmText="Delete"
        loading={saving}
        onConfirm={onDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
