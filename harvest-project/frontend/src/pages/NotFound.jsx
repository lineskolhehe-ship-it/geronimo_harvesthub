import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="auth-page">
      <div className="card auth-card" style={{ textAlign: 'center' }}>
        <h2>404 – Page not found</h2>
        <p>The page you are looking for does not exist.</p>
        <Link to="/">Go back home</Link>
      </div>
    </div>
  );
}
