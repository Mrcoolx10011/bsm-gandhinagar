import emailjs from 'emailjs-com';
import { generateSimpleReceipt, createSimpleReceiptFromDonation, generateReceiptBlob } from './simplePdfGenerator';

/**
 * Initialize EmailJS with your public key
 */
export const initEmailJS = () => {
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (publicKey) {
    emailjs.init(publicKey);
  }
};

/**
 * Donation object interface for PDF generation
 */
export interface DonationForReceipt {
  id: string;
  donorName: string;
  email: string;
  phone: string;
  amount: number;
  campaign: string;
  paymentMethod: string;
  transactionId: string;
  date: string;
  message?: string;
}

/**
 * Send donation approval email to donor
 * @param donorEmail - Recipient email address
 * @param donorName - Name of the donor
 * @param amount - Donation amount
 * @param campaign - Campaign name
 * @param donationObject - Optional: Full donation object for PDF receipt generation
 */
export const sendDonationApprovalEmail = async (
  donorEmail: string,
  donorName: string,
  amount: number,
  campaign: string,
  donationObject?: DonationForReceipt
): Promise<boolean> => {
  try {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    console.log('🔍 EmailJS Configuration Check:');
    console.log('Service ID:', serviceId ? '✅ Set' : '❌ Missing');
    console.log('Template ID:', templateId ? '✅ Set' : '❌ Missing');
    console.log('Public Key:', publicKey ? '✅ Set' : '❌ Missing');

    if (!serviceId || !templateId || !publicKey) {
      console.error('❌ EmailJS configuration missing');
      console.error('Missing values:', {
        serviceId: !serviceId,
        templateId: !templateId,
        publicKey: !publicKey,
      });
      return false;
    }

    // Check if we have donation object for PDF generation
    console.log('🔍 Checking for donation object:', {
      hasDonationObject: !!donationObject,
      donationId: donationObject?.id
    });
    
    if (donationObject) {
      try {
        console.log('📄 Starting PDF generation process for donation:', donationObject.id);
        const receiptData = createSimpleReceiptFromDonation(donationObject);
        
        // 1. Download PDF locally for admin
        console.log('📄 Generating local PDF...');
        await generateSimpleReceipt(receiptData);
        console.log('✅ PDF receipt downloaded locally');
        
        // 2. Upload PDF to ImageKit and send email with link
        console.log('📄 Generating PDF blob for ImageKit upload...');
        const { base64 } = await generateReceiptBlob(receiptData);
        
        console.log('📄 Receipt data for upload:', {
          receiptNo: receiptData.receiptNo,
          donorName: donationObject.donorName,
          hasBase64: !!base64,
          base64Length: base64?.length
        });
        
        try {
          const fileName = `BSM_Receipt_${receiptData.receiptNo}_${donorName.replace(/\s+/g, '_')}.pdf`;
          console.log('📤 Uploading to ImageKit with filename:', fileName);
          
          const uploadResponse = await fetch('/api/consolidated?endpoint=upload-pdf-to-imagekit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pdfBase64: base64,
              fileName: fileName,
              receiptData: receiptData
            })
          });
          
          console.log('📤 Upload response status:', uploadResponse.status);
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            console.log('✅ PDF uploaded to ImageKit:', uploadResult.url);
            
            // Send ONLY ONE EMAIL with PDF download link
            const templateParams = {
              to_email: donorEmail,
              to_name: donorName,
              donor_name: donorName,
              amount: String(amount),
              campaign: campaign,
              from_name: 'BSM Gandhinagar',
              message: `📄 Your donation receipt is ready for download!

Click here to download your official receipt:
${uploadResult.url}

Thank you for your generous donation of ₹${amount} to ${campaign}.

Best regards,
Bihar Purvanchal Samaj Gandhinagar`
            };
            
            console.log('📧 Sending single email with PDF link:', {
              to: donorEmail,
              templateParams,
            });
            
            // Initialize EmailJS with public key before sending
            emailjs.init(publicKey);
            
            const response = await emailjs.send(
              serviceId,
              templateId,
              templateParams
            );

            console.log('✅ Email with PDF link sent successfully:', response.status, response.text);
            return true;
            
          } else {
            const errorResult = await uploadResponse.json().catch(() => ({ error: 'Unknown error' }));
            console.log('❌ Failed to upload PDF to ImageKit:', {
              status: uploadResponse.status,
              error: errorResult
            });
            
            // Fallback: Send email without PDF link
            return await sendSimpleApprovalEmail(donorEmail, donorName, amount, campaign, serviceId, templateId, publicKey);
          }
        } catch (uploadError) {
          console.log('⚠️ ImageKit upload failed:', uploadError);
          
          // Fallback: Send email without PDF link
          return await sendSimpleApprovalEmail(donorEmail, donorName, amount, campaign, serviceId, templateId, publicKey);
        }
        
      } catch (pdfError) {
        console.error('❌ Failed to generate PDF receipt:', pdfError);
        
        // Fallback: Send email without PDF link
        return await sendSimpleApprovalEmail(donorEmail, donorName, amount, campaign, serviceId, templateId, publicKey);
      }
    } else {
      // No donation object: Send simple approval email
      return await sendSimpleApprovalEmail(donorEmail, donorName, amount, campaign, serviceId, templateId, publicKey);
    }

  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      text: error.text,
      fullError: error,
    });
    return false;
  }
};

// Helper function for simple approval email (fallback)
const sendSimpleApprovalEmail = async (
  donorEmail: string,
  donorName: string,
  amount: number,
  campaign: string,
  serviceId: string,
  templateId: string,
  publicKey: string
): Promise<boolean> => {
  try {
    const templateParams = {
      to_email: donorEmail,
      to_name: donorName,
      donor_name: donorName,
      amount: String(amount),
      campaign: campaign,
      from_name: 'BSM Gandhinagar',
      message: `Your donation of ₹${amount} for the campaign "${campaign}" has been approved.

Thank you for your generous support!

Best regards,
Bihar Purvanchal Samaj Gandhinagar`
    };

    console.log('📧 Sending simple approval email (fallback):', {
      to: donorEmail,
      templateParams,
    });
    
    // Initialize EmailJS with public key before sending
    emailjs.init(publicKey);
    
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams
    );

    console.log('✅ Simple approval email sent successfully:', response.status, response.text);
    return true;
  } catch (error) {
    console.error('❌ Failed to send simple approval email:', error);
    return false;
  }
};

/**
 * Send email with PDF attachment via backend API
 * @param donation - Donation object
 * @returns Promise<boolean> - Success status
 */
export const sendEmailWithPDFAttachment = async (donation: DonationForReceipt): Promise<boolean> => {
  try {
    console.log('📧 Sending email with PDF attachment via backend API...');
    
    // Generate PDF receipt data
    const receiptData = createSimpleReceiptFromDonation(donation);
    const { base64 } = await generateReceiptBlob(receiptData);
    
    // Send to backend API endpoint
    const response = await fetch('/api/consolidated?endpoint=send-email-with-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        donorEmail: donation.email,
        donorName: donation.donorName,
        amount: donation.amount,
        campaign: donation.campaign,
        pdfBase64: base64,
        receiptData: receiptData
      })
    });
    
    if (response.ok) {
      console.log('✅ Email with PDF sent successfully via backend');
      return true;
    } else {
      console.log('❌ Backend email service failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend email service error:', error);
    return false;
  }
};

/**
 * Create email with PDF attachment option (opens default email client)
 * @param donorEmail - Recipient email address
 * @param donorName - Name of the donor
 * @param amount - Donation amount
 * @param campaign - Campaign name
 * @returns void
 */
export const openEmailWithPDFInstruction = (
  donorEmail: string,
  donorName: string,
  amount: number,
  campaign: string
) => {
  const subject = `BSM Gandhinagar - Donation Receipt & Approval Confirmation`;
  const body = `Dear ${donorName},

Thank you for your generous donation of ₹${amount} for the campaign "${campaign}".

Your donation has been approved and processed successfully.

Please find your official receipt attached to this email.

For any queries, please contact us.

Best regards,
Bihar Purvanchal Samaj Gandhinagar
Registration Number: BSM/2024/REG001`;

  const mailtoLink = `mailto:${donorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  // Open default email client
  window.open(mailtoLink);
  
  console.log('📧 Email client opened with receipt template');
};

/**
 * Send donation rejection/failed email to donor
 * @param donorEmail - Recipient email address
 * @param donorName - Name of the donor
 * @param amount - Donation amount
 * @param campaign - Campaign name
 */
export const sendDonationRejectionEmail = async (
  donorEmail: string,
  donorName: string,
  amount: number,
  campaign: string
): Promise<boolean> => {
  try {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_REJECTION;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error('❌ EmailJS configuration missing for rejection email');
      return false;
    }

    const templateParams = {
      to_email: donorEmail,
      to_name: donorName,
      donor_name: donorName,
      amount: amount,
      campaign: campaign,
      subject: 'Donation Status Update - BSM Gandhinagar',
    };

    console.log('📧 Sending rejection email to:', donorEmail);
    
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );

    console.log('✅ Rejection email sent successfully:', response.status, response.text);
    return true;
  } catch (error) {
    console.error('❌ Failed to send rejection email:', error);
    return false;
  }
};
