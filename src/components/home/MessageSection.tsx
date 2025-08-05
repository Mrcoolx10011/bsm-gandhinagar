import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export const MessageSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold text-white mb-12"
          >
            Message from Our President
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            {/* Quote Icon */}
            <div className="flex justify-center mb-8">
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <Quote className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Quote Content */}
            <blockquote className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-8 italic">
              "We believe in the power of heritage and harmony — not just to remember the past, but to build a better future. Through our cultural traditions and community service, we create bridges between generations and strengthen the bonds that unite us as one family."
            </blockquote>

            {/* Author Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6"
            >
              {/* Profile Image */}
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&fit=crop"
                  alt="Shri Ramesh Kumar Yadav"
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full"></div>
              </div>

              {/* Author Info */}
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-1">
                  Shri Ramesh Kumar Yadav
                </h3>
                <p className="text-orange-100 font-medium">
                  President, Bihar Sanskritik Mandal
                </p>
                <p className="text-orange-200 text-sm mt-1">
                  Founder & Cultural Leader
                </p>
              </div>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex justify-center mt-8 space-x-4"
            >
              <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
              <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
              <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
