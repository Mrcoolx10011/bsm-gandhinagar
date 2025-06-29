import React from 'react';
import { Heart, Users, Globe, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const values = [
  {
    icon: Heart,
    title: 'Compassion',
    description: 'We approach every initiative with empathy and understanding for those we serve.'
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Building stronger communities through collaboration and shared responsibility.'
  },
  {
    icon: Globe,
    title: 'Impact',
    description: 'Creating lasting positive change that extends beyond immediate assistance.'
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'Maintaining the highest standards in all our programs and initiatives.'
  }
];

export const MissionSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4"
          >
            Our Mission & Vision
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            We are dedicated to creating positive change in our community through 
            education, healthcare, and social development programs.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src="https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Our Mission"
              className="rounded-lg shadow-lg w-full h-96 object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To empower communities through sustainable development programs, 
                education initiatives, and healthcare support that create lasting 
                positive impact for generations to come.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                Our Vision
              </h3>
              <p className="text-gray-600 leading-relaxed">
                A world where every individual has access to quality education, 
                healthcare, and opportunities for personal and community growth, 
                regardless of their background or circumstances.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-lg bg-gray-50 hover:bg-primary-50 transition-colors group"
              >
                <div className="w-16 h-16 bg-primary-100 group-hover:bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};