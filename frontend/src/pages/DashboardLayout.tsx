// DashboardLayout.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import { useAuth } from '../hooks/useAuth';
import { FiMenu, FiX } from 'react-icons/fi';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed on mobile
  const { user } = useAuth();
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle swipe gestures
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchEndX.current - touchStartX.current;
    const minSwipeDistance = 50;

    // Swipe from left edge to right (open sidebar)
    if (touchStartX.current < 30 && swipeDistance > minSwipeDistance) {
      setSidebarOpen(true);
    }
    // Swipe from right to left (close sidebar)
    else if (sidebarOpen && swipeDistance < -minSwipeDistance) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (isMobile) {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isMobile, sidebarOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile Header - Glassmorphism Style */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 rounded-xl text-gray-700 hover:bg-white/60 transition-all duration-200 hover:shadow-md active:scale-95"
        >
          {sidebarOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
        </button>
        <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Dashboard
        </div>
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-white/50">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
        </div>
      </div>

      {/* Sidebar Overlay with Blur */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-gray-900/60 backdrop-blur-sm transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar with Animation */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-all duration-300 ease-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            userRole={user?.role || 'client'}
          />
        </div>
      </div>

      {/* Main Content Area with Smooth Transition */}
      <div className={`min-h-screen flex flex-col transition-all duration-300 ease-out ${
        sidebarOpen ? 'lg:ml-72' : 'lg:ml-72'
      }`}>
        {/* Desktop Header - Glassmorphism */}
        <div className="hidden lg:block sticky top-0 z-30">
          <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
            <Header
              title="Dashboard"
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
        </div>

        {/* Main Content with Animation */}
        <main className="flex-1 pt-20 lg:pt-0 transition-all duration-300">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setSidebarOpen(true)}
        className={`lg:hidden fixed bottom-6 right-6 z-30 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 active:scale-95 ${
          sidebarOpen ? 'hidden' : 'block'
        }`}
      >
        <FiMenu className="h-6 w-6" />
      </button>
    </div>
  );
};

export default DashboardLayout;