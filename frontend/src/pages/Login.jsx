import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const DEMO_ACCOUNTS = [
  { role: 'Admin (DoSJE HQ)', email: 'admin@dosje.gov.in', password: 'admin123' },
  { role: 'PMU Team', email: 'pmu1@dosje.gov.in', password: 'pmu123' },
  { role: 'Inspector', email: 'inspector1@dosje.gov.in', password: 'insp123' },
  { role: 'Inspector 2', email: 'inspector2@dosje.gov.in', password: 'insp123' }
];

export default function Login() {
  const [email, setEmail] = useState('admin@dosje.gov.in');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Is the backend running on port 4000?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dosje-navy px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-dosje-navy">Smart Real-Time Monitoring & Inspection</h1>
          <p className="text-sm text-gray-500 mt-1">Department of Social Justice and Empowerment</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dosje-blue"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dosje-blue"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>
          {error && <p className="text-sm text-dosje-red">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-dosje-blue hover:bg-dosje-navy text-white font-medium py-2 rounded-md transition disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 border-t pt-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">Demo accounts (click to autofill)</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                className="text-left text-xs bg-gray-50 hover:bg-gray-100 border rounded-md px-2 py-1.5"
              >
                <div className="font-medium text-gray-700">{acc.role}</div>
                <div className="text-gray-400">{acc.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
