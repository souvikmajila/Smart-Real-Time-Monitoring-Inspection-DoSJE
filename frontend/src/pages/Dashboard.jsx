import React, { useEffect, useState } from 'react';
import api from '../api.js';
import socket from '../socket.js';

function StatCard({ label, value, tone = 'default' }) {
  const toneClass = {
    default: 'text-dosje-navy',
    red: 'text-dosje-red',
    green: 'text-dosje-green',
    amber: 'text-dosje-accent'
  }[tone];
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${toneClass}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [liveFeed, setLiveFeed] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [vcSession, setVcSession] = useState(null);

  const loadSummary = async () => {
    const { data } = await api.get('/analytics/summary');
    setSummary(data);
    setAlerts(data.recentAnomalies || []);
  };

  useEffect(() => {
    loadSummary();
    const onAttendance = (entry) => setLiveFeed((prev) => [entry, ...prev].slice(0, 8));
    const onAnomaly = (a) => setAlerts((prev) => [a, ...prev].slice(0, 10));
    const onVc = (session) => setVcSession(session);
    const onInspection = () => loadSummary();

    socket.on('attendance:update', onAttendance);
    socket.on('anomaly:new', onAnomaly);
    socket.on('vc:incoming', onVc);
    socket.on('inspection:assigned', onInspection);
    socket.on('inspection:completed', onInspection);

    return () => {
      socket.off('attendance:update', onAttendance);
      socket.off('anomaly:new', onAnomaly);
      socket.off('vc:incoming', onVc);
      socket.off('inspection:assigned', onInspection);
      socket.off('inspection:completed', onInspection);
    };
  }, []);

  if (!summary) return <div className="p-6 text-gray-500">Loading dashboard…</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dosje-navy">Real-Time Monitoring Dashboard</h1>
        <p className="text-sm text-gray-500">Live status across all projects, institutes and NGOs under DoSJE schemes.</p>
      </div>

      {vcSession && (
        <div className="bg-dosje-accent/10 border border-dosje-accent rounded-lg p-3 text-sm text-dosje-navy flex justify-between items-center">
          <span>📹 Surprise VC session started with <strong>{vcSession.instituteName}</strong> — room <code>{vcSession.roomCode}</code></span>
          <button onClick={() => setVcSession(null)} className="text-xs underline">dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Institutes/NGOs" value={summary.totalInstitutes} />
        <StatCard label="Flagged Institutes" value={summary.flaggedInstitutes} tone="red" />
        <StatCard label="Pending Inspections" value={summary.pendingInspections} tone="amber" />
        <StatCard label="Completed Inspections" value={summary.completedInspections} tone="green" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="font-semibold text-dosje-navy mb-3">Live Attendance Pings</h2>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {liveFeed.length === 0 && <p className="text-sm text-gray-400">Waiting for live data… (updates every few seconds)</p>}
            {liveFeed.map((f) => (
              <div key={f.id} className="flex justify-between text-sm border-b last:border-0 pb-1.5">
                <span className="text-gray-700">{f.instituteName}</span>
                <span className={`font-medium ${f.attendance < f.expected * 0.4 ? 'text-dosje-red' : 'text-dosje-green'}`}>
                  {f.attendance}/{f.expected}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="font-semibold text-dosje-navy mb-3">AI Anomaly Alerts</h2>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {alerts.length === 0 && <p className="text-sm text-gray-400">No anomalies detected yet.</p>}
            {alerts.map((a) => (
              <div key={a.id} className="text-sm border-b last:border-0 pb-1.5">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${a.severity === 'high' ? 'bg-dosje-red' : 'bg-dosje-accent'}`} />
                <span className="font-medium text-gray-700">{a.instituteName || a.instituteId}</span>
                <span className="text-gray-500"> — {a.type?.replaceAll('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
