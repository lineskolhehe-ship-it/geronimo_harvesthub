import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { firstError, parseError } from '../utils/helpers';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Client-side validation
  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = ['Email is required.'];
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = ['Enter a valid email address.'];
    if (!form.password) e.password = ['Password is required.'];
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
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      const { message, fields } = parseError(err);
      setErrors(fields); // 422 server errors shown under the fields
      if (!Object.keys(fields).length) setMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>🌾 Harvest Connect</h1>
        <p className="muted">Sign in to manage harvests, listings, and buyer requests.</p>
        <Alert>{message}</Alert>
        <form onSubmit={onSubmit} noValidate>
          <FormInput label="Email" name="email" type="email" value={form.email} onChange={onChange} error={firstError(errors, 'email')} />
          <FormInput label="Password" name="password" type="password" value={form.password} onChange={onChange} error={firstError(errors, 'password')} />
          <Button type="submit" loading={loading}>Log in</Button>
        </form>
        <p className="muted">
          No account yet? <Link to="/register">Register here</Link>
        </p>
        <div className="demo-box">
          <strong>Demo accounts</strong> (password: <code>password</code>)
          <br />admin@harvest.test · farmer@harvest.test · buyer@harvest.test
        </div>
      </div>
    </div>
  );
}
