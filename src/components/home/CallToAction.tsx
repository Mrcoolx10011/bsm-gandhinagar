import React from 'react';
import { Heart, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const CallToAction: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-heading font-bold text-white mb-4"
          >
            Ready to Make a Difference?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-orange-100 max-w-3xl mx-auto mb-12"
          >
            Join our community of changemakers and help us create a better world for everyone
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="/members"
              className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-colors inline-flex items-center justify-center space-x-2"
            >
              <Users className="w-5 h-5" />
              <span>Become a Member</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            
            <a
              href="/donations"
              className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 rounded-lg font-semibold transition-colors inline-flex items-center justify-center space-x-2"
            >
              <Heart className="w-5 h-5" />
              <span>Donate Now</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
