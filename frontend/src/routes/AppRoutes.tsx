import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import DashboardLayout from '../pages/DashboardLayout';

// Auth
import Login from '../pages/Login';
import Register from '../pages/Register';

// Client
import Home from '../pages/dashboard/client/Home';

// Admin Pages
import AdminDashboard from '../pages/dashboard/admin/AdminDashboard';
import Departments from '../pages/dashboard/admin/Departments';
import Services from '../pages/dashboard/admin/Services';
import PriceCards from '../pages/dashboard/admin/PriceCards';
import Users from '../pages/dashboard/admin/Users';
import Orders from '../pages/dashboard/admin/Orders';
import Tasks from '../pages/dashboard/admin/Tasks';
import MediaLibrary from '../pages/dashboard/admin/MediaLibrary';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>

      {/* ✅ PUBLIC */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ✅ PROTECTED DASHBOARD WITH LAYOUT */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin', 'team_head', 'team_member', 'client']} />
        }
      >
        <Route element={<DashboardLayout />}>

          {/* ✅ ADMIN ONLY */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/dashboard/departments" element={<Departments />} />
            <Route path="/dashboard/services" element={<Services />} />
            <Route path="/dashboard/price-cards" element={<PriceCards />} />
            <Route path="/dashboard/users" element={<Users />} />
            <Route path="/dashboard/orders" element={<Orders />} />
            <Route path="/dashboard/tasks" element={<Tasks />} />
            <Route path="/dashboard/media" element={<MediaLibrary />} />
          </Route>

        </Route>
      </Route>

      {/* ✅ FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};
