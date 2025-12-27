import { Navigate, Route, Routes } from 'react-router-dom';
import ServiceHeadDashboard from './ServiceHeadDashboard';
import Orders from '../admin/Orders';
import Users from '../admin/Users';
import Services from '../admin/Services';
import FormBuilder from '../admin/FormBuilder';
import PriceCards from '../admin/PriceCards';
import Portfolio from '../admin/Portfolio';
import TestimonialsManagement from '../admin/TestimonialsManagement';
import Tasks from '../admin/Tasks';
import Offers from '../admin/Offers';

/**
 * Team Head Dashboard - Uses ServiceHeadDashboard Component
 * 
 * This dashboard shows department-specific data using the service-head-metrics API.
 * All data is filtered by the team head's department.
 * 
 * Note: ProtectedRoute in AppRoutes.tsx already handles role-based access control.
 */
export default function TeamHeadDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Dashboard Home - Service Head Specific */}
        <Route index element={<ServiceHeadDashboard />} />
        
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
        
        {/* Offers - Department offers only (Regular category only) */}
        <Route path="offers/*" element={<Offers />} />
        
        {/* Redirect unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard/service-head" replace />} />
      </Routes>
    </div>
  );
}
