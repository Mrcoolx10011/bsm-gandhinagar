import { useState, useEffect } from 'react';
import { makeAuthenticatedRequest } from '../utils/auth';

interface DashboardStats {
  totalMembers: number;
  activeEvents: number;
  totalDonations: number;
  totalDonationAmount: number;
  newInquiries: number;
  loading: boolean;
  error: string | null;
}

interface RecentActivity {
  id: string;
  type: 'member' | 'donation' | 'event' | 'inquiry';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  amount?: number;
  approved?: boolean;
}

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeEvents: 0,
    totalDonations: 0,
    totalDonationAmount: 0,
    newInquiries: 0,
    loading: true,
    error: null
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Fetch all data in parallel
      const [membersRes, eventsRes, donationsRes, campaignsRes, inquiriesRes] = await Promise.all([
        makeAuthenticatedRequest('/api/members'),
        makeAuthenticatedRequest('/api/events'),
        makeAuthenticatedRequest('/api/donations'),
        makeAuthenticatedRequest('/api/campaigns'),
        makeAuthenticatedRequest('/api/inquiries')
      ]);

      if (membersRes.ok && eventsRes.ok && donationsRes.ok && campaignsRes.ok && inquiriesRes.ok) {
        const [members, events, donations, _campaigns, inquiries] = await Promise.all([
          membersRes.json(),
          eventsRes.json(),
          donationsRes.json(),
          campaignsRes.json(),
          inquiriesRes.json()
        ]);

        // Calculate stats
        const totalMembers = Array.isArray(members) ? members.length : 0;
        const activeEvents = Array.isArray(events) ? events.filter(e => e.status === 'active' || e.status === 'upcoming').length : 0;
        const completedDonations = Array.isArray(donations) ? donations.filter(d => d.status === 'completed') : [];
        const totalDonations = completedDonations.length;
        const totalDonationAmount = completedDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
        const newInquiries = Array.isArray(inquiries) ? inquiries.filter(i => i.status === 'new').length : 0;

        setStats({
          totalMembers,
          activeEvents,
          totalDonations,
          totalDonationAmount,
          newInquiries,
          loading: false,
          error: null
        });
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }));
    }
  };

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);

      // Try to fetch from the recent-activities endpoint first
      const recentActivitiesRes = await makeAuthenticatedRequest('/api/recent-activities');
      
      if (recentActivitiesRes.ok) {
        const activities = await recentActivitiesRes.json();
        setRecentActivities(Array.isArray(activities) ? activities.slice(0, 10) : []);
      } else {
        // Fallback: fetch individual endpoints and create activities
        const [membersRes, donationsRes, eventsRes, inquiriesRes] = await Promise.all([
          makeAuthenticatedRequest('/api/members'),
          makeAuthenticatedRequest('/api/donations'),
          makeAuthenticatedRequest('/api/events'),
          makeAuthenticatedRequest('/api/inquiries')
        ]);

        const activities: RecentActivity[] = [];

        if (membersRes.ok) {
          const members = await membersRes.json();
          if (Array.isArray(members)) {
            // Get recent members (last 3)
            members
              .sort((a, b) => new Date(b.createdAt || b.joinDate || '').getTime() - new Date(a.createdAt || a.joinDate || '').getTime())
              .slice(0, 3)
              .forEach(member => {
                activities.push({
                  id: `member-${member.id}`,
                  type: 'member',
                  title: 'New Member',
                  description: `${member.name} joined as a member`,
                  timestamp: member.createdAt || member.joinDate || new Date().toISOString(),
                  status: member.status
                });
              });
          }
        }

        if (donationsRes.ok) {
          const donations = await donationsRes.json();
          if (Array.isArray(donations)) {
            // Get recent donations (last 3)
            donations
              .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
              .slice(0, 3)
              .forEach(donation => {
                activities.push({
                  id: `donation-${donation.id}`,
                  type: 'donation',
                  title: 'New Donation',
                  description: `${donation.donorName} donated ₹${donation.amount} to ${donation.campaign || 'general fund'}`,
                  timestamp: donation.createdAt || new Date().toISOString(),
                  status: donation.status,
                  amount: donation.amount,
                  approved: donation.approved
                });
              });
          }
        }

        if (eventsRes.ok) {
          const events = await eventsRes.json();
          if (Array.isArray(events)) {
            // Get recent events (last 2)
            events
              .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
              .slice(0, 2)
              .forEach(event => {
                activities.push({
                  id: `event-${event.id}`,
                  type: 'event',
                  title: 'New Event',
                  description: `${event.title} event created`,
                  timestamp: event.createdAt || new Date().toISOString(),
                  status: event.status
                });
              });
          }
        }

        if (inquiriesRes.ok) {
          const inquiries = await inquiriesRes.json();
          if (Array.isArray(inquiries)) {
            // Get recent inquiries (last 2)
            inquiries
              .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
              .slice(0, 2)
              .forEach(inquiry => {
                activities.push({
                  id: `inquiry-${inquiry.id}`,
                  type: 'inquiry',
                  title: 'New Inquiry',
                  description: `${inquiry.name} sent an inquiry about ${inquiry.subject || 'general information'}`,
                  timestamp: inquiry.createdAt || new Date().toISOString(),
                  status: inquiry.status
                });
              });
          }
        }

        // Sort activities by timestamp (newest first) and limit to 10
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentActivities(activities.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      // Set some fallback activities if fetch fails
      setRecentActivities([
        {
          id: 'fallback-1',
          type: 'member',
          title: 'System Status',
          description: 'Dashboard data will update when API connection is restored',
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const refreshData = async () => {
    await Promise.all([
      fetchDashboardStats(),
      fetchRecentActivities()
    ]);
  };

  useEffect(() => {
    refreshData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    recentActivities,
    activitiesLoading,
    refreshData
  };
};
