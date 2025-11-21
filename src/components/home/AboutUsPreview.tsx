import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Heart } from 'lucide-react';

export const AboutUsPreview: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Text Content */}
          <div className="space-y-6">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
            >
              Who We Are
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg text-gray-700 leading-relaxed mb-6"
            >
              Bihar Purvanchal Samaj is a dedicated socio-cultural organization promoting the rich heritage, unity, and traditions of Bihar and Purvanchal through art, education, and community programs.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-gray-600 mb-8"
            >
              We believe in preserving our cultural identity while empowering communities through education, social welfare, and youth development initiatives that create lasting positive change.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/about"
                className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Read More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1 text-orange-500" />
                  <span>500+ Members</span>
                </div>
                <div className="flex items-center">
                  <Heart className="w-4 h-4 mr-1 text-red-500" />
                  <span>8+ Years</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Visual Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1524863479829-916d8e77f114?auto=format&fit=crop&w=800&q=80"
                alt="Bihar Purvanchal Samaj Activities"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              {/* Overlay Content */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h3 className="text-xl font-bold mb-2">Cultural Heritage</h3>
                <p className="text-sm text-gray-200">
                  Preserving Bihar's rich traditions through folk arts, festivals, and community engagement
                </p>
              </div>
            </div>

            {/* Floating Stats Cards */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-orange-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">15+</div>
                <div className="text-xs text-gray-600">Events Annually</div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-red-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">1000+</div>
                <div className="text-xs text-gray-600">Lives Impacted</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
