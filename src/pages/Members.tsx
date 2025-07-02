import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Phone, Mail, ChevronDown, ChevronRight, MessageCircle, Filter, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Member {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  location: string;
  image: string;
  bio: string;
  dateJoined?: string;
  status?: string;
}

interface LocationNode {
  name: string;
  members: Member[];
  children: LocationNode[];
  expanded: boolean;
}

const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Rajesh Kumar Sharma',
    role: 'Regional Coordinator',
    phone: '+91-98765-43210',
    email: 'rajesh.sharma@ngo.org',
    location: 'Maharashtra > Mumbai',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Experienced coordinator with 8+ years in community development and regional program management across Maharashtra.'
  },
  {
    id: '2',
    name: 'Priya Patel',
    role: 'Education Program Manager',
    phone: '+91-98765-43211',
    email: 'priya.patel@ngo.org',
    location: 'Maharashtra > Pune',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Passionate educator focused on rural education initiatives and digital literacy programs for underprivileged children.'
  },
  {
    id: '3',
    name: 'Dr. Amit Singh',
    role: 'Healthcare Coordinator',
    phone: '+91-98765-43212',
    email: 'amit.singh@ngo.org',
    location: 'Delhi > New Delhi',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Medical professional dedicated to community health initiatives and preventive care programs in urban slums.'
  },
  {
    id: '4',
    name: 'Sunita Devi',
    role: 'Women Empowerment Specialist',
    phone: '+91-98765-43213',
    email: 'sunita.devi@ngo.org',
    location: 'Delhi > Gurgaon',
    image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Social worker specializing in women empowerment, skill development, and microfinance programs for rural women.'
  },
  {
    id: '5',
    name: 'Arjun Reddy',
    role: 'Community Outreach Manager',
    phone: '+91-98765-43214',
    email: 'arjun.reddy@ngo.org',
    location: 'Karnataka > Bangalore',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Building bridges between urban and rural communities, creating sustainable partnerships for social impact in South India.'
  },
  {
    id: '6',
    name: 'Meera Krishnan',
    role: 'Environmental Coordinator',
    phone: '+91-98765-43215',
    email: 'meera.krishnan@ngo.org',
    location: 'Karnataka > Mysore',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Environmental scientist working on water conservation and sustainable agriculture projects across Karnataka villages.'
  },
  {
    id: '7',
    name: 'Vikram Gupta',
    role: 'Youth Program Director',
    phone: '+91-98765-43216',
    email: 'vikram.gupta@ngo.org',
    location: 'Uttar Pradesh > Lucknow',
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Dedicated to empowering rural youth through skill development, entrepreneurship training, and digital literacy programs.'
  },
  {
    id: '8',
    name: 'Kavita Sharma',
    role: 'Social Worker',
    phone: '+91-98765-43217',
    email: 'kavita.sharma@ngo.org',
    location: 'Uttar Pradesh > Varanasi',
    image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Licensed social worker specializing in child welfare, family support services, and community development in rural areas.'
  },
  {
    id: '9',
    name: 'Ravi Agarwal',
    role: 'Finance Manager',
    phone: '+91-98765-43218',
    email: 'ravi.agarwal@ngo.org',
    location: 'Rajasthan > Jaipur',
    image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Chartered Accountant with extensive experience in non-profit financial management and transparency initiatives.'
  },
  {
    id: '10',
    name: 'Anjali Verma',
    role: 'Communications Director',
    phone: '+91-98765-43219',
    email: 'anjali.verma@ngo.org',
    location: 'Rajasthan > Udaipur',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Media professional focused on storytelling, digital outreach, and creating awareness about social causes across India.'
  },
  {
    id: '11',
    name: 'Suresh Yadav',
    role: 'Volunteer Coordinator',
    phone: '+91-98765-43220',
    email: 'suresh.yadav@ngo.org',
    location: 'Gujarat > Ahmedabad',
    image: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Organizing and training volunteers across Gujarat, maximizing community engagement and grassroots participation.'
  },
  {
    id: '12',
    name: 'Deepika Joshi',
    role: 'Research Analyst',
    phone: '+91-98765-43221',
    email: 'deepika.joshi@ngo.org',
    location: 'Gujarat > Surat',
    image: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Data analyst specializing in impact measurement, community needs assessment, and program effectiveness evaluation.'
  },
  {
    id: '13',
    name: 'Rohit Malhotra',
    role: 'Technology Coordinator',
    phone: '+91-98765-43222',
    email: 'rohit.malhotra@ngo.org',
    location: 'Tamil Nadu > Chennai',
    image: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'IT specialist ensuring digital infrastructure supports rural connectivity and e-governance initiatives effectively.'
  },
  {
    id: '14',
    name: 'Pooja Nair',
    role: 'Grant Writer',
    phone: '+91-98765-43223',
    email: 'pooja.nair@ngo.org',
    location: 'Tamil Nadu > Coimbatore',
    image: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Professional grant writer securing funding from government schemes and international donors for community programs.'
  },
  {
    id: '15',
    name: 'Manish Kumar',
    role: 'Field Operations Manager',
    phone: '+91-98765-43224',
    email: 'manish.kumar@ngo.org',
    location: 'West Bengal > Kolkata',
    image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Coordinating field operations across Eastern India, ensuring program delivery meets quality standards in remote areas.'
  },
  {
    id: '16',
    name: 'Shalini Iyer',
    role: 'Child Welfare Officer',
    phone: '+91-98765-43225',
    email: 'shalini.iyer@ngo.org',
    location: 'West Bengal > Darjeeling',
    image: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Child protection specialist working on education, nutrition, and safety programs for vulnerable children in hill regions.'
  },
  {
    id: '17',
    name: 'Kiran Bhat',
    role: 'Rural Development Officer',
    phone: '+91-98765-43226',
    email: 'kiran.bhat@ngo.org',
    location: 'Kerala > Kochi',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Rural development expert focusing on sustainable livelihoods, organic farming, and coastal community development.'
  },
  {
    id: '18',
    name: 'Anil Menon',
    role: 'Disaster Relief Coordinator',
    phone: '+91-98765-43227',
    email: 'anil.menon@ngo.org',
    location: 'Kerala > Thiruvananthapuram',
    image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Emergency response specialist with expertise in flood relief, rehabilitation programs, and disaster preparedness training.'
  }
];

export const Members: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree');
  const [members, setMembers] = useState<Member[]>(mockMembers);

  // Fetch members from API
  const fetchMembers = async () => {
    try {
      console.log('Fetching members from API...');
      const response = await fetch('/api/members?public=true');
      console.log('Members API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Members API data:', data);
        
        // Transform the data to match the expected interface
        const transformedMembers = data.map((member: any) => ({
          id: member.id || member._id,
          name: member.name,
          role: member.role || member.membershipType || 'Member',
          phone: member.phone,
          email: member.email,
          location: member.location || member.address || 'Location not specified',
          image: member.image || member.profileImage || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
          bio: member.bio || `Member since ${new Date(member.joinDate || member.createdAt).getFullYear()}. Status: ${member.status}`,
          dateJoined: member.dateJoined || member.joinDate || member.createdAt,
          status: member.status
        }));
        
        console.log('Transformed members:', transformedMembers);
        setMembers(transformedMembers);
      } else {
        console.error('Failed to fetch members:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        // Use mock data as fallback
        setMembers(mockMembers);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      // Use mock data as fallback
      setMembers(mockMembers);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Filter members based on search term
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;
    
    return members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.bio.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, members]);

  // Build location tree from filtered members
  const locationTree = useMemo(() => {
    const tree: LocationNode = {
      name: 'All Locations',
      expanded: true,
      members: [],
      children: []
    };

    const stateMap = new Map<string, LocationNode>();

    filteredMembers.forEach(member => {
      const [state, city] = member.location.split(' > ');
      
      // Get or create state node
      if (!stateMap.has(state)) {
        const stateNode: LocationNode = {
          name: state,
          expanded: expandedNodes.has(state),
          members: [],
          children: []
        };
        stateMap.set(state, stateNode);
        tree.children.push(stateNode);
      }

      const stateNode = stateMap.get(state)!;
      
      // Find or create city node
      let cityNode = stateNode.children.find(child => child.name === city);
      if (!cityNode) {
        cityNode = {
          name: city,
          expanded: expandedNodes.has(`${state}-${city}`),
          members: [],
          children: []
        };
        stateNode.children.push(cityNode);
      }

      cityNode.members.push(member);
    });

    return tree;
  }, [filteredMembers, expandedNodes]);

  const toggleNode = (nodeKey: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeKey)) {
      newExpanded.delete(nodeKey);
    } else {
      newExpanded.add(nodeKey);
    }
    setExpandedNodes(newExpanded);
  };

  const getTotalMemberCount = () => filteredMembers.length;

  const renderTreeNode = (node: LocationNode, nodeKey: string, depth: number = 0) => {
    const hasChildren = node.children.length > 0;
    const totalMembers = node.members.length + 
      node.children.reduce((sum, child) => sum + child.members.length + 
        child.children.reduce((childSum, grandChild) => childSum + grandChild.members.length, 0), 0);

    return (
      <div key={nodeKey} className={`${depth > 0 ? 'ml-4' : ''}`}>
        {/* Node Header */}
        <div
          className={`flex items-center justify-between py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 ${
            depth === 0 
              ? 'bg-primary-50 border border-primary-200 font-semibold text-primary-900 mb-2' 
              : depth === 1
              ? 'bg-gray-50 hover:bg-gray-100 font-medium text-gray-800 mb-1'
              : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 mb-1'
          }`}
          onClick={() => hasChildren && toggleNode(nodeKey)}
        >
          <div className="flex items-center space-x-3">
            {hasChildren && (
              <motion.div
                animate={{ rotate: node.expanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </motion.div>
            )}
            <MapPin className={`w-4 h-4 ${depth === 0 ? 'text-primary-600' : 'text-gray-500'}`} />
            <span className="font-medium">{node.name}</span>
          </div>
          
          {totalMembers > 0 && (
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                depth === 0 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {totalMembers} {totalMembers === 1 ? 'member' : 'members'}
              </span>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {node.expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {/* Child Nodes */}
              {node.children.map((child, index) => 
                renderTreeNode(child, `${nodeKey}-${child.name}`, depth + 1)
              )}
              
              {/* Members */}
              {node.members.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="ml-8 mb-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-primary-200 transition-all duration-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=6366f1&color=ffffff`;
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center ring-2 ring-gray-100 group-hover:ring-primary-200 transition-all duration-200">
                          <span className="text-white font-semibold text-lg">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">{member.role}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{member.bio}</p>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <a
                        href={`tel:${member.phone}`}
                        className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        title="Call"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredMembers.map((member, index) => (
        <motion.div
          key={member.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={() => setSelectedMember(member)}
        >
          <div className="text-center mb-4">
            {member.image ? (
              <img
                src={member.image}
                alt={member.name}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-3 ring-2 ring-gray-100"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=6366f1&color=ffffff`;
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-3 ring-2 ring-gray-100">
                <span className="text-white font-semibold text-2xl">
                  {member.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <h3 className="font-semibold text-gray-900">{member.name}</h3>
            <p className="text-sm text-gray-600">{member.role}</p>
            <p className="text-xs text-gray-500 mt-1">{member.location}</p>
          </div>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{member.bio}</p>
          
          <div className="flex space-x-2">
            <a
              href={`tel:${member.phone}`}
              className="flex-1 bg-blue-100 text-blue-600 py-2 px-3 rounded-lg text-center hover:bg-blue-200 transition-colors text-sm font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              Call
            </a>
            <a
              href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg text-center hover:bg-green-600 transition-colors text-sm font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              WhatsApp
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-heading font-bold text-gray-900 mb-4"
          >
            Our Members
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Meet our dedicated team members working across India to create positive change in communities
          </motion.p>
        </div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
          >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search members by name, role, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* View Toggle & Stats */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{getTotalMemberCount()} members found</span>
              </div>
              
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'tree'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tree View
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid View
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {viewMode === 'tree' ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <MapPin className="w-6 h-6 mr-2 text-primary-600" />
                Members by Location
              </h2>
              {renderTreeNode(locationTree, 'root')}
            </div>
          ) : (
            renderGridView()
          )}
        </motion.div>

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
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  {selectedMember.image ? (
                    <img
                      src={selectedMember.image}
                      alt={selectedMember.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-primary-100"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.name)}&background=6366f1&color=ffffff`;
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-4 ring-4 ring-primary-100">
                      <span className="text-white font-semibold text-3xl">
                        {selectedMember.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {selectedMember.name}
                  </h3>
                  <p className="text-gray-600 font-medium">{selectedMember.role}</p>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">{selectedMember.bio}</p>
                  
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700">{selectedMember.location}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <a
                        href={`tel:${selectedMember.phone}`}
                        className="text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        {selectedMember.phone}
                      </a>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <a
                        href={`mailto:${selectedMember.email}`}
                        className="text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        {selectedMember.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-6">
                    <a
                      href={`tel:${selectedMember.phone}`}
                      className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-lg text-center hover:bg-primary-700 transition-colors font-semibold"
                    >
                      <Phone className="w-4 h-4 inline mr-2" />
                      Call Now
                    </a>
                    <a
                      href={`https://wa.me/${selectedMember.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg text-center hover:bg-green-600 transition-colors font-semibold"
                    >
                      <MessageCircle className="w-4 h-4 inline mr-2" />
                      WhatsApp
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};