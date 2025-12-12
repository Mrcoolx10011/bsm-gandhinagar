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
 * Generate professional donation receipt with logo, table, and signature
 */
export const generateSimpleReceipt = (data: SimpleReceiptData): void => {
  const doc = new jsPDF();
  
  // Add orange border around entire page
  doc.setDrawColor(255, 140, 0); // Orange color
  doc.setLineWidth(1);
  doc.rect(5, 5, 200, 287);
  
  // Inner border
  doc.setLineWidth(0.5);
  doc.rect(8, 8, 194, 281);
  
  let y = 20;
  
  // Add Logo (left side)
  try {
    const logoImg = new Image();
    logoImg.src = '/bihar-cultural-logo.png';
    doc.addImage(logoImg, 'PNG', 15, 15, 25, 25);
  } catch (error) {
    console.log('Logo not found, continuing without logo');
  }
  
  // Main Header - Organization Name (Official Registered Name)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 140, 0); // Orange
  doc.text('BIHAR SANSKRITIK MANDAL', 105, y, { align: 'center' });
  doc.setTextColor(0, 0, 0); // Black
  
  y += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('(Operating as Bihar Purvanchal Samaj Gandhinagar)', 105, y, { align: 'center' });
  
  y += 8;
  // Address
  doc.setFontSize(9);
  doc.text('307/308 Pujer Complex, Subhanpura, Vadodara - 390023, Gujarat', 105, y, { align: 'center' });
  
  y += 5;
  doc.text('Phone: +91 9714037766  |  Email: bsmvadodara@gmail.com', 105, y, { align: 'center' });
  
  y += 5;
  doc.text('Website: https://biharpurvanchalsamaj.org', 105, y, { align: 'center' });
  
  y += 8;
  // Registration details box
  doc.setFillColor(255, 248, 240); // Light orange background
  doc.rect(15, y - 3, 180, 12, 'F');
  doc.setFontSize(8);
  doc.text('Regd. No.: A-2676  |  PAN: AACTB4197R  |  80G No.: AACTB4197RF20009  |  12A Registered', 105, y + 3, { align: 'center' });
  
  y += 15;
  // Title with underline
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 140, 0);
  doc.text('DONATION RECEIPT', 105, y, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(40, y + 2, 170, y + 2);
  doc.setTextColor(0, 0, 0);
  
  y += 12;
  // Receipt metadata
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt No: ${data.receiptNo}`, 15, y);
  doc.text(`Financial Year: 2025-2026`, 105, y, { align: 'center' });
  doc.text(`Date: ${data.date}`, 195, y, { align: 'right' });
  
  y += 10;
  
  // Donor Details Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DONOR DETAILS', 15, y);
  
  y += 5;
  // Table with borders
  const tableStartY = y;
  const rowHeight = 10;
  const col1Width = 60;
  const col2Width = 120;
  
  // Table rows
  const tableData = [
    ['Donor Name', data.donorName],
    ['Address', data.address],
    ['Phone Number', data.phone],
    ['Email Address', data.email],
    ['Purpose', data.campaign],
    ['Payment ID', data.transactionId || 'N/A']
  ];
  
  tableData.forEach((row, index) => {
    const currentY = tableStartY + (index * rowHeight);
    
    // Draw row borders
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(15, currentY, col1Width, rowHeight);
    doc.rect(15 + col1Width, currentY, col2Width, rowHeight);
    
    // Fill header column with light gray
    doc.setFillColor(245, 245, 245);
    doc.rect(15, currentY, col1Width, rowHeight, 'F');
    
    // Add text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(row[0], 18, currentY + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(row[1], 78, currentY + 6.5);
  });
  
  y = tableStartY + (tableData.length * rowHeight) + 10;
  
  // Amount Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DONATION AMOUNT', 15, y);
  
  y += 5;
  // Amount box with orange border
  doc.setDrawColor(255, 140, 0);
  doc.setLineWidth(1);
  doc.rect(15, y, 180, 25);
  
  // Amount in numbers
  doc.setFontSize(20);
  doc.setTextColor(255, 140, 0);
  doc.text(`₹ ${data.amount.toLocaleString('en-IN')}/-`, 105, y + 10, { align: 'center' });
  
  // Amount in words
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'italic');
  doc.text(`(Rupees ${numberToWords(data.amount)} Only)`, 105, y + 18, { align: 'center' });
  
  y += 32;
  
  // Footer section
  doc.setFontSize(8);
  doc.text('This is a computer-generated receipt and does not require a physical signature.', 105, y, { align: 'center' });
  
  y += 15;
  
  // Signature section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('For Bihar Sanskritik Mandal', 150, y);
  
  y += 15;
  
  // Add digital signature placeholder
  try {
    // You can add actual signature image here
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(145, y, 190, y);
  } catch (error) {
    console.log('Signature not added');
  }
  
  y += 5;
  doc.setFontSize(9);
  doc.text('Authorized Signatory', 167, y, { align: 'center' });
  
  // Footer note
  doc.setFontSize(7);
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for your generous contribution to Bihar Sanskritik Mandal.', 105, 280, { align: 'center' });
  doc.text('For queries, contact: bsmvadodara@gmail.com | +91 9714037766', 105, 285, { align: 'center' });
  
  // Save and download
  doc.save(`BSM_Receipt_${data.receiptNo}_${data.donorName.replace(/\s+/g, '_')}.pdf`);
  
  console.log(`📄 Professional PDF receipt generated: BSM_Receipt_${data.receiptNo}_${data.donorName.replace(/\s+/g, '_')}.pdf`);
};

/**
 * Generate PDF receipt as blob for email attachment (Professional format)
 * @param data - Receipt data
 * @returns PDF blob, filename, and base64 data
 */
export const generateReceiptBlob = async (data: SimpleReceiptData): Promise<{ blob: Blob; filename: string; base64: string }> => {
  const doc = new jsPDF();
  
  // Add orange border around entire page
  doc.setDrawColor(255, 140, 0);
  doc.setLineWidth(1);
  doc.rect(5, 5, 200, 287);
  
  // Inner border
  doc.setLineWidth(0.5);
  doc.rect(8, 8, 194, 281);
  
  let y = 20;
  
  // Add Logo (left side)
  try {
    const logoImg = new Image();
    logoImg.src = '/bihar-cultural-logo.png';
    doc.addImage(logoImg, 'PNG', 15, 15, 25, 25);
  } catch (error) {
    console.log('Logo not found, continuing without logo');
  }
  
  // Main Header - Organization Name (Official Registered Name)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 140, 0);
  doc.text('BIHAR SANSKRITIK MANDAL', 105, y, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  y += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('(Operating as Bihar Purvanchal Samaj Gandhinagar)', 105, y, { align: 'center' });
  
  y += 8;
  // Address
  doc.setFontSize(9);
  doc.text('307/308 Pujer Complex, Subhanpura, Vadodara - 390023, Gujarat', 105, y, { align: 'center' });
  
  y += 5;
  doc.text('Phone: +91 9714037766  |  Email: bsmvadodara@gmail.com', 105, y, { align: 'center' });
  
  y += 5;
  doc.text('Website: https://biharpurvanchalsamaj.org', 105, y, { align: 'center' });
  
  y += 8;
  // Registration details box
  doc.setFillColor(255, 248, 240);
  doc.rect(15, y - 3, 180, 12, 'F');
  doc.setFontSize(8);
  doc.text('Regd. No.: A-2676  |  PAN: AACTB4197R  |  80G No.: AACTB4197RF20009  |  12A Registered', 105, y + 3, { align: 'center' });
  
  y += 15;
  // Title with underline
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 140, 0);
  doc.text('TAX EXEMPTION DONATION RECEIPT', 105, y, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(40, y + 2, 170, y + 2);
  doc.setTextColor(0, 0, 0);
  
  y += 12;
  // Receipt metadata
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt No: ${data.receiptNo}`, 15, y);
  doc.text(`Financial Year: 2025-2026`, 105, y, { align: 'center' });
  doc.text(`Date: ${data.date}`, 195, y, { align: 'right' });
  
  y += 10;
  
  // Donor Details Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DONOR DETAILS', 15, y);
  
  y += 5;
  // Table with borders
  const tableStartY = y;
  const rowHeight = 10;
  const col1Width = 60;
  const col2Width = 120;
  
  // Table rows
  const tableData = [
    ['Donor Name', data.donorName],
    ['Address', data.address],
    ['Phone Number', data.phone],
    ['Email Address', data.email],
    ['Purpose', data.campaign],
    ['Payment ID', data.transactionId || 'N/A']
  ];
  
  tableData.forEach((row, index) => {
    const currentY = tableStartY + (index * rowHeight);
    
    // Draw row borders
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(15, currentY, col1Width, rowHeight);
    doc.rect(15 + col1Width, currentY, col2Width, rowHeight);
    
    // Fill header column with light gray
    doc.setFillColor(245, 245, 245);
    doc.rect(15, currentY, col1Width, rowHeight, 'F');
    
    // Add text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(row[0], 18, currentY + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(row[1], 78, currentY + 6.5);
  });
  
  y = tableStartY + (tableData.length * rowHeight) + 10;
  
  // Amount Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DONATION AMOUNT', 15, y);
  
  y += 5;
  // Amount box with orange border
  doc.setDrawColor(255, 140, 0);
  doc.setLineWidth(1);
  doc.rect(15, y, 180, 25);
  
  // Amount in numbers
  doc.setFontSize(20);
  doc.setTextColor(255, 140, 0);
  doc.text(`₹ ${data.amount.toLocaleString('en-IN')}/-`, 105, y + 10, { align: 'center' });
  
  // Amount in words
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'italic');
  doc.text(`(Rupees ${numberToWords(data.amount)} Only)`, 105, y + 18, { align: 'center' });
  
  y += 32;
  
  // Footer section
  doc.setFontSize(8);
  doc.text('This is a computer-generated receipt and does not require a physical signature.', 105, y, { align: 'center' });
  
  y += 15;
  
  // Signature section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('For Bihar Sanskritik Mandal', 150, y);
  
  y += 15;
  
  // Add digital signature placeholder
  try {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(145, y, 190, y);
  } catch (error) {
    console.log('Signature not added');
  }
  
  y += 5;
  doc.setFontSize(9);
  doc.text('Authorized Signatory', 167, y, { align: 'center' });
  
  // Footer note
  doc.setFontSize(7);
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for your generous contribution to Bihar Sanskritik Mandal.', 105, 280, { align: 'center' });
  doc.text('For queries, contact: bsmvadodara@gmail.com | +91 9714037766', 105, 285, { align: 'center' });
  
  // Generate blob and base64
  const pdfBlob = doc.output('blob');
  const pdfBase64 = doc.output('datauristring');
  const filename = `BSM_Receipt_${data.receiptNo}_${data.donorName.replace(/\s+/g, '_')}.pdf`;
  
  console.log(`📄 Professional PDF receipt blob generated: ${filename}`);
  
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