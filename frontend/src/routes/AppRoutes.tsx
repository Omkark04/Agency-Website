import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { DashboardLayout } from '../pages/dashboard/DashboardLayout';
import { AdminDashboard } from '../pages/dashboard/AdminDashboard';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin', 'team_head', 'team_member', 'client']} />
        }
      >
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<AdminDashboard />} />
          {/* Add more dashboard routes here */}
          <Route path="/dashboard/orders" element={<div>Orders Page</div>} />
          <Route path="/dashboard/services" element={<div>Services Page</div>} />
          <Route path="/dashboard/tasks" element={<div>Tasks Page</div>} />
          <Route path="/dashboard/media" element={<div>Media Page</div>} />
          <Route path="/dashboard/users" element={<div>Users Page</div>} />
          <Route path="/dashboard/analytics" element={<div>Analytics Page</div>} />
        </Route>
      </Route>
      
      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
