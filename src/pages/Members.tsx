import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Phone, Mail, User, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMemberImageAlt } from '../utils/seo';

interface Member {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  location: string;
  image?: string;
  bio?: string;
  dateJoined?: string;
  status?: string;
}

const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Rajesh Kumar Sharma',
    role: 'Regional Coordinator',
    phone: '+91-98765-43210',
    email: 'rajesh.sharma@bsm.org',
    location: 'Patna, Bihar',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '2',
    name: 'Priya Patel',
    role: 'Cultural Program Manager',
    phone: '+91-98765-43211',
    email: 'priya.patel@bsm.org',
    location: 'Ahmedabad, Gujarat',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '3',
    name: 'Dr. Amit Singh',
    role: 'Educational Coordinator',
    phone: '+91-98765-43212',
    email: 'amit.singh@bsm.org',
    location: 'Muzaffarpur, Bihar',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '4',
    name: 'Sunita Devi',
    role: 'Women Empowerment Specialist',
    phone: '+91-98765-43213',
    email: 'sunita.devi@bsm.org',
    location: 'Bhagalpur, Bihar',
    image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '5',
    name: 'Arjun Reddy',
    role: 'Community Outreach Manager',
    phone: '+91-98765-43214',
    email: 'arjun.reddy@bsm.org',
    location: 'Gaya, Bihar',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '6',
    name: 'Meera Krishnan',
    role: 'Arts & Heritage Coordinator',
    phone: '+91-98765-43215',
    email: 'meera.krishnan@bsm.org',
    location: 'Vadodara, Gujarat',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '7',
    name: 'Vikram Gupta',
    role: 'Youth Program Director',
    phone: '+91-98765-43216',
    email: 'vikram.gupta@bsm.org',
    location: 'Darbhanga, Bihar',
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '8',
    name: 'Kavita Sharma',
    role: 'Social Welfare Officer',
    phone: '+91-98765-43217',
    email: 'kavita.sharma@bsm.org',
    location: 'Rajkot, Gujarat',
    image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '9',
    name: 'Ravi Agarwal',
    role: 'Finance Manager',
    phone: '+91-98765-43218',
    email: 'ravi.agarwal@bsm.org',
    location: 'Samastipur, Bihar',
    image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '10',
    name: 'Anjali Verma',
    role: 'Communications Director',
    phone: '+91-98765-43219',
    email: 'anjali.verma@bsm.org',
    location: 'Surat, Gujarat',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '11',
    name: 'Suresh Yadav',
    role: 'Volunteer Coordinator',
    phone: '+91-98765-43220',
    email: 'suresh.yadav@bsm.org',
    location: 'Begusarai, Bihar',
    image: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150',
  },
  {
    id: '12',
    name: 'Deepika Joshi',
    role: 'Research Analyst',
    phone: '+91-98765-43221',
    email: 'deepika.joshi@bsm.org',
    location: 'Bharuch, Gujarat',
    image: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150',
  }
];

export const Members: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [members, setMembers] = useState<Member[]>(mockMembers);

  // Fetch members from API
  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/consolidated?endpoint=members');
      if (response.ok) {
        const data = await response.json();
        const transformedMembers = data.map((member: any) => ({
          id: member.id || member._id,
          name: member.name,
          role: member.role || member.membershipType || 'Member',
          phone: member.phone,
          email: member.email,
          location: member.location || member.address || 'Location not specified',
          image: member.image || member.profileImage,
        }));
        setMembers(transformedMembers);
      } else {
        setMembers(mockMembers);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers(mockMembers);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Get unique locations for filter tags
  const locations = useMemo(() => {
    const locationSet = new Set<string>();
    members.forEach(member => {
      const state = member.location.split(',')[1]?.trim();
      if (state) locationSet.add(state);
    });
    return Array.from(locationSet).sort();
  }, [members]);

  // Filter members
  const filteredMembers = useMemo(() => {
    let filtered = members;

    // Filter by location
    if (activeFilter !== 'all') {
      filtered = filtered.filter(member => 
        member.location.toLowerCase().includes(activeFilter.toLowerCase())
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [members, searchTerm, activeFilter]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Our Members
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Meet our dedicated team members who work tirelessly to preserve and promote Bihar's rich cultural heritage across India.
          </motion.p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search members by name, role, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div>
        </motion.div>

        {/* Filter Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === 'all'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Locations ({members.length})
            </button>
            {locations.map((location) => {
              const count = members.filter(member => 
                member.location.toLowerCase().includes(location.toLowerCase())
              ).length;
              return (
                <button
                  key={location}
                  onClick={() => setActiveFilter(location)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeFilter === location
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {location} ({count})
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Members List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-1"
        >
          {filteredMembers.length === 0 ? (
            <div className="text-center py-16">
              <User className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg hover:border-orange-200 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedMember(member)}
              >
                <div className="flex items-center space-x-4">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={getMemberImageAlt(member.name, member.role)}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-orange-200 transition-all duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=f97316&color=ffffff&size=64`;
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center ring-2 ring-gray-100 group-hover:ring-orange-200 transition-all duration-300">
                        <span className="text-white font-semibold text-xl">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">
                      {member.name}
                    </h3>
                    <p className="text-orange-600 font-medium text-sm mb-1">
                      {member.role}
                    </p>
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{member.location}</span>
                    </div>
                  </div>

                  {/* Contact Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <a
                      href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors duration-200"
                      title="WhatsApp"
                      aria-label={`Chat with ${member.name} on WhatsApp`}
                    >
                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    </a>
                    <a
                      href={`tel:${member.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-colors duration-200"
                      title="Call"
                      aria-label={`Call ${member.name}`}
                    >
                      <Phone className="w-4 h-4" aria-hidden="true" />
                    </a>
                    <a
                      href={`mailto:${member.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors duration-200"
                      title="Email"
                      aria-label={`Email ${member.name}`}
                    >
                      <Mail className="w-4 h-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                {/* Subtle Separator */}
                {index < filteredMembers.length - 1 && (
                  <div className="mt-6 border-b border-gray-50"></div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Results Count */}
        {filteredMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8 text-gray-500 text-sm"
          >
            Showing {filteredMembers.length} of {members.length} members
          </motion.div>
        )}
      </div>

      {/* Member Detail Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Profile Section */}
              <div className="text-center mb-8">
                {selectedMember.image ? (
                  <img
                    src={selectedMember.image}
                    alt={getMemberImageAlt(selectedMember.name, selectedMember.role)}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-orange-100"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.name)}&background=f97316&color=ffffff&size=96`;
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-4 ring-4 ring-orange-100">
                    <span className="text-white font-semibold text-3xl">
                      {selectedMember.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedMember.name}
                </h3>
                <p className="text-orange-600 font-semibold text-lg mb-1">
                  {selectedMember.role}
                </p>
                <div className="flex items-center justify-center text-gray-500">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{selectedMember.location}</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <a
                    href={`tel:${selectedMember.phone}`}
                    className="text-gray-900 hover:text-orange-600 transition-colors font-medium"
                  >
                    {selectedMember.phone}
                  </a>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <a
                    href={`mailto:${selectedMember.email}`}
                    className="text-gray-900 hover:text-orange-600 transition-colors font-medium truncate"
                  >
                    {selectedMember.email}
                  </a>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <a
                    href={`https://wa.me/${selectedMember.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:text-green-600 transition-colors font-medium"
                  >
                    WhatsApp Chat
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href={`https://wa.me/${selectedMember.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Chat with ${selectedMember.name} on WhatsApp`}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-xl text-center hover:bg-green-600 transition-colors font-semibold shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                  WhatsApp Chat
                </a>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`tel:${selectedMember.phone}`}
                    aria-label={`Call ${selectedMember.name}`}
                    className="bg-orange-500 text-white py-3 px-4 rounded-xl text-center hover:bg-orange-600 transition-colors font-semibold shadow-md hover:shadow-lg"
                  >
                    <Phone className="w-4 h-4 inline mr-2" aria-hidden="true" />
                    Call
                  </a>
                  <a
                    href={`mailto:${selectedMember.email}`}
                    aria-label={`Email ${selectedMember.name}`}
                    className="bg-gray-100 text-gray-700 py-3 px-4 rounded-xl text-center hover:bg-gray-200 transition-colors font-semibold"
                  >
                    <Mail className="w-4 h-4 inline mr-2" aria-hidden="true" />
                    Email
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

