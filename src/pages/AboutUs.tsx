import React from 'react';
import { Users, Heart, Award, Target, Eye, Calendar, Sun, TreePine, BookOpen, Globe, Shield, Flower } from 'lucide-react';
import { motion } from 'framer-motion';
import { aboutUsContent } from '../data/aboutUsContent';

export const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section - Cultural Heritage Banner */}
      <section className="relative bg-gradient-to-br from-orange-600 via-red-600 to-orange-800 text-white py-24 overflow-hidden">
        {/* Traditional Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3Ccircle cx='15' cy='15' r='2'/%3E%3Ccircle cx='45' cy='15' r='2'/%3E%3Ccircle cx='15' cy='45' r='2'/%3E%3Ccircle cx='45' cy='45' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        {/* Flower Pattern Decorations */}
        <div className="absolute top-20 right-10 text-yellow-300 opacity-30">
          <Flower className="w-16 h-16" />
        </div>
        <div className="absolute bottom-32 left-10 text-yellow-300 opacity-25">
          <Flower className="w-20 h-20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 bg-gradient-to-r from-yellow-300 to-orange-200 bg-clip-text text-transparent">
              Bihar Purvanchal Samaj
            </h1>
            <div className="w-32 h-2 bg-gradient-to-r from-yellow-400 to-orange-300 mx-auto mb-6 rounded-full"></div>
            <p className="text-2xl md:text-3xl mb-8 text-yellow-100 font-light">
              Preserving Heritage • Building Future
            </p>
            <p className="text-lg md:text-xl mb-10 opacity-90 max-w-4xl mx-auto leading-relaxed">
              A beacon of Bihari culture and tradition, fostering community bonds while embracing progressive values for our next generation.
            </p>
            
            {/* Cultural Symbol Row */}
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="flex flex-col items-center">
                <TreePine className="w-8 h-8 text-yellow-300 mb-2" />
                <span className="text-sm text-yellow-100">Heritage</span>
              </div>
              <div className="w-1 h-12 bg-yellow-400 opacity-50"></div>
              <div className="flex flex-col items-center">
                <Heart className="w-8 h-8 text-yellow-300 mb-2" />
                <span className="text-sm text-yellow-100">Community</span>
              </div>
              <div className="w-1 h-12 bg-yellow-400 opacity-50"></div>
              <div className="flex flex-col items-center">
                <Sun className="w-8 h-8 text-yellow-300 mb-2" />
                <span className="text-sm text-yellow-100">Future</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision - Enhanced Cultural Cards */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-orange-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Our Purpose
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto"></div>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="group"
            >
              <div className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-2 border-orange-100 relative overflow-hidden">
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-gray-900">Our Mission</h3>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {aboutUsContent.missionVision.mission.english}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="group"
            >
              <div className="bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-2 border-red-100 relative overflow-hidden">
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Eye className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-gray-900">Our Vision</h3>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {aboutUsContent.missionVision.vision.english}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Our Impact
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Touching lives, preserving culture</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: aboutUsContent.statistics.yearsOfService, label: "Years of Service" },
              { number: aboutUsContent.statistics.communitiesServed, label: "Communities Served" },
              { number: aboutUsContent.statistics.youthEmpowered, label: "Youth Empowered" },
              { number: aboutUsContent.statistics.culturalEvents, label: "Cultural Events" }
            ].map((stat, index) => {
              const icons = [Users, Calendar, Globe, Heart];
              const IconComponent = icons[index % icons.length];
              const colors = [
                'from-orange-500 to-red-500',
                'from-red-500 to-orange-600',
                'from-orange-600 to-red-600',
                'from-red-600 to-orange-500'
              ];
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="group"
                >
                  <div className="bg-gradient-to-br from-gray-50 to-orange-50 p-8 rounded-2xl text-center hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                    <div className="relative">
                      <div className={`w-20 h-20 bg-gradient-to-br ${colors[index]} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                      <p className="text-lg text-gray-700 font-medium">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founders & Leaders */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Our Leaders
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Visionaries who built our foundation</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {aboutUsContent.foundersAndLeaders.map((leader, index) => (
              <motion.div
                key={leader.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="group"
              >
                <div className="bg-white rounded-2xl p-8 text-center relative overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="w-36 h-36 mx-auto relative mb-6">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 p-1">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                        <Users className="h-16 w-16 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">{leader.name}</h3>
                    <p className="text-orange-600 font-semibold mb-4 text-lg">{leader.role}</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{leader.bio}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Our Core Values
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Principles rooted in ancient wisdom</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {aboutUsContent.coreValues.map((value, index) => {
              const icons = [Flower, Sun, TreePine, Heart, Shield, BookOpen];
              const IconComponent = icons[index % icons.length];
              const colors = [
                'from-orange-500 to-red-500',
                'from-red-500 to-orange-600',
                'from-orange-600 to-red-600',
                'from-red-600 to-orange-500',
                'from-orange-500 to-red-600',
                'from-red-500 to-orange-500'
              ];
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="bg-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                    <div className="relative">
                      <div className="flex items-center justify-center mb-6">
                        <div className={`w-16 h-16 bg-gradient-to-br ${colors[index % colors.length]} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-gray-900 mb-4 text-center">{value.name}</h3>
                      <p className="text-gray-700 text-sm leading-relaxed text-center">{value.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Awards & Recognitions */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Awards & Recognition
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Honors that celebrate our dedication</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {aboutUsContent.recognitions.map((recognition, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="group"
              >
                <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-yellow-200">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Award className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-3">{recognition.award}</h3>
                    <p className="text-orange-600 font-bold text-xl mb-2">{recognition.year}</p>
                    <p className="text-sm text-gray-600 mb-4 font-medium">{recognition.authority}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{recognition.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-orange-600 via-red-600 to-orange-800 text-white relative overflow-hidden">
        <div className="absolute top-10 left-10 text-yellow-300 opacity-20">
          <Flower className="w-24 h-24" />
        </div>
        <div className="absolute bottom-10 right-10 text-yellow-300 opacity-20">
          <Flower className="w-32 h-32" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Join Our Cultural Mission
            </h2>
            <div className="w-32 h-1 bg-yellow-400 mx-auto mb-6"></div>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-4xl mx-auto leading-relaxed">
              Be part of preserving Bihar's heritage while building a progressive future. Together, we honor our roots and nurture growth.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-orange-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-yellow-50 transition-all duration-300 shadow-xl"
              >
                Become a Member
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-yellow-300 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 hover:text-orange-700 transition-all duration-300"
              >
                Support Our Cause
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
