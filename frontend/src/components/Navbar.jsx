import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? 'bg-dosje-accent text-dosje-navy' : 'text-white/80 hover:text-white hover:bg-white/10'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav className="bg-dosje-navy shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <span className="text-white font-bold tracking-tight">DoSJE Monitoring</span>
          <div className="hidden md:flex gap-1">
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
            <NavLink to="/cctv" className={linkClass}>CCTV Feeds</NavLink>
            <NavLink to="/video-call" className={linkClass}>Video Call</NavLink>
            <NavLink to="/inspections" className={linkClass}>Inspections</NavLink>
            {(user.role === 'admin' || user.role === 'pmu') && (
              <NavLink to="/assignment" className={linkClass}>Random Assignment</NavLink>
            )}
            <NavLink to="/analytics" className={linkClass}>Analytics</NavLink>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/80 text-sm hidden sm:inline">{user.name} · <span className="uppercase text-dosje-accent">{user.role}</span></span>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
