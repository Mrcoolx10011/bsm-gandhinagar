import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Heart, Star, CheckCircle } from 'lucide-react';

export const MembershipSection: React.FC = () => {
  const benefits = [
    'Access to exclusive cultural events and workshops',
    'Networking opportunities with community leaders',
    'Priority registration for festivals and celebrations',
    'Volunteer opportunities for community service',
    'Cultural preservation and heritage activities',
    'Youth development and mentorship programs'
  ];

  return (
    <section id="membership" className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Join Our Cultural Family
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Become a part of Bihar Purvanchal Samaj and help preserve our rich cultural heritage while making a positive impact in the community.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Benefits List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="w-6 h-6 mr-3 text-orange-500" />
              Membership Benefits
            </h3>
            
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                  className="flex items-start space-x-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="bg-white rounded-lg p-6 shadow-lg border border-orange-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Current Members</h4>
                <Users className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">500+</div>
              <p className="text-sm text-gray-600">Active community members across Bihar and Purvanchal</p>
            </motion.div>
          </motion.div>

          {/* Membership Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-white" />
              <h3 className="text-2xl font-bold mb-2">Become a Member</h3>
              <p className="text-orange-100">Join our mission to preserve culture and serve the community</p>
            </div>
            
            <div className="p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">Free</div>
                  <p className="text-gray-600">Community Membership</p>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">What you get:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Cultural event access
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Community networking
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Volunteer opportunities
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Newsletter updates
                    </li>
                  </ul>
                </div>
                
                <Link
                  to="/members"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join Now
                </Link>
                
                <p className="text-xs text-gray-500 text-center">
                  By joining, you agree to our community guidelines and values
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
