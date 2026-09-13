import React, { useEffect, useState } from 'react';
import api from '../api.js';
import socket from '../socket.js';

export default function RandomAssignment() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onAssigned = (a) => setAssignments((prev) => [a, ...prev]);
    socket.on('inspection:assigned', onAssigned);
    return () => socket.off('inspection:assigned', onAssigned);
  }, []);

  const triggerAssignment = async () => {
    setLoading(true);
    try {
      await api.post('/inspections/random-assign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-dosje-navy mb-1">AI-Based Random Inspection Assignment</h1>
      <p className="text-sm text-gray-500 mb-6">
        Automated, unbiased assignment of surprise inspection duties to PMU/Inspection Teams — removes
        human discretion in choosing who inspects which institute and when.
      </p>

      <button
        onClick={triggerAssignment}
        disabled={loading}
        className="bg-dosje-blue hover:bg-dosje-navy text-white font-medium px-5 py-2.5 rounded-md disabled:opacity-60 mb-6"
      >
        {loading ? 'Assigning…' : '🎲 Run Random Assignment'}
      </button>

      <div className="space-y-3">
        {assignments.length === 0 && (
          <p className="text-sm text-gray-400">No assignments triggered yet in this session.</p>
        )}
        {assignments.map((a) => (
          <div key={a.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <p className="font-semibold text-dosje-navy">{a.instituteName}</p>
            <p className="text-sm text-gray-600">Assigned to: {a.inspectorName}</p>
            <p className="text-xs text-gray-400 mt-1">
              Scheduled for {new Date(a.scheduledFor).toLocaleString()} · via {a.assignedBy}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
