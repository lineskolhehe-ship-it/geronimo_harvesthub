import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { label } from '../utils/helpers';
import Button from './Button';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: 'Dashboard', roles: ['admin', 'farmer', 'buyer'], end: true },
    { to: '/listings', label: 'Crop Listings', roles: ['admin', 'farmer', 'buyer'] },
    { to: '/requests', label: user.role === 'buyer' ? 'My Requests' : 'Buyer Requests', roles: ['admin', 'farmer', 'buyer'] },
    { to: '/harvests', label: user.role === 'admin' ? 'Harvest Records' : 'My Harvests', roles: ['admin', 'farmer'] },
    { to: '/crops', label: 'Crop Catalog', roles: ['admin'] },
    { to: '/users', label: 'Users', roles: ['admin'] },
  ].filter((l) => l.roles.includes(user.role));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">🌾 Harvest Connect</div>
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          ☰
        </button>
        <nav className={open ? 'nav open' : 'nav'} onClick={() => setOpen(false)}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
          <div className="nav-user">
            <span>
              {user.name} <small>({label(user.role)})</small>
            </span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </nav>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
