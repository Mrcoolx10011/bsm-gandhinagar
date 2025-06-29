import express from 'express';
import prisma from '../lib/prisma.js';

const app = express();
app.use(express.json());

// Get dashboard statistics
app.get('/', async (req, res) => {
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
      prisma.member.count({ where: { status: 'active' } }),
      prisma.event.count(),
      prisma.event.count({ where: { status: 'upcoming' } }),
      prisma.donation.aggregate({ _sum: { amount: true } }),
      prisma.donation.count({ where: { status: 'completed' } }),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'new' } })
    ]);

    res.json({
      members: {
        total: totalMembers,
        active: activeMembers
      },
      events: {
        total: totalEvents,
        upcoming: upcomingEvents
      },
      donations: {
        totalAmount: totalDonations._sum.amount || 0,
        completed: completedDonations
      },
      inquiries: {
        total: totalInquiries,
        new: newInquiries
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent activities
app.get('/activities', async (req, res) => {
  try {
    const [
      recentMembers,
      recentDonations,
      recentEvents,
      recentInquiries
    ] = await Promise.all([
      prisma.member.findMany({
        orderBy: { created_at: 'desc' },
        take: 5
      }),
      prisma.donation.findMany({
        orderBy: { created_at: 'desc' },
        take: 5
      }),
      prisma.event.findMany({
        orderBy: { created_at: 'desc' },
        take: 5
      }),
      prisma.inquiry.findMany({
        orderBy: { created_at: 'desc' },
        take: 5
      })
    ]);

    const activities = [
      ...recentMembers.map(m => ({ type: 'member', data: m, timestamp: m.created_at })),
      ...recentDonations.map(d => ({ type: 'donation', data: d, timestamp: d.created_at })),
      ...recentEvents.map(e => ({ type: 'event', data: e, timestamp: e.created_at })),
      ...recentInquiries.map(i => ({ type: 'inquiry', data: i, timestamp: i.created_at }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default app;
