import { useState } from 'react';
import api from '../services/api';
import usePaginated from '../hooks/usePaginated';
import { ROLES, firstError, label, parseError } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Alert from '../components/Alert';

const EMPTY = { name: '', email: '', phone: '', address: '', role: 'buyer', password: '' };

export default function Users() {
  const { user: me } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const { items, meta, loading, error, reload } = usePaginated('/users', { page, search, role });

  const [flash, setFlash] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const openForm = (u) => {
    setEditing(u || 'new');
    setForm(u ? { name: u.name, email: u.email, phone: u.phone || '', address: u.address || '', role: u.role, password: '' } : EMPTY);
    setErrors({});
  };
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const ce = {};
    if (!form.name.trim()) ce.name = ['Name is required.'];
    if (!/^\S+@\S+\.\S+$/.test(form.email)) ce.email = ['Enter a valid email address.'];
    if (editing === 'new' && form.password.length < 8) ce.password = ['Password must be at least 8 characters.'];
    setErrors(ce);
    if (Object.keys(ce).length) return;

    setSaving(true);
    try {
      if (editing === 'new') await api.post('/users', form);
      else await api.put(`/users/${editing.id}`, form);
      setFlash({ type: 'success', text: editing === 'new' ? 'User created.' : 'User updated.' });
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
      await api.delete(`/users/${deleting.id}`);
      setFlash({ type: 'success', text: 'User deleted.' });
      reload();
    } catch (err) {
      setFlash({ type: 'error', text: parseError(err).message });
    } finally {
      setSaving(false);
      setDeleting(null);
    }
  };

  const columns = [
    { header: 'Name', render: (u) => <strong>{u.name}</strong> },
    { header: 'Email', render: (u) => u.email },
    { header: 'Role', render: (u) => <span className={`badge badge-role-${u.role}`}>{label(u.role)}</span> },
    { header: 'Phone', render: (u) => u.phone || '—' },
    {
      header: 'Actions',
      render: (u) => (
        <div className="row-actions">
          <Button size="sm" variant="secondary" onClick={() => openForm(u)}>Edit</Button>
          {u.id !== me.id && <Button size="sm" variant="danger" onClick={() => setDeleting(u)}>Delete</Button>}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <h2>User Accounts</h2>
        <Button onClick={() => openForm()}>+ Add user</Button>
      </div>
      <Alert type={flash?.type} onClose={() => setFlash(null)}>{flash?.text}</Alert>
      <Alert>{error}</Alert>

      <SearchBar placeholder="Search name or email…" onSearch={(s) => { setSearch(s); setPage(1); }}>
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} aria-label="Role">
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{label(r)}</option>)}
        </select>
      </SearchBar>

      <div className="card">
        <DataTable columns={columns} rows={items} loading={loading} emptyText="No users found." />
        <Pagination meta={meta} onPage={setPage} />
      </div>

      <Modal title={editing === 'new' ? 'Add user' : 'Edit user'} open={!!editing} onClose={() => setEditing(null)}>
        <form onSubmit={onSubmit} noValidate>
          <FormInput label="Full name" name="name" value={form.name} onChange={onChange} error={firstError(errors, 'name')} />
          <FormInput label="Email" name="email" type="email" value={form.email} onChange={onChange} error={firstError(errors, 'email')} />
          <FormInput label="Phone" name="phone" value={form.phone} onChange={onChange} error={firstError(errors, 'phone')} />
          <FormInput label="Address" name="address" value={form.address} onChange={onChange} error={firstError(errors, 'address')} />
          <FormInput label="Role" name="role" as="select" options={ROLES.map((r) => ({ value: r, label: label(r) }))} value={form.role} onChange={onChange} error={firstError(errors, 'role')} />
          <FormInput label={editing === 'new' ? 'Password' : 'New password (leave blank to keep)'} name="password" type="password" value={form.password} onChange={onChange} error={firstError(errors, 'password')} />
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        danger
        title="Delete user"
        message={`Delete the account of ${deleting?.name}? Their records will also be removed.`}
        confirmText="Delete"
        loading={saving}
        onConfirm={onDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
