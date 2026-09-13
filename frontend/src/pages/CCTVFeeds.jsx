import React, { useEffect, useState } from 'react';
import api from '../api.js';

export default function CCTVFeeds() {
  const [feeds, setFeeds] = useState([]);

  useEffect(() => {
    api.get('/cctv/feeds').then(({ data }) => setFeeds(data));
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-dosje-navy mb-1">Live CCTV Feed Integration</h1>
      <p className="text-sm text-gray-500 mb-6">
        Simulated live feeds from project/institute cameras (demo streams — wire up real RTSP/HLS URLs from on-site
        CCTV in production).
      </p>

      <div className="grid md:grid-cols-2 gap-5">
        {feeds.map((f) => (
          <div key={f.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="aspect-video bg-black relative">
              {f.status === 'live' ? (
                <video className="w-full h-full object-cover" src={f.streamUrl} autoPlay muted loop playsInline />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                  Feed offline — no signal
                </div>
              )}
              <span
                className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded ${
                  f.status === 'live' ? 'bg-dosje-red text-white animate-pulse' : 'bg-gray-600 text-white'
                }`}
              >
                {f.status === 'live' ? '● LIVE' : 'OFFLINE'}
              </span>
            </div>
            <div className="p-3">
              <p className="font-medium text-dosje-navy text-sm">{f.label}</p>
              <p className="text-xs text-gray-400">Camera ID: {f.id}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
