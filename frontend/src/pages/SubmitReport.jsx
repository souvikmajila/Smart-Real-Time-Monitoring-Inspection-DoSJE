import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js';

export default function SubmitReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [geo, setGeo] = useState(null);
  const [geoError, setGeoError] = useState('');
  const [notes, setNotes] = useState('');
  const [complianceScore, setComplianceScore] = useState(80);
  const [attendanceCount, setAttendanceCount] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setGeoError(err.message || 'Could not fetch location — allow location access to geo-tag this report.')
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!geo) {
      setError('Location not captured yet. Please allow location access and retry.');
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('lat', geo.lat);
      form.append('lng', geo.lng);
      form.append('notes', notes);
      form.append('complianceScore', complianceScore);
      form.append('attendanceCount', attendanceCount);
      Array.from(files).forEach((f) => form.append('evidence', f));

      await api.post(`/inspections/${id}/report`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/inspections');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-dosje-navy mb-1">Submit Inspection Report</h1>
      <p className="text-sm text-gray-500 mb-6">Geo-tagged, with live photo/video evidence capture.</p>

      <div className="bg-white border rounded-lg p-4 mb-5 text-sm">
        <p className="font-medium text-gray-700 mb-1">📍 Captured Location</p>
        {geo ? (
          <p className="text-dosje-green">{geo.lat.toFixed(5)}, {geo.lng.toFixed(5)}</p>
        ) : geoError ? (
          <p className="text-dosje-red">{geoError}</p>
        ) : (
          <p className="text-gray-400">Fetching current location…</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-lg p-5">
        <div>
          <label className="text-sm font-medium text-gray-700">Inspection Notes</label>
          <textarea
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observations, compliance issues, beneficiary feedback…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Compliance Score (0-100)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
              value={complianceScore}
              onChange={(e) => setComplianceScore(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Attendance Count Verified</label>
            <input
              type="number"
              min="0"
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
              value={attendanceCount}
              onChange={(e) => setAttendanceCount(e.target.value)}
              placeholder="e.g. 42"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Photo/Video Evidence</label>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            capture="environment"
            className="mt-1 w-full text-sm"
            onChange={(e) => setFiles(e.target.files)}
          />
        </div>

        {error && <p className="text-sm text-dosje-red">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-dosje-blue hover:bg-dosje-navy text-white font-medium py-2.5 rounded-md disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
