import { Link } from 'react-router-dom';
import { 
  Home, Folder, Settings, CreditCard, ChevronLeft, Code
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '#', icon: Home, current: true },
  { name: 'My Projects', href: '#', icon: Folder, current: false },
  { name: 'Payments', href: '#', icon: CreditCard, current: false },
  { name: 'Services', href: '#', icon: Code, current: false },
  { name: 'Settings', href: '#', icon: Settings, current: false },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
}

export default function Sidebar({ isOpen, onToggle, mobileOpen }: SidebarProps) {
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
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                item.current
                  ? 'bg-gradient-to-r from-teal-50 to-blue-50 text-teal-600 border-l-4 border-teal-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 flex-shrink-0 h-5 w-5 ${
                  item.current ? 'text-teal-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
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