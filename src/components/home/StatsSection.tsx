import React from 'react';
import { Users, Calendar, Heart, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  {
    icon: Users,
    number: '500+',
    label: 'Active Members',
    description: 'Dedicated volunteers working for change'
  },
  {
    icon: Calendar,
    number: '50+',
    label: 'Events Organized',
    description: 'Community events and programs'
  },
  {
    icon: Heart,
    number: '$100K+',
    label: 'Funds Raised',
    description: 'Supporting various causes'
  },
  {
    icon: Award,
    number: '25+',
    label: 'Awards Won',
    description: 'Recognition for our impact'
  }
];

export const StatsSection: React.FC = () => {
  return (
    <section className="py-20 bg-orange-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-heading font-bold text-white mb-4"
          >
            Our Impact in Numbers
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-orange-100 max-w-3xl mx-auto"
          >
            See the difference we've made together in our community
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center text-white"
              >
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-xl font-semibold mb-2">{stat.label}</div>
                <div className="text-orange-100 text-sm">{stat.description}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
