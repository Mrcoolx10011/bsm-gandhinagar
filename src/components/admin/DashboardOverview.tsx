import React from 'react';
import { Users, Calendar, Heart, MessageSquare, TrendingUp, TrendingDown, Plus, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminStore } from '../../store/adminStore';
import { Link } from 'react-router-dom';

export const DashboardOverview: React.FC = () => {
  const { members, events, donations, inquiries } = useAdminStore();

  const stats = [
    {
      name: 'Total Members',
      value: members.length.toString(),
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/members'
    },
    {
      name: 'Active Events',
      value: events.filter(e => e.status === 'upcoming').length.toString(),
      change: '+5%',
      changeType: 'increase',
      icon: Calendar,
      color: 'bg-green-500',
      link: '/admin/events'
    },
    {
      name: 'Total Donations',
      value: `₹${donations.reduce((sum, d) => d.status === 'completed' ? sum + d.amount : sum, 0).toLocaleString()}`,
      change: '+18%',
      changeType: 'increase',
      icon: Heart,
      color: 'bg-red-500',
      link: '/admin/donations'
    },
    {
      name: 'New Inquiries',
      value: inquiries.filter(i => i.status === 'new').length.toString(),
      change: '-3%',
      changeType: 'decrease',
      icon: MessageSquare,
      color: 'bg-yellow-500',
      link: '/admin/inquiries'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'member',
      message: `New member ${members[0]?.name || 'Rajesh Kumar Sharma'} joined`,
      time: '2 hours ago',
      icon: Users
    },
    {
      id: 2,
      type: 'donation',
      message: `Received ₹${donations[0]?.amount || 5000} donation from ${donations[0]?.donorName || 'Anonymous Donor'}`,
      time: '4 hours ago',
      icon: Heart
    },
    {
      id: 3,
      type: 'event',
      message: `${events[0]?.title || 'Community Health Camp'} event created`,
      time: '6 hours ago',
      icon: Calendar
    },
    {
      id: 4,
      type: 'inquiry',
      message: `New inquiry from ${inquiries[0]?.name || 'Sarah Johnson'}`,
      time: '8 hours ago',
      icon: MessageSquare
    }
  ];

  const quickActions = [
    { name: 'Add Member', icon: Users, link: '/admin/members', color: 'text-blue-600' },
    { name: 'Create Event', icon: Calendar, link: '/admin/events', color: 'text-green-600' },
    { name: 'View Donations', icon: Heart, link: '/admin/donations', color: 'text-red-600' },
    { name: 'Check Messages', icon: MessageSquare, link: '/admin/inquiries', color: 'text-yellow-600' }
  ];

  const frontendLinks = [
    { name: 'View Website', icon: ExternalLink, link: '/', color: 'text-purple-600' },
    { name: 'Members Page', icon: Users, link: '/members', color: 'text-blue-600' },
    { name: 'Events Page', icon: Calendar, link: '/events', color: 'text-green-600' },
    { name: 'Donations Page', icon: Heart, link: '/donations', color: 'text-red-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-primary-100">
          Manage your NGO operations efficiently with our comprehensive admin panel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.changeType === 'increase' ? TrendingUp : TrendingDown;
          
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <Link to={stat.link} className="block">
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`flex items-center text-sm ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendIcon className="w-4 h-4 mr-1" />
                    {stat.change}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.name}
                  to={action.link}
                  className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <Icon className={`w-5 h-5 ${action.color} mr-3 group-hover:scale-110 transition-transform`} />
                  <span className="text-sm font-medium text-gray-900">{action.name}</span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Frontend Access */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Frontend Pages Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {frontendLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <Icon className={`w-5 h-5 ${link.color} mr-2 group-hover:scale-110 transition-transform`} />
                <span className="text-sm font-medium text-gray-900">{link.name}</span>
              </a>
            );
          })}
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Growth</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chart visualization would be here</p>
              <p className="text-sm text-gray-500">Showing member growth over time</p>
            </div>
          </div>
        </motion.div>

        {/* Donation Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Chart visualization would be here</p>
              <p className="text-sm text-gray-500">Showing donation trends and campaigns</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};