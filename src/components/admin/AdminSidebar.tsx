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
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 lg:shadow-none lg:border-r lg:border-gray-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to="/admin" className="flex items-center space-x-3">
            <img 
              src="/bsm-logo.png" 
              alt="BSM Logo" 
              className="w-8 h-8 object-contain"
            />
            <div>
              <span className="text-lg font-bold text-blue-900">BSM Gandhinagar</span>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.username || 'Admin'}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>

          {/* Admin Navigation */}
          <nav className="flex-1 px-4 py-6">
            <div className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Admin Functions
              </h3>
              <ul className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={onClose}
                        className={`
                          w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                          ${active
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <Icon className={`mr-3 h-5 w-5 ${
                          active ? 'text-blue-500' : 'text-gray-400'
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
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Frontend Pages
              </h3>
              <ul className="space-y-1">
                {frontendPages.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900 group"
                      >
                        <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                        <span className="flex-1">{item.name}</span>
                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};