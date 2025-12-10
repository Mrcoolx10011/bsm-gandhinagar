import React from 'react';
import { FileText, CheckCircle, AlertTriangle, Scale } from 'lucide-react';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-600 to-orange-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms & Conditions</h1>
            <p className="text-xl opacity-90">
              Please read these terms carefully before using our services
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Bihar Purvanchal Samaj. By accessing or using our website 
                <a href="https://biharpurvanchalsamaj.org" className="text-orange-600 hover:underline mx-1">
                  https://biharpurvanchalsamaj.org
                </a>
                and services, you agree to be bound by these Terms and Conditions. If you disagree with any 
                part of these terms, please do not use our services.
              </p>
            </div>

            {/* About Us */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. About Bihar Purvanchal Samaj</h2>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Note:</strong> Our organization is officially registered as <strong>"Bihar Sanskritik Mandal"</strong> 
                  (12A & 80G registered under the Income Tax Act, 1961). All receipts, invoices, and tax certificates 
                  will be issued under the name "Bihar Sanskritik Mandal".
                </p>
              </div>
              <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded mb-4">
                <p className="text-gray-700">
                  <strong>Bihar Sanskritik Mandal</strong> is a registered Non-Governmental Organization (NGO) 
                  under the Income Tax Act, 1961:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>12A Registered:</strong> Tax-exempt organization</li>
                  <li><strong>80G Approved:</strong> Donations eligible for tax deductions</li>
                  <li><strong>Registered Address:</strong> 307/308 Pujer Complex, Subhanpura, Vadodara - 390023, Gujarat</li>
                </ul>
              </div>
            </div>

            {/* Use of Website */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use of Website</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Permitted Use</h3>
              <p className="text-gray-700 mb-3">You may use our website for:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Making donations to support our causes</li>
                <li>Becoming a member</li>
                <li>Registering for events</li>
                <li>Accessing information about our programs</li>
                <li>Contacting us for inquiries</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Prohibited Use</h3>
              <p className="text-gray-700 mb-3">You agree NOT to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Use the website for illegal purposes</li>
                <li>Attempt to hack, disrupt, or compromise security</li>
                <li>Submit false or misleading information</li>
                <li>Harass, abuse, or harm others</li>
                <li>Violate intellectual property rights</li>
                <li>Use automated systems to scrape content</li>
              </ul>
            </div>

            {/* Donations */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">4. Donations</h2>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Voluntary Contributions</h3>
              <p className="text-gray-700 mb-4">
                All donations are voluntary contributions to support our charitable activities. 
                By making a donation, you acknowledge that:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Donations are non-refundable (except in case of errors or duplicate transactions)</li>
                <li>You will receive an 80G tax receipt for donations above ₹500</li>
                <li>Donations will be used for the purposes stated on our website</li>
                <li>You are not purchasing goods or services</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Payment Processing</h3>
              <p className="text-gray-700 mb-4">
                We use Razorpay for secure payment processing. By making a donation, you agree to 
                Razorpay's Terms of Service and Privacy Policy.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Tax Benefits</h3>
              <p className="text-gray-700 mb-4">
                Donations are eligible for 50% tax deduction under Section 80G of the Income Tax Act, 1961. 
                Tax receipts will be issued as per Indian tax regulations. We are not responsible for changes 
                in tax laws or your personal tax situation.
              </p>
            </div>

            {/* Membership */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Membership</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Membership Terms</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Membership is subject to approval by our team</li>
                <li>We reserve the right to reject any membership application</li>
                <li>Membership fees are non-refundable once approved</li>
                <li>Members must adhere to our code of conduct</li>
                <li>Membership can be terminated for violations</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.2 Member Responsibilities</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Provide accurate information</li>
                <li>Maintain confidentiality of login credentials</li>
                <li>Participate in community activities ethically</li>
                <li>Report any violations or concerns</li>
              </ul>
            </div>

            {/* Events */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Events & Programs</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Event registration is subject to availability</li>
                <li>We reserve the right to cancel or reschedule events</li>
                <li>Refunds for cancelled events will be processed as per our refund policy</li>
                <li>Participants must follow event guidelines and safety protocols</li>
                <li>We are not liable for personal injuries or losses during events</li>
              </ul>
            </div>

            {/* Intellectual Property */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 mb-3">
                All content on this website, including text, images, logos, graphics, and software, is the 
                property of Bihar Purvanchal Samaj or its licensors and is protected by copyright and trademark laws.
              </p>
              <p className="text-gray-700">
                You may not reproduce, distribute, modify, or create derivative works without our written permission.
              </p>
            </div>

            {/* Disclaimer */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">8. Disclaimer of Warranties</h2>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded">
                <p className="text-gray-700 mb-3">
                  Our website and services are provided "AS IS" and "AS AVAILABLE" without warranties of any kind. 
                  We do not guarantee that:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>The website will be uninterrupted or error-free</li>
                  <li>Defects will be corrected</li>
                  <li>The website is free from viruses or harmful components</li>
                  <li>Information provided is accurate or complete</li>
                </ul>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700">
                To the fullest extent permitted by law, Bihar Purvanchal Samaj shall not be liable for any 
                indirect, incidental, special, consequential, or punitive damages arising from your use of 
                our website or services, including but not limited to loss of profits, data, or goodwill.
              </p>
            </div>

            {/* Third-Party Links */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Third-Party Links</h2>
              <p className="text-gray-700">
                Our website may contain links to third-party websites. We are not responsible for the content, 
                privacy practices, or terms of these external sites. Accessing third-party links is at your own risk.
              </p>
            </div>

            {/* Privacy */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Privacy</h2>
              <p className="text-gray-700">
                Your use of our services is also governed by our 
                <a href="/privacy-policy" className="text-orange-600 hover:underline mx-1">Privacy Policy</a>. 
                Please review it to understand how we collect, use, and protect your information.
              </p>
            </div>

            {/* Changes to Terms */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these Terms and Conditions at any time. Changes will be effective 
                immediately upon posting. Continued use of our services after changes constitutes acceptance of 
                the modified terms.
              </p>
            </div>

            {/* Termination */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Termination</h2>
              <p className="text-gray-700">
                We may terminate or suspend your access to our services immediately, without prior notice, 
                for any reason, including breach of these Terms and Conditions.
              </p>
            </div>

            {/* Governing Law */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">14. Governing Law</h2>
              </div>
              <p className="text-gray-700 mb-3">
                These Terms and Conditions are governed by the laws of India. Any disputes shall be subject to 
                the exclusive jurisdiction of the courts in Vadodara, Gujarat.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-orange-50 rounded-lg p-6 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about these Terms and Conditions, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Bihar Purvanchal Samaj</strong></p>
                <p>307/308 Pujer Complex, Subhanpura</p>
                <p>Vadodara - 390023, Gujarat, India</p>
                <p>Phone: <a href="tel:+919714037766" className="text-orange-600 hover:underline">+91 9714037766</a></p>
                <p>Email: <a href="mailto:bsmvadodara@gmail.com" className="text-orange-600 hover:underline">bsmvadodara@gmail.com</a></p>
              </div>
            </div>

            {/* Acceptance */}
            <div className="bg-gray-100 rounded-lg p-6">
              <p className="text-gray-700 text-center">
                <strong>By using our website and services, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms and Conditions.</strong>
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
