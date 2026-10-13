import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { label, parseError } from '../utils/helpers';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setStats(res.data.data.stats))
      .catch((err) => setError(parseError(err).message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <h2>Welcome, {user.name}</h2>
        <span className="badge badge-approved">{label(user.role)}</span>
      </div>
      <Alert>{error}</Alert>
      {loading ? (
        <Spinner />
      ) : (
        <div className="stat-grid">
          {stats.map((s) => (
            <div className="card stat" key={s.key}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
