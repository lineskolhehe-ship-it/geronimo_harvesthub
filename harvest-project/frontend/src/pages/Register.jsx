import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { firstError, parseError } from '../utils/helpers';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', role: 'buyer', password: '', password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = ['Name is required.'];
    if (!form.email.trim()) e.email = ['Email is required.'];
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = ['Enter a valid email address.'];
    if (form.password.length < 8) e.password = ['Password must be at least 8 characters.'];
    if (form.password !== form.password_confirmation) e.password_confirmation = ['Passwords do not match.'];
    return e;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const clientErrors = validate();
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      const { message, fields } = parseError(err);
      setErrors(fields);
      if (!Object.keys(fields).length) setMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const f = (name) => ({ name, value: form[name], onChange, error: firstError(errors, name) });

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Create an account</h1>
        <Alert>{message}</Alert>
        <form onSubmit={onSubmit} noValidate>
          <FormInput label="Full name" {...f('name')} />
          <FormInput label="Email" type="email" {...f('email')} />
          <FormInput label="Phone (optional)" {...f('phone')} />
          <FormInput label="Address (optional)" {...f('address')} />
          <FormInput label="I am a…" as="select" options={[{ value: 'buyer', label: 'Buyer' }, { value: 'farmer', label: 'Farmer' }]} {...f('role')} />
          <FormInput label="Password" type="password" {...f('password')} />
          <FormInput label="Confirm password" type="password" {...f('password_confirmation')} />
          <Button type="submit" loading={loading}>Register</Button>
        </form>
        <p className="muted">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
