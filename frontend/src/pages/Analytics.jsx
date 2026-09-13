import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import api from '../api.js';
import socket from '../socket.js';

export default function Analytics() {
  const [summary, setSummary] = useState(null);

  const load = () => api.get('/analytics/summary').then(({ data }) => setSummary(data));

  useEffect(() => {
    load();
    socket.on('attendance:update', load);
    socket.on('anomaly:new', load);
    return () => {
      socket.off('attendance:update', load);
      socket.off('anomaly:new', load);
    };
  }, []);

  if (!summary) return <div className="p-6 text-gray-500">Loading analytics…</div>;

  const attendanceChartData = summary.attendanceTrend.map((a) => ({
    time: new Date(a.timestamp).toLocaleTimeString(),
    attendance: a.attendance,
    expected: a.expected,
    institute: a.instituteName
  }));

  const anomalyByType = Object.entries(
    summary.recentAnomalies.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ type: type.replaceAll('_', ' '), count }));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dosje-navy mb-1">AI Anomaly & Attendance Analytics</h1>
        <p className="text-sm text-gray-500">Trend of verified attendance vs. expected beneficiaries, and flagged anomaly categories.</p>
      </div>

      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <h2 className="font-semibold text-dosje-navy mb-3">Attendance Trend (live)</h2>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={attendanceChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="attendance" stroke="#12406b" strokeWidth={2} name="Verified Attendance" />
              <Line type="monotone" dataKey="expected" stroke="#f5a623" strokeDasharray="4 4" name="Expected Beneficiaries" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <h2 className="font-semibold text-dosje-navy mb-3">Anomalies by Type (recent)</h2>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={anomalyByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#d64545" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
