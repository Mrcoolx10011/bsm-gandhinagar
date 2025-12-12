import React from 'react';
import { RefreshCw, CreditCard, Clock, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';

export const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-600 to-orange-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <RefreshCw className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Refund & Cancellation Policy</h1>
            <p className="text-xl opacity-90">
              Understanding our refund and cancellation terms
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
                This Refund and Cancellation Policy outlines the terms under which Bihar Purvanchal Samaj 
                processes refunds for donations, memberships, and event registrations. As a registered NGO 
                (12A & 80G), we operate transparently and aim to handle all requests fairly.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mt-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> Our organization is officially registered as <strong>"Bihar Sanskritik Mandal"</strong> 
                  (12A & 80G registered under the Income Tax Act, 1961). All receipts, invoices, and tax certificates 
                  will be issued under the name "Bihar Sanskritik Mandal".
                </p>
              </div>
            </div>

            {/* Donations */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">1. Donations</h2>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">Important: Non-Refundable Policy</p>
                    <p className="text-gray-700">
                      <strong>Donations are generally non-refundable</strong> as they are voluntary contributions 
                      to support our charitable activities and are used immediately for our programs.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">1.1 When Refunds May Be Considered</h3>
              <p className="text-gray-700 mb-3">Refunds for donations will ONLY be processed in the following cases:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Technical Errors:</strong> Duplicate charges due to payment gateway issues</li>
                <li><strong>Unauthorized Transactions:</strong> Fraudulent or unauthorized payments (requires proof)</li>
                <li><strong>Amount Errors:</strong> Incorrect donation amount charged (higher than intended)</li>
                <li><strong>Failed Delivery:</strong> Tax receipt not issued despite multiple requests</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">1.2 Non-Refundable Situations</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Change of mind after donating</li>
                <li>Disagreement with how funds are used (within stated purposes)</li>
                <li>Donations made more than 7 days ago</li>
                <li>Donations where 80G tax receipt has already been issued</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">1.3 80G Tax Receipt Implications</h3>
              <p className="text-gray-700">
                If you have received an 80G tax receipt and claimed tax deduction, refunding the donation may 
                affect your tax filings. You are responsible for informing tax authorities about the refund.
              </p>
            </div>

            {/* Membership */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Membership</h2>

              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                <p className="text-gray-700">
                  <strong>Membership to Bihar Purvanchal Samaj is completely FREE.</strong> We do not charge 
                  any membership fees. Therefore, no refunds are applicable for membership registration as there 
                  are no payments involved.
                </p>
              </div>
            </div>

            {/* Events */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Event Registrations</h2>
              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                <p className="text-gray-700">
                  <strong>All events organized by Bihar Purvanchal Samaj are FREE of charge.</strong> There are 
                  no registration fees, and therefore no refunds are applicable for events.
                </p>
              </div>
            </div>

            {/* Refund Process */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">4. Refund Process</h2>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 How to Request a Refund</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-3 ml-4">
                <li className="leading-relaxed">
                  <strong>Contact Us:</strong> Email us at 
                  <a href="mailto:bsmvadodara@gmail.com" className="text-orange-600 hover:underline mx-1">
                    bsmvadodara@gmail.com
                  </a> 
                  or call 
                  <a href="tel:+919714037766" className="text-orange-600 hover:underline mx-1">
                    +91 9714037766
                  </a>
                </li>
                <li>Provide: Transaction ID, date, amount, and reason for refund</li>
                <li>Attach proof if applicable (duplicate payment screenshot, etc.)</li>
                <li>Our team will review your request within 3-5 business days</li>
                <li>You will receive a response via email</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Refund Timeline</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Approval:</strong> 3-5 business days for review</li>
                <li><strong>Processing:</strong> 5-7 business days after approval</li>
                <li><strong>Bank Credit:</strong> 7-10 business days (depends on your bank)</li>
                <li><strong>Total Time:</strong> Approximately 15-20 business days</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Refund Method</h3>
              <p className="text-gray-700 mb-3">
                Refunds will be processed to the <strong>original payment method</strong>:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Credit/Debit Card: Credited to the same card</li>
                <li>UPI: Credited to the same UPI ID</li>
                <li>Net Banking: Credited to the same bank account</li>
              </ul>
              <p className="text-gray-700 mt-3">
                We do not process refunds to different accounts for security reasons.
              </p>
            </div>

            {/* Payment Gateway Charges */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment Gateway Charges</h2>
              <p className="text-gray-700">
                Payment gateway charges (typically 2-3% of transaction) are non-refundable. 
                If a refund is approved, the gateway fee will be deducted from the refund amount.
              </p>
              <p className="text-gray-700 mt-3">
                <strong>Example:</strong> If you donated ₹1,000 and request a refund, you will receive 
                approximately ₹970 (₹1,000 - ₹30 gateway fee).
              </p>
            </div>

            {/* Exceptions */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Exceptions</h2>
              <p className="text-gray-700 mb-3">
                We reserve the right to make exceptions to this policy on a case-by-case basis at our discretion, 
                particularly for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Medical emergencies</li>
                <li>Natural disasters</li>
                <li>Death in the family</li>
                <li>Extreme financial hardship</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Documentation may be required to support your request.
              </p>
            </div>

            {/* Disputes */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disputes</h2>
              <p className="text-gray-700">
                If you disagree with our decision on a refund request, you may escalate to our management 
                team. However, all decisions made by Bihar Purvanchal Samaj management are final.
              </p>
            </div>

            {/* Changes */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to This Policy</h2>
              <p className="text-gray-700">
                We reserve the right to modify this Refund and Cancellation Policy at any time. 
                Changes will be effective immediately upon posting on our website.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-orange-50 rounded-lg p-6 mt-8">
              <div className="flex items-center gap-3 mb-4">
                <Phone className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">Contact Us for Refunds</h2>
              </div>
              <p className="text-gray-700 mb-4">
                For refund requests or questions, please contact:
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
              <p className="text-sm text-gray-600 mt-4">
                <strong>Business Hours:</strong> Monday - Saturday, 10:00 AM - 6:00 PM IST
              </p>
            </div>

            {/* Acknowledgment */}
            <div className="bg-gray-100 rounded-lg p-6">
              <p className="text-gray-700 text-center">
                <strong>By making a payment on our website, you acknowledge that you have read, understood, 
                and agree to this Refund and Cancellation Policy.</strong>
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};
