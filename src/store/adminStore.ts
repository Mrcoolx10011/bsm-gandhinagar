import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  location: {
    country: string;
    state: string;
    city: string;
  };
  bio: string;
  image: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image: string;
  gallery: string[];
  attendees: Array<{
    name: string;
    email: string;
    phone: string;
    registeredAt: string;
  }>;
  maxAttendees: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface Donation {
  id: string;
  donorName: string;
  email: string;
  phone: string;
  amount: number;
  campaign: string;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  isAnonymous: boolean;
  message: string;
  date: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'replied' | 'archived';
  priority: 'low' | 'medium' | 'high';
  response?: string;
  respondedAt?: string;
  date: string;
}

interface AdminState {
  members: Member[];
  events: Event[];
  donations: Donation[];
  inquiries: Inquiry[];
  
  // Actions
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  
  addDonation: (donation: Omit<Donation, 'id'>) => void;
  updateDonation: (id: string, donation: Partial<Donation>) => void;
  
  addInquiry: (inquiry: Omit<Inquiry, 'id'>) => void;
  updateInquiry: (id: string, inquiry: Partial<Inquiry>) => void;
  deleteInquiry: (id: string) => void;
}

// Mock data
const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Rajesh Kumar Sharma',
    email: 'rajesh.sharma@ngo.org',
    phone: '+91-98765-43210',
    role: 'Regional Coordinator',
    location: { country: 'India', state: 'Maharashtra', city: 'Mumbai' },
    bio: 'Experienced coordinator with 8+ years in community development.',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    status: 'active',
    joinDate: '2023-01-15'
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya.patel@ngo.org',
    phone: '+91-98765-43211',
    role: 'Education Program Manager',
    location: { country: 'India', state: 'Gujarat', city: 'Ahmedabad' },
    bio: 'Passionate educator focused on rural education initiatives.',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    status: 'active',
    joinDate: '2023-02-20'
  }
];

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Community Health Camp',
    description: 'Free health checkups and medical consultations',
    date: '2024-02-15',
    time: '9:00 AM - 5:00 PM',
    location: 'Community Center, Mumbai',
    category: 'Healthcare',
    image: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=400',
    gallery: [],
    attendees: [
      { name: 'John Doe', email: 'john@example.com', phone: '+91-9876543210', registeredAt: '2024-01-10' }
    ],
    maxAttendees: 100,
    status: 'upcoming'
  }
];

const mockDonations: Donation[] = [
  {
    id: '1',
    donorName: 'Anonymous Donor',
    email: 'donor@example.com',
    phone: '+91-9876543210',
    amount: 5000,
    campaign: 'Education for All',
    paymentMethod: 'UPI',
    transactionId: 'TXN123456789',
    status: 'completed',
    isAnonymous: true,
    message: 'Keep up the good work!',
    date: '2024-01-15'
  }
];

const mockInquiries: Inquiry[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+91-9876543210',
    subject: 'Volunteer Opportunities',
    message: 'I would like to volunteer for your education programs.',
    status: 'new',
    priority: 'medium',
    date: '2024-01-15'
  }
];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      members: mockMembers,
      events: mockEvents,
      donations: mockDonations,
      inquiries: mockInquiries,

      // Member actions
      addMember: (member) => set((state) => ({
        members: [...state.members, { ...member, id: Date.now().toString() }]
      })),
      
      updateMember: (id, updatedMember) => set((state) => ({
        members: state.members.map(member => 
          member.id === id ? { ...member, ...updatedMember } : member
        )
      })),
      
      deleteMember: (id) => set((state) => ({
        members: state.members.filter(member => member.id !== id)
      })),

      // Event actions
      addEvent: (event) => set((state) => ({
        events: [...state.events, { ...event, id: Date.now().toString() }]
      })),
      
      updateEvent: (id, updatedEvent) => set((state) => ({
        events: state.events.map(event => 
          event.id === id ? { ...event, ...updatedEvent } : event
        )
      })),
      
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter(event => event.id !== id)
      })),

      // Donation actions
      addDonation: (donation) => set((state) => ({
        donations: [...state.donations, { ...donation, id: Date.now().toString() }]
      })),
      
      updateDonation: (id, updatedDonation) => set((state) => ({
        donations: state.donations.map(donation => 
          donation.id === id ? { ...donation, ...updatedDonation } : donation
        )
      })),

      // Inquiry actions
      addInquiry: (inquiry) => set((state) => ({
        inquiries: [...state.inquiries, { ...inquiry, id: Date.now().toString() }]
      })),
      
      updateInquiry: (id, updatedInquiry) => set((state) => ({
        inquiries: state.inquiries.map(inquiry => 
          inquiry.id === id ? { ...inquiry, ...updatedInquiry } : inquiry
        )
      })),
      
      deleteInquiry: (id) => set((state) => ({
        inquiries: state.inquiries.filter(inquiry => inquiry.id !== id)
      }))
    }),
    {
      name: 'admin-storage',
    }
  )
);