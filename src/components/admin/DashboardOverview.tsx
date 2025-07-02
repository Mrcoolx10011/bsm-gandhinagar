import React from 'react';
import { Users, Calendar, Heart, MessageSquare, TrendingUp, TrendingDown, ExternalLink, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDashboardData } from '../../hooks/useDashboardData';
import { Charts } from './Charts';

export const DashboardOverview: React.FC = () => {
  const { stats, recentActivities, activitiesLoading, refreshData } = useDashboardData();

  // Create stats cards using real-time data
  const statsCards = [
    {
      name: 'Total Members',
      value: stats.loading ? '...' : stats.totalMembers.toString(),
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/members'
    },
    {
      name: 'Active Events',
      value: stats.loading ? '...' : stats.activeEvents.toString(),
      change: '+5%',
      changeType: 'increase',
      icon: Calendar,
      color: 'bg-green-500',
      link: '/admin/events'
    },
    {
      name: 'Total Donations',
      value: stats.loading ? '...' : `₹${stats.totalDonationAmount.toLocaleString()}`,
      change: '+18%',
      changeType: 'increase',
      icon: Heart,
      color: 'bg-red-500',
      link: '/admin/donations'
    },
    {
      name: 'New Inquiries',
      value: stats.loading ? '...' : stats.newInquiries.toString(),
      change: '-3%',
      changeType: 'decrease',
      icon: MessageSquare,
      color: 'bg-yellow-500',
      link: '/admin/inquiries'
    }
  ];

  // Format recent activities for display
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'member': return Users;
      case 'donation': return Heart;
      case 'event': return Calendar;
      case 'inquiry': return MessageSquare;
      default: return Users;
    }
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h1>
            <p className="text-primary-100">
              Manage your NGO operations efficiently with our comprehensive admin panel
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-primary-100">
              {stats.loading ? 'Loading...' : 'Data updated'}
            </div>
            {stats.error && (
              <div className="text-xs text-red-200 mt-1">
                {stats.error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <button
              onClick={refreshData}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {activitiesLoading ? (
              <div className="text-center py-4">
                <div className="text-gray-500">Loading recent activities...</div>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-gray-500">No recent activities found</div>
              </div>
            ) : (
              recentActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                    {activity.approved === false && (
                      <div className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                        Pending Approval
                      </div>
                    )}
                  </div>
                );
              })
            )}
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Charts />
      </motion.div>
    </div>
  );
};