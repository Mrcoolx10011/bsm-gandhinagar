import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Organization Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-0">
              <img 
                src="/bihar-cultural-logo.png" 
                alt="Bihar Purvanchal Samaj Logo" 
                className="w-16 h-16 object-contain rounded-lg"
              />
              <div>
                <span className="text-lg font-heading font-bold">Bihar Purvanchal Samaj</span>
                <p className="text-xs text-gray-400">संस्कृति की जड़ें | समाज का कल्याण</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Dedicated to preserving Bihar's cultural heritage and empowering our community through 
              traditional arts, social initiatives, and progressive programs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
              <li><a href="/members" className="text-gray-300 hover:text-white transition-colors">Our Members</a></li>
              <li><a href="/events" className="text-gray-300 hover:text-white transition-colors">Events</a></li>
              <li><a href="/donations" className="text-gray-300 hover:text-white transition-colors">Donate</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Programs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Our Programs</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Education Support</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Healthcare</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Community Development</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Environmental</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Women Empowerment</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0 mt-1" />
                <span className="text-gray-300">307/308 Pujer Complex<br />Subhanpura, Vadodara - 390023<br />Gujarat, India</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <a 
                  href="tel:+919714037766" 
                  className="text-gray-300 hover:text-orange-400 transition-colors"
                >
                  +91 9714037766
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-orange-400 flex-shrink-0 mt-1" />
                <div className="flex flex-col space-y-1">
                  <a 
                    href="mailto:bsmvadodara@gmail.com" 
                    className="text-gray-300 hover:text-orange-400 transition-colors"
                  >
                    bsmvadodara@gmail.com
                  </a>
                  <a 
                    href="mailto:biharpurvanchalsamaj@gmail.com" 
                    className="text-gray-300 hover:text-orange-400 transition-colors"
                  >
                    biharpurvanchalsamaj@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 mb-8">
          <div className="text-center mb-8">
            <h3 className="text-white text-lg font-semibold mb-2">
              Certified & Trusted Organization
            </h3>
            <p className="text-gray-400 text-sm">
              Registered with Government of India | NITI Aayog Partner | CSR-1 Certified
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* Left Side - Certificate Logos */}
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              {/* 80G and 12A Certificate */}
              <div className="bg-white p-3 rounded-lg shadow-xl w-64 h-52 flex items-center justify-center">
                <img 
                  src="/80g-and-12a.jpeg" 
                  alt="80G and 12A Registration Certificate - Income Tax Department, Government of India"
                  className="w-full h-full object-contain rounded"
                />
              </div>

              {/* NITI Aayog Logo */}
              <div className="bg-white p-4 rounded-lg shadow-xl w-52 h-52 flex items-center justify-center">
                <img 
                  src="/NITI_Aayog_logo.svg.png" 
                  alt="NITI Aayog - Government of India Partner Organization"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* CSR-1 Logo */}
              <div className="bg-white p-4 rounded-lg shadow-xl w-52 h-52 flex items-center justify-center">
                <img 
                  src="/cs.jpeg" 
                  alt="CSR-1 Registration Certificate - Ministry of Corporate Affairs"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Right Side - Badge Summary */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">12A Registered</p>
                  <p className="text-gray-400 text-xs">Income Tax Act</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">80G Approved</p>
                  <p className="text-gray-400 text-xs">Tax Exemption</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">CSR-1 Registered</p>
                  <p className="text-gray-400 text-xs">Ministry of Corporate Affairs</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">NITI Aayog Partner</p>
                  <p className="text-gray-400 text-xs">Government of India</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-400 text-xs">
              ✓ All donations are eligible for 50% tax deduction under Section 80G
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Bihar Purvanchal Samaj. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
};
