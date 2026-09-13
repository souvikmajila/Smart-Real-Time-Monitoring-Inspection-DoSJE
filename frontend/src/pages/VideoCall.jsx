import React, { useEffect, useState } from 'react';
import api from '../api.js';
import socket from '../socket.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function VideoCall() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onVc = (session) => setSessions((prev) => [session, ...prev]);
    socket.on('vc:incoming', onVc);
    return () => socket.off('vc:incoming', onVc);
  }, []);

  const triggerRandomVC = async () => {
    setLoading(true);
    try {
      await api.post('/vc/random-connect');
    } finally {
      setLoading(false);
    }
  };

  const canTrigger = user.role === 'admin' || user.role === 'pmu';

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-dosje-navy mb-1">Random Video Conferencing</h1>
      <p className="text-sm text-gray-500 mb-6">
        Surprise-check connectivity with Project Incharge, Staff or Beneficiaries at a randomly selected
        institute — deters proxy functioning and fake reporting.
      </p>

      {canTrigger && (
        <button
          onClick={triggerRandomVC}
          disabled={loading}
          className="bg-dosje-blue hover:bg-dosje-navy text-white font-medium px-5 py-2.5 rounded-md disabled:opacity-60 mb-6"
        >
          {loading ? 'Connecting…' : '🎥 Trigger Random VC Session'}
        </button>
      )}

      <div className="space-y-3">
        {sessions.length === 0 && (
          <p className="text-sm text-gray-400">No VC sessions triggered yet in this session.</p>
        )}
        {sessions.map((s) => (
          <div key={s.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-dosje-navy">{s.instituteName}</p>
                <p className="text-xs text-gray-400">Initiated by {s.initiatedBy} · {new Date(s.startedAt).toLocaleTimeString()}</p>
              </div>
              <span className="bg-dosje-navy text-white text-xs font-mono px-2 py-1 rounded">{s.roomCode}</span>
            </div>
            <div className="mt-3 bg-gray-900 rounded-md aspect-video flex items-center justify-center text-white/60 text-sm">
              🔴 Simulated live call window — integrate WebRTC/Twilio/Jitsi SDK here for a real connection
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
