import React from 'react';
import { Users, Heart, Award, Target, Eye } from 'lucide-react';
import { aboutUsContent } from '../data/aboutUsContent';

export const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-600 to-red-600 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              बिहार संस्कृतिक मंडल
            </h1>
            <p className="text-xl md:text-2xl mb-4">
              {aboutUsContent.taglines[1]}
            </p>
            <p className="text-lg opacity-90 max-w-3xl mx-auto">
              {aboutUsContent.introduction.english}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Mission & Vision
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-orange-50 p-8 rounded-xl animate-fade-in">
              <div className="flex items-center mb-4">
                <Target className="h-8 w-8 text-orange-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Mission</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {aboutUsContent.missionVision.mission.english}
              </p>
            </div>
            
            <div className="bg-red-50 p-8 rounded-xl animate-fade-in">
              <div className="flex items-center mb-4">
                <Eye className="h-8 w-8 text-red-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Vision</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {aboutUsContent.missionVision.vision.english}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Impact</h2>
            <p className="text-xl opacity-90">Numbers that tell our story</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {Object.entries(aboutUsContent.statistics).map(([key, value]) => (
              <div
                key={key}
                className="text-center animate-fade-in"
              >
                <div className="text-3xl md:text-4xl font-bold mb-2">{value}</div>
                <div className="text-sm md:text-base opacity-90 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600">From humble beginnings to cultural leadership</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Founded in {aboutUsContent.history.founding.year}
              </h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {aboutUsContent.history.founding.context}
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {aboutUsContent.history.earlyDays}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {aboutUsContent.history.modernEra}
              </p>
            </div>
            
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Milestones</h3>
              {aboutUsContent.history.milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                    {milestone.year.slice(-2)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{milestone.year}</div>
                    <div className="text-gray-700">{milestone.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founders & Leaders */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Leaders
            </h2>
            <p className="text-xl text-gray-600">Visionaries who built our foundation</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aboutUsContent.foundersAndLeaders.map((leader) => (
              <div
                key={leader.id}
                className="bg-gray-50 rounded-xl p-6 text-center animate-fade-in"
              >
                <div className="w-32 h-32 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{leader.name}</h3>
                <p className="text-orange-600 font-semibold mb-4">{leader.role}</p>
                <p className="text-gray-700 text-sm leading-relaxed">{leader.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600">Principles that guide our every action</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aboutUsContent.coreValues.map((value, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-fade-in"
              >
                <div className="flex items-center mb-3">
                  <Heart className="h-6 w-6 text-orange-600 mr-3" />
                  <h3 className="text-lg font-bold text-gray-900">{value.name}</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Recognitions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Awards & Recognition
            </h2>
            <p className="text-xl text-gray-600">Honors that acknowledge our dedication</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {aboutUsContent.recognitions.map((recognition, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl text-center animate-fade-in"
              >
                <Award className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">{recognition.award}</h3>
                <p className="text-orange-600 font-semibold mb-2">{recognition.year}</p>
                <p className="text-sm text-gray-600 mb-3">{recognition.authority}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{recognition.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join Our Cultural Mission
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Be part of preserving Bihar's heritage while building a progressive future
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Become a Member
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors">
                Support Our Cause
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
