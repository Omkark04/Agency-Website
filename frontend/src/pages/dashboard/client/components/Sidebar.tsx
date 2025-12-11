import { Link } from 'react-router-dom';
import { 
  Home, Folder, Settings, CreditCard, ChevronLeft,ChevronRight, Code
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
}
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  mobileOpen: boolean;
}

export default function Sidebar({ isOpen,onClose ,onToggle, userRole ,mobileOpen }: SidebarProps) {
  const navigation = [
    { title: 'Dashboard', path: '/client-dashboard', roles: ['admin','client'], icon: Home, gradient: 'from-blue-500 to-indigo-600', current: true },
    { title: 'My Projects', path: '/client-dashboard/my-projects', roles: ['admin','client'], icon: Folder, gradient: 'from-blue-500 to-indigo-600', current: false },
    { title: 'Payments', path: '/client-dashboard', roles: ['admin','client'], icon: CreditCard, gradient: 'from-blue-500 to-indigo-600' , current: false},
    { title: 'Services', path: '/client-dashboard', roles: ['admin','client'], icon: Code, gradient: 'from-blue-500 to-indigo-600' , current: false},
    { title: 'Settins', path: '/client-dashboard', roles: ['admin','client'], icon: Settings, gradient: 'from-blue-500 to-indigo-600', current: false },
  ];
  const filteredMenuItems = navigation.filter(item =>
      item.roles.includes(userRole)
    );
  return (
    <div className={`fixed inset-y-0 left-0 z-40 w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${mobileOpen ? 'translate-x-0' : ''} lg:translate-x-0 transition-transform duration-300 ease-in-out bg-white border-r border-gray-200 flex flex-col`}>
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
            UW
          </div>
          <h1 className="ml-3 text-xl font-bold text-gray-900">UdyogWorks</h1>
        </div>
        
        {/* Navigation */}
          <nav className="px-4 py-6 space-y-1.5">
            {filteredMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
  
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-white/15 to-white/5 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b ${item.gradient} rounded-r-full`} />
                  )}
  
                  <div className={`p-2.5 rounded-xl ${
                    isActive ? `bg-gradient-to-br ${item.gradient}` : 'bg-white/5'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
  
                  <span className="flex-1 font-semibold text-[15px]">
                    {item.title}
                  </span>
  
                  <ChevronRight className={`${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                </Link>
              );
            })}
          </nav>
      </div>
      
      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <img
              className="h-10 w-10 rounded-full"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="User profile"
            />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">John Doe</p>
            <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">View profile</p>
          </div>
          <button
            type="button"
            className="ml-auto flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-gray-500"
            onClick={onToggle}
          >
            <span className="sr-only">Collapse sidebar</span>
            <ChevronLeft className={`h-5 w-5 transition-transform ${isOpen ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}