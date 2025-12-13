import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import DashboardLayout from '../pages/DashboardLayout';
import ClientDashboard from '../pages/dashboard/client/clientdashboard';
import ServicesPage from '../pages/dashboard/client/ServicesPage';
import MyProjects from '../pages/dashboard/client/MyProjects';
import OrdersPage from '../pages/dashboard/client/OrdersPage';
import Notifications from '../pages/dashboard/client/Notifications';
// Pages
import { LandingPage } from '../pages/landing/LandingPage';
import Portfolio from '@/pages/dashboard/admin/Portfolio';
// Admin Pages
import AdminDashboard from '../pages/dashboard/admin/AdminDashboard';
import Offers from '../../src/pages/dashboard/admin/Offers';
import Departments from '../pages/dashboard/admin/Departments';
import Services from '../pages/dashboard/admin/Services';
import PriceCards from '../pages/dashboard/admin/PriceCards';
import Users from '../pages/dashboard/admin/Users';
import Orders from '../pages/dashboard/admin/Orders';
import Tasks from '../pages/dashboard/admin/Tasks';
import MediaLibrary from '../pages/dashboard/admin/MediaLibrary';
import TeamHeadDashboard from '@/pages/dashboard/teamhead/Teamhead';
import TaskManager from '@/pages/dashboard/teamhead/TaskManager';
import SubmissionsApproval from '@/pages/dashboard/teamhead/SubmissionsApproval';
//Team Member
import TeamMemberDashboard from '@/pages/dashboard/teammember/TeamMemberDashboard';
import TeamMemberPage from '@/pages/dashboard/teamhead/TeamMember';
import TestimonialsManagement from '../pages/dashboard/admin/TestimonialsManagement';
import ContactsManagement from '../pages/dashboard/admin/ContactsManagement';
import FormBuilder from '../pages/dashboard/admin/FormBuilder';

// New Pages
import { NotificationsPage } from '../pages/Notifications';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>

      {/* ✅ PUBLIC */}
      <Route path="/" element={<LandingPage />} />

      {/* ✅ PROTECTED DASHBOARD WITH LAYOUT */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin', 'team_head', 'service_head', 'team_member', 'client']} />
        }
      >
        <Route element={<ProtectedRoute allowedRoles={['client', 'admin']} />}>
          <Route path='/client-dashboard' element={<ClientDashboard />}>
            <Route path='/client-dashboard/services' element={<ServicesPage />} />
            <Route path='/client-dashboard/my-projects' element={<MyProjects />} />
            <Route path='/client-dashboard/orders' element={<OrdersPage />} />
            <Route path='/client-dashboard/notifications' element={<Notifications />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['team_head', 'service_head', 'admin']} />}>
          <Route path='/team-head-dashboard' element={<TeamHeadDashboard />}>
            <Route path='/team-head-dashboard/task-manager' element={<TaskManager />} />
            <Route path='/team-head-dashboard/team-members' element={<TeamMemberPage />} />
            <Route path='/team-head-dashboard/submissions-approval' element={<SubmissionsApproval />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['team_member', 'admin']} />}>
          <Route path='/team-member-dashboard' element={<TeamMemberDashboard />} />
        </Route>

        {/* ✅ ALL AUTHENTICATED USERS */}
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* ✅ ADMIN ONLY */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/dashboard/portfolio" element={<Portfolio />} />
            <Route path="/dashboard/departments" element={<Departments />} />
            <Route path="/dashboard/offers" element={<Offers />} />
            <Route path="/dashboard/services" element={<Services />} />
            <Route path="/dashboard/price-cards" element={<PriceCards />} />
            <Route path="/dashboard/users" element={<Users />} />
            <Route path="/dashboard/orders" element={<Orders />} />
            <Route path="/dashboard/tasks" element={<Tasks />} />
            <Route path="/dashboard/media" element={<MediaLibrary />} />
            <Route path="/dashboard/testimonials" element={<TestimonialsManagement />} />
            <Route path="/dashboard/contacts" element={<ContactsManagement />} />
            <Route path="/dashboard/forms/new" element={<FormBuilder />} />
            <Route path="/dashboard/forms/:id" element={<FormBuilder />} />
          </Route>

        </Route>
      </Route>

      {/* ✅ FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};
