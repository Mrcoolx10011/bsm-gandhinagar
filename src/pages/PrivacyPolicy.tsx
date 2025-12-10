import React from 'react';
import { Shield, Lock, Eye, Mail, Phone, MapPin } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-600 to-orange-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl opacity-90">
              How we protect and handle your personal information
            </p>
            <p className="text-sm mt-4 opacity-75">Last Updated: December 9, 2025</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 space-y-8">
            
            {/* Introduction */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Bihar Purvanchal Samaj ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you visit our website <a href="https://biharpurvanchalsamaj.org" className="text-orange-600 hover:underline">https://biharpurvanchalsamaj.org</a> 
                , make donations, or interact with our services.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mt-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> Our organization is officially registered as <strong>"Bihar Sanskritik Mandal"</strong> 
                  (12A & 80G registered under the Income Tax Act, 1961). All receipts, invoices, and tax certificates 
                  will be issued under the name "Bihar Sanskritik Mandal".
                </p>
              </div>
            </div>

            {/* Information We Collect */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Personal Information</h3>
              <p className="text-gray-700 mb-3">We may collect the following personal information:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Name and contact details (email, phone number, address)</li>
                <li>Donation information (amount, payment method, transaction ID)</li>
                <li>Membership details</li>
                <li>Event registration information</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Automatically Collected Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>

            {/* How We Use Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Process donations and issue 80G tax receipts</li>
                <li>Manage memberships and event registrations</li>
                <li>Send updates about our programs and activities</li>
                <li>Respond to inquiries and provide customer support</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
                <li>Prevent fraud and enhance security</li>
              </ul>
            </div>

            {/* Payment Information */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">Payment Information Security</h2>
              </div>
              <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Important:</strong> We use Razorpay, a PCI-DSS compliant payment gateway, for processing donations. 
                  We do not store your credit/debit card information or UPI details on our servers. All payment 
                  information is encrypted and securely processed by Razorpay.
                </p>
              </div>
            </div>

            {/* Third-Party Services */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
              <p className="text-gray-700 mb-3">We use the following third-party services:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Razorpay:</strong> Payment processing (donations)</li>
                <li><strong>ImageKit:</strong> Image hosting and optimization</li>
                <li><strong>EmailJS:</strong> Email communication</li>
                <li><strong>Google reCAPTCHA:</strong> Spam protection</li>
                <li><strong>MongoDB Atlas:</strong> Secure data storage</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Each service has its own privacy policy. We recommend reviewing their policies.
              </p>
            </div>

            {/* Data Sharing */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
              <p className="text-gray-700 mb-3">
                We do not sell, trade, or rent your personal information to third parties. 
                We may share information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>With service providers who assist in our operations</li>
                <li>When required by law or legal process</li>
                <li>To protect our rights and safety</li>
                <li>With your explicit consent</li>
              </ul>
            </div>

            {/* Anonymous Donations */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Anonymous Donations</h2>
              <p className="text-gray-700">
                You can choose to make anonymous donations. In such cases, your name will not be displayed 
                publicly, but we retain your contact information for legal and tax receipt purposes.
              </p>
            </div>

            {/* Data Retention */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
              <p className="text-gray-700">
                We retain your personal information for as long as necessary to fulfill the purposes outlined 
                in this policy, comply with legal obligations (including tax and accounting requirements), 
                and resolve disputes. Donation records are kept for at least 7 years as per Indian tax laws.
              </p>
            </div>

            {/* Cookies */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
              <p className="text-gray-700 mb-3">
                We use cookies and similar technologies to enhance your experience. You can control cookies 
                through your browser settings. Note that disabling cookies may affect website functionality.
              </p>
            </div>

            {/* Your Rights */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-3">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Opt-out of marketing communications</li>
                <li>Lodge a complaint with data protection authorities</li>
              </ul>
            </div>

            {/* Security */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700">
                We implement appropriate technical and organizational measures to protect your personal information. 
                However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security 
                but strive to protect your data using industry-standard practices.
              </p>
            </div>

            {/* Children's Privacy */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
              <p className="text-gray-700">
                Our services are not directed to individuals under 18 years of age. We do not knowingly collect 
                personal information from children. If you are a parent/guardian and believe your child has provided 
                us with information, please contact us.
              </p>
            </div>

            {/* Updates */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Updates</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with 
                an updated "Last Updated" date. We encourage you to review this policy periodically.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-orange-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
              </div>
              <p className="text-gray-700 mb-4">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Bihar Purvanchal Samaj</p>
                    <p className="text-gray-700">307/308 Pujer Complex, Subhanpura</p>
                    <p className="text-gray-700">Vadodara - 390023, Gujarat, India</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-orange-600" />
                  <a href="tel:+919714037766" className="text-gray-700 hover:text-orange-600">+91 9714037766</a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-orange-600" />
                  <a href="mailto:bsmvadodara@gmail.com" className="text-gray-700 hover:text-orange-600">bsmvadodara@gmail.com</a>
                </div>
              </div>
            </div>

            {/* Governing Law */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
              <p className="text-gray-700">
                This Privacy Policy is governed by the laws of India. Any disputes will be subject to the 
                exclusive jurisdiction of the courts in Vadodara, Gujarat.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
