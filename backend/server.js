// server.js — DoSJE Smart Real-Time Monitoring & Inspection backend
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { Server } = require('socket.io');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = 'dosje-hackathon-secret-change-in-production';
const PORT = process.env.PORT || 4000;

// ---------- DB setup (lowdb, JSON file — zero external DB needed) ----------
const dbFile = path.join(__dirname, 'db.json');
if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify(require('./seed.js'), null, 2));
}
const adapter = new FileSync(dbFile);
const db = low(adapter);
db.defaults({ users: [], institutes: [], inspections: [], cctvFeeds: [], attendanceLogs: [], anomalies: [] }).write();

// ---------- Uploads (evidence photos/videos for inspection reports) ----------
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
const upload = multer({ storage: multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`)
})});

// ---------- App setup ----------
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(uploadsDir));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// ---------- Auth middleware ----------
function auth(requiredRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No token provided' });
    const token = header.replace('Bearer ', '');
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ error: 'Insufficient role' });
      }
      req.user = payload;
      next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

// ================= AUTH =================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.get('users').find({ email }).value();
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

// ================= INSTITUTES =================
app.get('/api/institutes', auth(), (req, res) => {
  res.json(db.get('institutes').value());
});

app.get('/api/institutes/:id', auth(), (req, res) => {
  const inst = db.get('institutes').find({ id: req.params.id }).value();
  if (!inst) return res.status(404).json({ error: 'Not found' });
  res.json(inst);
});

// ================= CCTV FEEDS =================
app.get('/api/cctv/feeds', auth(), (req, res) => {
  res.json(db.get('cctvFeeds').value());
});

// ================= RANDOM VC (Video Conferencing) =================
// Simulates the "random connectivity" requirement: system randomly selects a live
// institute + a staff/beneficiary contact and initiates a surprise VC session.
app.post('/api/vc/random-connect', auth(['admin', 'pmu']), (req, res) => {
  const institutes = db.get('institutes').value();
  const target = institutes[Math.floor(Math.random() * institutes.length)];
  const session = {
    id: uuidv4(),
    instituteId: target.id,
    instituteName: target.name,
    initiatedBy: req.user.name,
    startedAt: new Date().toISOString(),
    roomCode: `VC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  };
  io.emit('vc:incoming', session); // notify all connected dashboards / institute clients
  res.json(session);
});

// ================= INSPECTIONS =================
app.get('/api/inspections', auth(), (req, res) => {
  let list = db.get('inspections').value();
  if (req.user.role === 'inspector') list = list.filter(i => i.inspectorId === req.user.id);
  res.json(list);
});

// AI/automation-based random assignment of inspection duty
app.post('/api/inspections/random-assign', auth(['admin', 'pmu']), (req, res) => {
  const institutes = db.get('institutes').value();
  const inspectors = db.get('users').filter({ role: 'inspector' }).value();
  if (!institutes.length || !inspectors.length) {
    return res.status(400).json({ error: 'No institutes or inspectors available' });
  }
  const institute = institutes[Math.floor(Math.random() * institutes.length)];
  const inspector = inspectors[Math.floor(Math.random() * inspectors.length)];
  const inspection = {
    id: uuidv4(),
    instituteId: institute.id,
    inspectorId: inspector.id,
    assignedBy: 'AI-Random-Assignment',
    status: 'pending',
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date().toISOString(),
    report: null
  };
  db.get('inspections').push(inspection).write();
  io.emit('inspection:assigned', {
    ...inspection,
    instituteName: institute.name,
    inspectorName: inspector.name
  });
  res.json(inspection);
});

// Submit a geo-tagged inspection report with photo/video evidence
app.post('/api/inspections/:id/report', auth(['inspector']), upload.array('evidence', 5), (req, res) => {
  const inspection = db.get('inspections').find({ id: req.params.id }).value();
  if (!inspection) return res.status(404).json({ error: 'Inspection not found' });
  if (inspection.inspectorId !== req.user.id) return res.status(403).json({ error: 'Not your assignment' });

  const { lat, lng, notes, complianceScore, attendanceCount } = req.body;
  const evidenceFiles = (req.files || []).map(f => `/uploads/${f.filename}`);

  const report = {
    submittedAt: new Date().toISOString(),
    geo: { lat: parseFloat(lat), lng: parseFloat(lng) },
    notes,
    complianceScore: complianceScore ? parseInt(complianceScore, 10) : null,
    attendanceCount: attendanceCount ? parseInt(attendanceCount, 10) : null,
    evidence: evidenceFiles
  };

  db.get('inspections').find({ id: req.params.id }).assign({ status: 'completed', report }).write();

  // Simple anomaly heuristic: very low compliance or attendance mismatch flags the institute
  if (report.complianceScore !== null && report.complianceScore < 40) {
    const anomaly = {
      id: uuidv4(),
      instituteId: inspection.instituteId,
      type: 'low_compliance',
      detail: `Inspection compliance score ${report.complianceScore}/100`,
      severity: 'high',
      createdAt: new Date().toISOString()
    };
    db.get('anomalies').push(anomaly).write();
    io.emit('anomaly:new', anomaly);
  }

  io.emit('inspection:completed', { id: inspection.id, instituteId: inspection.instituteId, report });
  res.json({ ...inspection, status: 'completed', report });
});

// ================= ANALYTICS / DASHBOARD =================
app.get('/api/analytics/summary', auth(), (req, res) => {
  const institutes = db.get('institutes').value();
  const inspections = db.get('inspections').value();
  const anomalies = db.get('anomalies').value();
  const attendanceLogs = db.get('attendanceLogs').value();

  res.json({
    totalInstitutes: institutes.length,
    flaggedInstitutes: institutes.filter(i => i.status === 'flagged').length,
    totalInspections: inspections.length,
    pendingInspections: inspections.filter(i => i.status === 'pending').length,
    completedInspections: inspections.filter(i => i.status === 'completed').length,
    totalAnomalies: anomalies.length,
    recentAnomalies: anomalies.slice(-10).reverse(),
    attendanceTrend: attendanceLogs.slice(-20)
  });
});

app.get('/api/institutes-full', auth(), (req, res) => {
  const institutes = db.get('institutes').value();
  const users = db.get('users').value();
  res.json(institutes.map(i => ({
    ...i,
    incharge: users.find(u => u.id === i.inchargeId) || null
  })));
});

// ================= REAL-TIME SIMULATION ENGINE =================
// Periodically simulates attendance pings and AI anomaly detection so the
// "real-time monitoring dashboard" has live data to display without needing
// real IoT/CCTV hardware wired up for the demo.
function simulateLiveData() {
  const institutes = db.get('institutes').value();
  if (!institutes.length) return;
  const inst = institutes[Math.floor(Math.random() * institutes.length)];
  const attendance = Math.floor(Math.random() * (inst.beneficiaries || 100));
  const entry = {
    id: uuidv4(),
    instituteId: inst.id,
    instituteName: inst.name,
    attendance,
    expected: inst.beneficiaries,
    timestamp: new Date().toISOString()
  };
  db.get('attendanceLogs').push(entry).write();
  io.emit('attendance:update', entry);

  // Random chance of an AI-flagged anomaly (proxy attendance / camera tampering, etc.)
  if (Math.random() < 0.15) {
    const types = ['proxy_attendance_suspected', 'camera_feed_interrupted', 'attendance_mismatch'];
    const anomaly = {
      id: uuidv4(),
      instituteId: inst.id,
      instituteName: inst.name,
      type: types[Math.floor(Math.random() * types.length)],
      severity: Math.random() < 0.3 ? 'high' : 'medium',
      createdAt: new Date().toISOString()
    };
    db.get('anomalies').push(anomaly).write();
    io.emit('anomaly:new', anomaly);
  }
}
setInterval(simulateLiveData, 6000);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

server.listen(PORT, () => {
  console.log(`\n✅ DoSJE Monitoring backend running at http://localhost:${PORT}`);
  console.log(`   Socket.io live on the same port.\n`);
});
