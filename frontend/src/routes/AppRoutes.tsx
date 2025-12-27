import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import DashboardLayout from '../pages/DashboardLayout';
import ClientDashboard from '../pages/dashboard/client/clientdashboard';
import ServicesPage from '../pages/dashboard/client/ServicesPage';
import MyProjects from '../pages/dashboard/client/MyProjects';
import Notifications from '../pages/dashboard/client/Notifications';
import Documents from '../pages/dashboard/client/Documents';
import OrdersPage from '../pages/dashboard/client/OrdersPage';
import OAuthCallback from '@/pages/auth/OAuthCallback';
// Pages
import { LandingPage } from '../pages/landing/LandingPage';
import Portfolio from '@/pages/dashboard/admin/Portfolio';
import OffersPage from '@/pages/dashboard/client/OffersPage';
// Admin Pages
import AdminDashboard from '../pages/dashboard/admin/AdminDashboard';
import SpecialOffersPage from '../pages/dashboard/admin/SpecialOffersPage';
import Offers from '../../src/pages/dashboard/admin/Offers';
import Departments from '../pages/dashboard/admin/Departments';
import Services from '../pages/dashboard/admin/Services';
import PriceCards from '../pages/dashboard/admin/PriceCards';
import Users from '../pages/dashboard/admin/Users';
import Orders from '../pages/dashboard/admin/Orders';
import Tasks from '../pages/dashboard/admin/Tasks';
import MediaLibrary from '../pages/dashboard/admin/MediaLibrary';
import Estimations from '../pages/dashboard/admin/Estimations';
import Invoices from '../pages/dashboard/admin/Invoices';
import Analytics from '../pages/Analytics';
// Team Head - NEW: Reuses admin components
import TeamHeadDashboard from '@/pages/dashboard/teamhead/TeamHeadDashboard';
//Team Member
import TeamMemberDashboard from '@/pages/dashboard/teammember/TeamMemberDashboard';
import TestimonialsManagement from '../pages/dashboard/admin/TestimonialsManagement';
import ContactsManagement from '../pages/dashboard/admin/ContactsManagement';
import FormBuilder from '../pages/dashboard/admin/FormBuilder';
import OrdersDetailPage from '../pages/dashboard/client/OrdersDetailPage';
import OrderManagementPage from '../pages/dashboard/admin/OrderManagementPage';
import PortfolioPage from '../pages/PortfolioPage';
// Profile Pages
import AdminProfile from '../pages/dashboard/admin/Profile';
import ClientProfile from '../pages/dashboard/client/Profile';
import ServiceHeadProfile from '../pages/dashboard/teamhead/Profile';
import TeamMemberProfile from '../pages/dashboard/teammember/Profile';

// Support Pages
import HelpCenter from '../pages/support/HelpCenter';
import PrivacyPolicy from '../pages/support/PrivacyPolicy';
import TermsOfService from '../pages/support/TermsOfService';
import FAQ from '../pages/support/FAQ';
import Blog from '../pages/Blog';
import BlogDetail from '../pages/BlogDetail';

// Blog Management
import BlogManagement from '../pages/dashboard/admin/BlogManagement';
import BlogEditor from '../components/blog/BlogEditor';

// New Pages
import { NotificationsPage } from '../pages/Notifications';
import SettingsPage from '../pages/dashboard/shared/SettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>

      {/* ✅ PUBLIC */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:id" element={<BlogDetail />} />
      <Route path="/offers" element={<OffersPage />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />

      {/* ✅ PROTECTED DASHBOARD WITH LAYOUT */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin', 'service_head', 'team_member', 'client']} />
        }
      >
        <Route element={<ProtectedRoute allowedRoles={['client', 'admin']} />}>
          <Route path='/client-dashboard' element={<ClientDashboard />}>
            <Route path='/client-dashboard/services' element={<ServicesPage />} />
            <Route path='/client-dashboard/my-projects' element={<MyProjects />} />
            <Route path='/client-dashboard/orders' element={<OrdersPage />} />
            <Route path='/client-dashboard/orders/:orderId' element={<OrdersDetailPage />} />
            <Route path='/client-dashboard/notifications' element={<Notifications />} />
            <Route path='/client-dashboard/documents' element={<Documents />} />
            <Route path='/client-dashboard/profile' element={<ClientProfile />} />
            <Route path='/client-dashboard/settings' element={<SettingsPage />} />
            <Route path="/client-dashboard/offers" element={<OffersPage />} />
          </Route>
        </Route>
        
        {/* ✅ SERVICE HEAD (Team Head) - Uses DashboardLayout and Admin Components */}
        <Route element={<ProtectedRoute allowedRoles={['team_head', 'service_head', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/service-head/*" element={<TeamHeadDashboard />} />
            <Route path="/dashboard/service-head/profile" element={<ServiceHeadProfile />} />
            <Route path="/dashboard/service-head/estimations" element={<Estimations />} />
            <Route path="/dashboard/service-head/invoices" element={<Invoices />} />
            <Route path="/dashboard/service-head/blogs" element={<BlogManagement />} />
            <Route path="/dashboard/service-head/blogs/new" element={<BlogEditor />} />
            <Route path="/dashboard/service-head/blogs/:id/edit" element={<BlogEditor />} />
            <Route path="/dashboard/forms/new" element={<FormBuilder />} />
            <Route path="/dashboard/forms/:id" element={<FormBuilder />} />
            <Route path="/dashboard/orders/:orderId" element={<OrderManagementPage />} />
            <Route path="/dashboard/service-head/settings" element={<SettingsPage />} />
          </Route>
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['team_member', 'admin']} />}>
          <Route path='/team-member-dashboard' element={<TeamMemberDashboard />} />
          <Route path='/team-member-dashboard/profile' element={<TeamMemberProfile />} />
          <Route path='/team-member-dashboard/settings' element={<SettingsPage />} />
        </Route>

        {/* ✅ ALL AUTHENTICATED USERS */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />

        {/* ✅ ADMIN ONLY */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/dashboard/profile" element={<AdminProfile />} />
            <Route path="/dashboard/portfolio" element={<Portfolio />} />
            <Route path="/dashboard/departments" element={<Departments />} />
            <Route path="/dashboard/offers" element={<Offers />} />
            <Route path="/dashboard/services" element={<Services />} />
            <Route path="/dashboard/price-cards" element={<PriceCards />} />
            <Route path="/dashboard/users" element={<Users />} />
            <Route path="/dashboard/orders" element={<Orders />} />
            <Route path="/dashboard/tasks" element={<Tasks />} />
            <Route path="/dashboard/media" element={<MediaLibrary />} />
            <Route path="/dashboard/special-orders" element={<SpecialOffersPage />} />
            <Route path="/dashboard/testimonials" element={<TestimonialsManagement />} />
            <Route path="/dashboard/contacts" element={<ContactsManagement />} />
            <Route path="/dashboard/forms/new" element={<FormBuilder />} />
            <Route path="/dashboard/forms/:id" element={<FormBuilder />} />
            <Route path="/dashboard/estimations" element={<Estimations />} />
            <Route path="/dashboard/invoices" element={<Invoices />} />
            <Route path="/dashboard/blogs" element={<BlogManagement />} />
            <Route path="/dashboard/blogs/new" element={<BlogEditor />} />
            <Route path="/dashboard/blogs/:id/edit" element={<BlogEditor />} />
            <Route path="/dashboard/orders/:orderId" element={<OrderManagementPage />} />
            <Route path="/dashboard/analytics" element={<Analytics />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
          </Route>

        </Route>
      </Route>

      {/* ✅ FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};
