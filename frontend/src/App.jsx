import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CCTVFeeds from './pages/CCTVFeeds.jsx';
import VideoCall from './pages/VideoCall.jsx';
import Inspections from './pages/Inspections.jsx';
import SubmitReport from './pages/SubmitReport.jsx';
import RandomAssignment from './pages/RandomAssignment.jsx';
import Analytics from './pages/Analytics.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/cctv" element={<ProtectedRoute><CCTVFeeds /></ProtectedRoute>} />
        <Route path="/video-call" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
        <Route path="/inspections" element={<ProtectedRoute><Inspections /></ProtectedRoute>} />
        <Route
          path="/inspections/:id/report"
          element={
            <ProtectedRoute roles={['inspector']}>
              <SubmitReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assignment"
          element={
            <ProtectedRoute roles={['admin', 'pmu']}>
              <RandomAssignment />
            </ProtectedRoute>
          }
        />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
