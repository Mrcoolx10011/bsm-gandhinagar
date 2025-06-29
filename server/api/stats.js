import express from 'express';
import prisma from '../../lib/prisma.js';

const router = express.Router();

// Get dashboard statistics
router.get('/', async (req, res) => {
  try {
    const [
      totalMembers,
      activeMembers,
      totalEvents,
      upcomingEvents,
      totalDonations,
      completedDonations,
      totalInquiries,
      newInquiries
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { status: 'ACTIVE' } }),
      prisma.event.count(),
      prisma.event.count({ where: { status: 'UPCOMING' } }),
      prisma.donation.aggregate({ _sum: { amount: true } }),
      prisma.donation.count({ where: { status: 'COMPLETED' } }),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'NEW' } })
    ]);

    const stats = {
      members: {
        total: totalMembers,
        active: activeMembers,
        growth: '+12%' // This would be calculated based on historical data
      },
      events: {
        total: totalEvents,
        upcoming: upcomingEvents,
        growth: '+5%'
      },
      donations: {
        total: totalDonations._sum.amount || 0,
        completed: completedDonations,
        growth: '+18%'
      },
      inquiries: {
        total: totalInquiries,
        new: newInquiries,
        growth: '-3%'
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get recent activities
router.get('/activities', async (req, res) => {
  try {
    const [recentMembers, recentDonations, recentEvents, recentInquiries] = await Promise.all([
      prisma.member.findMany({
        take: 2,
        orderBy: { createdAt: 'desc' },
        select: { name: true, createdAt: true }
      }),
      prisma.donation.findMany({
        take: 2,
        orderBy: { createdAt: 'desc' },
        select: { donorName: true, amount: true, createdAt: true }
      }),
      prisma.event.findMany({
        take: 2,
        orderBy: { createdAt: 'desc' },
        select: { title: true, createdAt: true }
      }),
      prisma.inquiry.findMany({
        take: 2,
        orderBy: { createdAt: 'desc' },
        select: { name: true, createdAt: true }
      })
    ]);

    const activities = [];

    // Add member activities
    recentMembers.forEach(member => {
      activities.push({
        type: 'member',
        message: `New member ${member.name} joined`,
        time: member.createdAt,
        icon: 'Users'
      });
    });

    // Add donation activities
    recentDonations.forEach(donation => {
      activities.push({
        type: 'donation',
        message: `Received ₹${donation.amount} donation from ${donation.donorName}`,
        time: donation.createdAt,
        icon: 'Heart'
      });
    });

    // Add event activities
    recentEvents.forEach(event => {
      activities.push({
        type: 'event',
        message: `${event.title} event created`,
        time: event.createdAt,
        icon: 'Calendar'
      });
    });

    // Add inquiry activities
    recentInquiries.forEach(inquiry => {
      activities.push({
        type: 'inquiry',
        message: `New inquiry from ${inquiry.name}`,
        time: inquiry.createdAt,
        icon: 'MessageSquare'
      });
    });

    // Sort by time and take latest 4
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recentActivities = activities.slice(0, 4).map(activity => ({
      ...activity,
      time: getRelativeTime(activity.time)
    }));

    res.json(recentActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Helper function to get relative time
function getRelativeTime(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

export default router;