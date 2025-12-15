import { Navigate, Route, Routes } from 'react-router-dom';
import AdminDashboard from '../admin/AdminDashboard';
import Orders from '../admin/Orders';
import Users from '../admin/Users';
import Services from '../admin/Services';
import FormBuilder from '../admin/FormBuilder';
import PriceCards from '../admin/PriceCards';
import Portfolio from '../admin/Portfolio';
import TestimonialsManagement from '../admin/TestimonialsManagement';
import Tasks from '../admin/Tasks';

/**
 * Team Head Dashboard - Reuses Admin Components with Department Filtering
 * 
 * This dashboard shows the same UI as admin but filters data by the team head's department.
 * All filtering is done via API query parameters based on the user's department.
 * 
 * Note: ProtectedRoute in AppRoutes.tsx already handles role-based access control.
 */
export default function TeamHeadDashboard() {
  // Team Head sees same components as Admin, but data is filtered by their department
  // The filtering happens at the API level using query parameters
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Dashboard Home */}
        <Route index element={<AdminDashboard />} />
        
        {/* Orders - Complete orders for department services only */}
        <Route path="orders/*" element={<Orders />} />
        
        {/* Team Members */}
        <Route path="team-members/*" element={<Users />} />
        
        {/* Services - Department services only */}
        <Route path="services/*" element={<Services />} />
        
        {/* Form Builder - For department services */}
        <Route path="forms/*" element={<FormBuilder />} />
        
        {/* Price Cards - For department services */}
        <Route path="price-cards/*" element={<PriceCards />} />
        
        {/* Portfolio - Department projects */}
        <Route path="portfolio/*" element={<Portfolio />} />
        
        {/* Testimonials - All testimonials (can approve/decline) */}
        <Route path="testimonials" element={<TestimonialsManagement />} />
        
        {/* Tasks - Department tasks */}
        <Route path="tasks/*" element={<Tasks />} />
        
        {/* Redirect unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard/team-head" replace />} />
      </Routes>
    </div>
  );
}
