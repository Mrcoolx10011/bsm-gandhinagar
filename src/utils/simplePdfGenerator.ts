import jsPDF from 'jspdf';

/**
 * Convert number to words (Indian style)
 */
const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  if (num < 0) return 'Minus ' + numberToWords(-num);
  
  let result = '';
  
  // Crores
  if (num >= 10000000) {
    result += numberToWords(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }
  
  // Lakhs
  if (num >= 100000) {
    result += numberToWords(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  
  // Thousands
  if (num >= 1000) {
    result += numberToWords(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  
  // Hundreds
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  
  // Tens and ones
  if (num >= 20) {
    result += tens[Math.floor(num / 10)];
    if (num % 10 !== 0) {
      result += ' ' + ones[num % 10];
    }
  } else if (num >= 10) {
    result += teens[num - 10];
  } else if (num > 0) {
    result += ones[num];
  }
  
  return result.trim();
};

export interface SimpleReceiptData {
  receiptNo: string;
  date: string;
  donorName: string;
  address: string;
  phone: string;
  email: string;
  amount: number;
  campaign: string;
  transactionId?: string;
}

/**
 * Generate simple donation receipt (matches your format)
 */
export const generateSimpleReceipt = (data: SimpleReceiptData): void => {
  const doc = new jsPDF();
  
  let y = 20;
  
  // Logo placeholder (you can add logo image here later)
  // doc.addImage(logoBase64, 'PNG', 15, 10, 30, 30); // Uncomment when logo is available
  
  // Main Header - Organization Name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BIHAR PURVANCHAL SAMAJ GANDHINAGAR', 105, y, { align: 'center' });
  
  y += 10;
  // Address Line 1
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('307/308 Pujer Complex, Subhanpura, Vadodara - 390023', 105, y, { align: 'center' });
  
  y += 6;
  // Contact Details Line
  doc.text('Phone: 9714037766  Email: bsmvadodara@gmail.com', 105, y, { align: 'center' });
  
  y += 6;
  // Website
  doc.text('Website: www.biharsamaj.com', 105, y, { align: 'center' });
  
  y += 10;
  // Registration details - Line 1
  doc.setFontSize(9);
  doc.text('Regd. No.: A-2676     PAN No.: AACTB4197R', 105, y, { align: 'center' });
  
  y += 5;
  // Registration details - Line 2
  doc.text('I.T. Exemption Cert. No. (80G No.): AACTB4197RF20009', 105, y, { align: 'center' });
  
  y += 15;
  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Donation Receipt', 105, y, { align: 'center' });
  
  y += 20;
  // Receipt details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt No.: ${data.receiptNo}`, 20, y);
  doc.text(`F.Y.: 2025-2026`, 105, y, { align: 'center' });
  doc.text(`Date: ${data.date}`, 180, y, { align: 'right' });
  
  y += 15;
  // Donor details with underlines (simple format)
  const addLine = (label: string, value: string) => {
    doc.text(`${label}: ${value}`, 20, y);
    // Simple underline
    doc.line(20 + doc.getTextWidth(`${label}: `), y + 1, 190, y + 1);
    y += 10;
  };
  
  addLine('Received with thanks from Ms./Mr./Mrs.', data.donorName);
  addLine('Address', data.address);
  
  // Phone and email on same line
  doc.text(`Tel. No.: ${data.phone}`, 20, y);
  doc.text(`Email: ${data.email}`, 120, y);
  doc.line(20 + doc.getTextWidth('Tel. No.: '), y + 1, 110, y + 1);
  doc.line(120 + doc.getTextWidth('Email: '), y + 1, 190, y + 1);
  y += 10;
  
  addLine('Rupees', `${numberToWords(data.amount)} Only`);
  addLine('on a/c of: Voluntary Donation', `for: ${data.campaign}`);
  addLine('Date', data.date);
  
  if (data.transactionId && data.transactionId !== 'N/A') {
    addLine('Transaction ID', data.transactionId);
  }
  
  y += 10;
  // Amount box (simple)
  doc.rect(20, y, 50, 15);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${data.amount.toLocaleString('en-IN')}/-`, 45, y + 10, { align: 'center' });
  
  // Thank you and signature
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('For Bihar Purvanchal Samaj', 120, y + 5);
  doc.text('Thank You', 145, y + 15, { align: 'center' });
  doc.text('Signature: _______________', 130, y + 25);
  
  // Save and download
  doc.save(`Receipt_${data.receiptNo}_${data.donorName.replace(/\s+/g, '_')}.pdf`);
  
  console.log(`📄 PDF receipt generated and downloaded: Receipt_${data.receiptNo}_${data.donorName.replace(/\s+/g, '_')}.pdf`);
};

/**
 * Generate PDF receipt as blob for email attachment
 * @param data - Receipt data
 * @returns PDF blob, filename, and base64 data
 */
export const generateReceiptBlob = async (data: SimpleReceiptData): Promise<{ blob: Blob; filename: string; base64: string }> => {
  const doc = new jsPDF();
  
  let y = 20;
  
  // Logo placeholder (you can add logo image here later)
  // doc.addImage(logoBase64, 'PNG', 15, 10, 30, 30); // Uncomment when logo is available
  
  // Main Header - Organization Name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BIHAR PURVANCHAL SAMAJ GANDHINAGAR', 105, y, { align: 'center' });
  
  y += 10;
  // Address Line 1
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('307/308 Pujer Complex, Subhanpura, Vadodara - 390023', 105, y, { align: 'center' });
  
  y += 6;
  // Contact Details Line
  doc.text('Phone: 9714037766  Email: bsmvadodara@gmail.com', 105, y, { align: 'center' });
  
  y += 6;
  // Website
  doc.text('Website: www.biharsamaj.com', 105, y, { align: 'center' });
  
  y += 10;
  // Registration details - Line 1
  doc.setFontSize(9);
  doc.text('Regd. No.: A-2676     PAN No.: AACTB4197R', 105, y, { align: 'center' });
  
  y += 5;
  // Registration details - Line 2
  doc.text('I.T. Exemption Cert. No. (80G No.): AACTB4197RF20009', 105, y, { align: 'center' });
  
  y += 15;
  // Receipt details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt No.: ${data.receiptNo}`, 20, y);
  doc.text(`F.Y.: 2025-2026`, 105, y, { align: 'center' });
  doc.text(`Date: ${data.date}`, 180, y, { align: 'right' });
  
  y += 15;
  // Donor details with underlines (simple format)
  const addLine = (label: string, value: string) => {
    doc.text(`${label}: ${value}`, 20, y);
    // Simple underline
    doc.line(20 + doc.getTextWidth(`${label}: `), y + 1, 190, y + 1);
    y += 10;
  };
  
  addLine('Received with thanks from Ms./Mr./Mrs.', data.donorName);
  addLine('Address', data.address);
  
  // Phone and email on same line
  doc.text(`Tel. No.: ${data.phone}`, 20, y);
  doc.text(`Email: ${data.email}`, 120, y);
  doc.line(20 + doc.getTextWidth('Tel. No.: '), y + 1, 110, y + 1);
  doc.line(120 + doc.getTextWidth('Email: '), y + 1, 190, y + 1);
  y += 10;
  
  addLine('Rupees', `${numberToWords(data.amount)} Only`);
  addLine('on a/c of: Voluntary Donation', `for: ${data.campaign}`);
  addLine('Date', data.date);
  
  if (data.transactionId && data.transactionId !== 'N/A') {
    addLine('Transaction ID', data.transactionId);
  }
  
  // Amount box
  y += 10;
  doc.rect(20, y, 70, 20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${data.amount.toLocaleString('en-IN')}/-`, 55, y + 12, { align: 'center' });
  
  // Thank you and signature
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('For Bihar Purvanchal Samaj', 120, y + 5);
  doc.text('Thank You', 145, y + 15, { align: 'center' });
  doc.text('Signature: _______________', 130, y + 25);
  
  // Generate blob and base64
  const pdfBlob = doc.output('blob');
  const pdfBase64 = doc.output('datauristring'); // Get base64 data URI
  const filename = `BSM_Receipt_${data.donorName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  
  console.log(`📄 PDF receipt blob generated: ${filename}`);
  
  return { blob: pdfBlob, filename, base64: pdfBase64 };
};

/**
 * Helper to create receipt from donation (simple)
 */
export const createSimpleReceiptFromDonation = (donation: any): SimpleReceiptData => {
  return {
    receiptNo: donation.id?.slice(-6).toUpperCase() || Math.random().toString(36).substr(2, 6).toUpperCase(),
    date: new Date().toLocaleDateString('en-IN'),
    donorName: donation.donorName || donation.name || 'Anonymous',
    address: donation.address || 'Address not provided',
    phone: donation.phone || 'Not provided',
    email: donation.email || 'Not provided',
    amount: donation.amount || 0,
    campaign: donation.campaign || 'General Fund',
    transactionId: donation.transactionId || donation.razorpay_payment_id || 'N/A'
  };
};