import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Heart, 
  MessageSquare, 
  Settings,
  X,
  LogOut,
  ExternalLink,
  Home,
  Phone,
  DollarSign,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Members', href: '/admin/members', icon: Users },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Campaigns', href: '/admin/campaigns', icon: DollarSign },
  { name: 'Donations', href: '/admin/donations', icon: Heart },
  { name: 'Posts', href: '/admin/posts', icon: Edit3 },
  { name: 'Messages', href: '/admin/inquiries', icon: MessageSquare },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const frontendPages = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Donations', href: '/donations', icon: DollarSign },
  { name: 'Posts', href: '/posts', icon: Edit3 },
  { name: 'Contact', href: '/contact', icon: Phone },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose}></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 lg:shadow-lg lg:border-r lg:border-gray-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-24 px-6 border-b border-gray-200 bg-gradient-to-r from-orange-600 to-red-600">
          <Link to="/admin" className="flex items-center space-x-4">
            <img 
              src="/bihar-cultural-logo.png" 
              alt="Bihar Sanskritik Mandal Logo" 
              className="w-20 h-20 rounded-xl object-contain"
            />
            <div>
              <span className="text-lg font-bold text-white">Bihar Sanskritik Mandal</span>
              <p className="text-xs text-orange-100">Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-white hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* User Info */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.username || 'admin'}
                </p>
                <p className="text-xs text-orange-600 font-medium">Administrator</p>
              </div>
            </div>
          </div>

          {/* Admin Navigation */}
          <nav className="flex-1 px-4 py-6 bg-gray-50">
            <div className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-orange-600 uppercase tracking-wider mb-4 flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                Admin Functions
              </h3>
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={onClose}
                        className={`
                          w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                          ${active
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                            : 'text-gray-700 hover:bg-white hover:text-orange-600 hover:shadow-md hover:transform hover:scale-102'
                          }
                        `}
                      >
                        <Icon className={`mr-3 h-5 w-5 ${
                          active ? 'text-white' : 'text-orange-500'
                        }`} />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Frontend Pages */}
            <div className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-red-600 uppercase tracking-wider mb-4 flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Frontend Pages
              </h3>
              <ul className="space-y-2">
                {frontendPages.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-gray-700 hover:bg-white hover:text-red-600 hover:shadow-md hover:transform hover:scale-102 group"
                      >
                        <Icon className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600" />
                        <span className="flex-1">{item.name}</span>
                        <ExternalLink className="h-4 w-4 text-red-400 group-hover:text-red-600" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-500 group-hover:text-red-500" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
