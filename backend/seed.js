// seed.js — initial mock data for the DoSJE Monitoring platform
const bcrypt = require('bcryptjs');

const hash = (pwd) => bcrypt.hashSync(pwd, 8);

module.exports = {
  users: [
    { id: 'u1', name: 'Admin (DoSJE HQ)', email: 'admin@dosje.gov.in', password: hash('admin123'), role: 'admin' },
    { id: 'u2', name: 'Ritu Sharma', email: 'pmu1@dosje.gov.in', password: hash('pmu123'), role: 'pmu' },
    { id: 'u3', name: 'Arjun Das', email: 'inspector1@dosje.gov.in', password: hash('insp123'), role: 'inspector' },
    { id: 'u4', name: 'Priya Nair', email: 'inspector2@dosje.gov.in', password: hash('insp123'), role: 'inspector' },
    { id: 'u5', name: 'Institute Incharge - Kolkata Skill Centre', email: 'incharge1@dosje.gov.in', password: hash('inch123'), role: 'incharge' }
  ],
  institutes: [
    { id: 'inst1', name: 'Kolkata Skill Development Centre', scheme: 'PM-DAKSH', district: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, inchargeId: 'u5', status: 'active', beneficiaries: 120 },
    { id: 'inst2', name: 'Howrah Divyang Rehabilitation NGO', scheme: 'DDRS', district: 'Howrah', state: 'West Bengal', lat: 22.5958, lng: 88.2636, inchargeId: null, status: 'active', beneficiaries: 85 },
    { id: 'inst3', name: 'Siliguri SC/ST Hostel', scheme: 'Hostel Scheme', district: 'Siliguri', state: 'West Bengal', lat: 26.7271, lng: 88.3953, inchargeId: null, status: 'active', beneficiaries: 200 },
    { id: 'inst4', name: 'Durgapur Senior Citizen Care Home', scheme: 'IPSrC', district: 'Durgapur', state: 'West Bengal', lat: 23.5204, lng: 87.3119, inchargeId: null, status: 'flagged', beneficiaries: 60 }
  ],
  inspections: [
    {
      id: 'insp1',
      institureId: 'inst1',
      instituteId: 'inst1',
      inspectorId: 'u3',
      assignedBy: 'AI-Random-Assignment',
      status: 'pending',
      scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      createdAt: new Date().toISOString(),
      report: null
    }
  ],
  cctvFeeds: [
    { id: 'cam1', instituteId: 'inst1', label: 'Kolkata Skill Centre - Main Hall', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', status: 'live' },
    { id: 'cam2', instituteId: 'inst2', label: 'Howrah NGO - Entrance', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', status: 'live' },
    { id: 'cam3', instituteId: 'inst3', label: 'Siliguri Hostel - Dining Area', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', status: 'offline' },
    { id: 'cam4', instituteId: 'inst4', label: 'Durgapur Care Home - Courtyard', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', status: 'live' }
  ],
  attendanceLogs: [],
  anomalies: []
};
