import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import socket from '../socket.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Inspections() {
  const { user } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [institutes, setInstitutes] = useState({});

  const load = async () => {
    const [{ data: inspData }, { data: instData }] = await Promise.all([
      api.get('/inspections'),
      api.get('/institutes')
    ]);
    setInspections(inspData);
    setInstitutes(Object.fromEntries(instData.map((i) => [i.id, i])));
  };

  useEffect(() => {
    load();
    const refresh = () => load();
    socket.on('inspection:assigned', refresh);
    socket.on('inspection:completed', refresh);
    return () => {
      socket.off('inspection:assigned', refresh);
      socket.off('inspection:completed', refresh);
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-dosje-navy mb-1">
        {user.role === 'inspector' ? 'My Assigned Inspections' : 'All Inspections'}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Mobile-based inspection module — geo-tagged reports with live evidence capture.
      </p>

      <div className="space-y-3">
        {inspections.length === 0 && <p className="text-sm text-gray-400">No inspections yet.</p>}
        {inspections.map((insp) => {
          const inst = institutes[insp.instituteId];
          return (
            <div key={insp.id} className="bg-white border rounded-lg p-4 shadow-sm flex justify-between items-center">
              <div>
                <p className="font-semibold text-dosje-navy">{inst?.name || insp.instituteId}</p>
                <p className="text-xs text-gray-400">
                  Assigned by {insp.assignedBy} · scheduled {new Date(insp.scheduledFor).toLocaleString()}
                </p>
                {insp.report && (
                  <p className="text-xs text-dosje-green mt-1">
                    Compliance score: {insp.report.complianceScore ?? 'N/A'} · Attendance logged: {insp.report.attendanceCount ?? 'N/A'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    insp.status === 'completed' ? 'bg-dosje-green/10 text-dosje-green' : 'bg-dosje-accent/10 text-dosje-accent'
                  }`}
                >
                  {insp.status}
                </span>
                {user.role === 'inspector' && insp.status === 'pending' && (
                  <Link
                    to={`/inspections/${insp.id}/report`}
                    className="text-sm bg-dosje-blue text-white px-3 py-1.5 rounded-md hover:bg-dosje-navy"
                  >
                    Submit Report
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
