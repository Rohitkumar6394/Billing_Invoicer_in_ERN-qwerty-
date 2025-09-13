const puppeteer = require('puppeteer');

/**
 * Generate PDF from HTML content
 * @param {string} html - HTML content to convert to PDF
 * @param {object} options - PDF generation options
 * @returns {Buffer} PDF buffer
 */
const generatePDF = async (html, options = {}) => {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      ...options
    });
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * Generate invoice HTML template
 * @param {object} invoice - Invoice data
 * @returns {string} HTML string
 */
const generateInvoiceHTML = (invoice) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      draft: '#6B7280',
      sent: '#F59E0B',
      paid: '#10B981',
      overdue: '#EF4444'
    };
    return `<span style="background: ${statusColors[status]}; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${status}</span>`;
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
        }
        
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .shop-info {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }
        
        .shop-logo {
          width: 80px;
          height: 80px;
          object-fit: contain;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .shop-details h1 {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }
        
        .shop-details p {
          color: #6b7280;
          margin-bottom: 4px;
          font-size: 14px;
        }
        
        .invoice-meta {
          text-align: right;
          min-width: 200px;
        }
        
        .invoice-title {
          font-size: 36px;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 8px;
        }
        
        .invoice-number {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 12px;
        }
        
        .invoice-date {
          color: #6b7280;
          font-size: 14px;
        }
        
        .bill-to-section {
          margin-bottom: 30px;
        }
        
        .bill-to-section h3 {
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .customer-details h4 {
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .customer-details p {
          color: #6b7280;
          margin-bottom: 4px;
          font-size: 14px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          font-size: 14px;
        }
        
        .items-table th {
          background: #f9fafb;
          color: #1f2937;
          font-weight: 600;
          padding: 12px;
          text-align: left;
          border-bottom: 2px solid #e5e7eb;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
        }
        
        .items-table th:last-child,
        .items-table td:last-child {
          text-align: right;
        }
        
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          color: #6b7280;
        }
        
        .item-name {
          color: #1f2937 !important;
          font-weight: 500;
        }
        
        .item-total {
          color: #1f2937 !important;
          font-weight: 600;
        }
        
        .summary-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 30px;
        }
        
        .summary-details {
          min-width: 300px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          background: #f9fafb;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          font-size: 14px;
          color: #6b7280;
        }
        
        .summary-row:not(:last-child) {
          border-bottom: 1px solid #e5e7eb;
        }
        
        .total-row {
          margin-top: 8px;
          padding-top: 16px;
          border-top: 2px solid #2563eb !important;
          font-size: 16px;
          font-weight: 700;
          color: #1f2937 !important;
        }
        
        .total-row span:last-child {
          color: #2563eb;
          font-size: 18px;
        }
        
        .payment-section {
          margin-bottom: 30px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .payment-info h4 {
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        
        .payment-info p {
          color: #6b7280;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .notes-section {
          margin-bottom: 30px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .notes-section h4 {
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        
        .notes-section p {
          color: #6b7280;
          line-height: 1.6;
          font-size: 14px;
        }
        
        .invoice-footer {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
        }
        
        .thank-you {
          font-size: 18px;
          font-weight: 600;
          color: #2563eb;
          margin-bottom: 8px;
        }
        
        .footer-note {
          font-size: 12px;
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Invoice Header -->
        <div class="invoice-header">
          <div class="shop-info">
            ${invoice.shopDetails.logo ? `<img src="${invoice.shopDetails.logo}" alt="${invoice.shopDetails.name}" class="shop-logo">` : ''}
            <div class="shop-details">
              <h1>${invoice.shopDetails.name}</h1>
              <p>${invoice.shopDetails.address}</p>
              <p>📞 ${invoice.shopDetails.phone}</p>
              ${invoice.shopDetails.email ? `<p>✉️ ${invoice.shopDetails.email}</p>` : ''}
              ${invoice.shopDetails.gst ? `<p style="font-weight: 600; margin-top: 8px;">GST: ${invoice.shopDetails.gst}</p>` : ''}
            </div>
          </div>
          <div class="invoice-meta">
            <h2 class="invoice-title">INVOICE</h2>
            <div class="invoice-number">${invoice.invoiceNumber}</div>
            ${getStatusBadge(invoice.status)}
            <div class="invoice-date">
              <strong>Date:</strong> ${formatDate(invoice.createdAt)}
            </div>
          </div>
        </div>

        <!-- Bill To Section -->
        <div class="bill-to-section">
          <h3>Bill To:</h3>
          <div class="customer-details">
            <h4>${invoice.customerDetails.name}</h4>
            ${invoice.customerDetails.address ? `<p>${invoice.customerDetails.address}</p>` : ''}
            ${invoice.customerDetails.phone ? `<p>📞 ${invoice.customerDetails.phone}</p>` : ''}
            ${invoice.customerDetails.email ? `<p>✉️ ${invoice.customerDetails.email}</p>` : ''}
          </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Discount</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td class="item-name">${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.price)}</td>
                <td>${item.discount > 0 ? formatCurrency(item.discount) : '-'}</td>
                <td class="item-total">${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Summary Section -->
        <div class="summary-section">
          <div class="summary-details">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(invoice.subtotal)}</span>
            </div>
            ${invoice.discount > 0 ? `
              <div class="summary-row">
                <span>Discount:</span>
                <span>-${formatCurrency(invoice.discount)}</span>
              </div>
            ` : ''}
            <div class="summary-row">
              <span>Tax (${invoice.taxRate}%):</span>
              <span>${formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div class="summary-row total-row">
              <span>Total Amount:</span>
              <span>${formatCurrency(invoice.grandTotal)}</span>
            </div>
          </div>
        </div>

        <!-- Payment Info -->
        <div class="payment-section">
          <div class="payment-info">
            <h4>Payment Information</h4>
            <p><strong>Method:</strong> ${invoice.paymentMethod.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Status:</strong> ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</p>
          </div>
        </div>

        <!-- Notes -->
        ${invoice.notes ? `
          <div class="notes-section">
            <h4>Notes:</h4>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}

        <!-- Footer -->
        <div class="invoice-footer">
          <p class="thank-you">Thank you for your business!</p>
          <p class="footer-note">This is a computer-generated invoice and does not require a signature.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  generatePDF,
  generateInvoiceHTML
};
