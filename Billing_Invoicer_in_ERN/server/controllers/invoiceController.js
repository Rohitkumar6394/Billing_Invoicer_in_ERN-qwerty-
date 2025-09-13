const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const { 
  findItemsByUserId,
  addItemToFile,
  updateItemInFile,
  deleteItemFromFile,
  findItemById,
  readDataFromFile
} = require('../utils/fileHandler');
const { validateInvoice } = require('../utils/validation');
const { generatePDF, generateInvoiceHTML } = require('../utils/pdfGenerator');

// Generate invoice number
const generateInvoiceNumber = async (userId) => {
  const invoices = await findItemsByUserId('invoices.json', userId);
  const year = new Date().getFullYear();
  const count = invoices.filter(inv => 
    inv.invoiceNumber.startsWith(`INV-${year}`)
  ).length + 1;
  
  return `INV-${year}-${count.toString().padStart(3, '0')}`;
};

// Get all invoices for user
const getInvoices = async (req, res) => {
  try {
    const { 
      search, 
      status, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    let invoices = await findItemsByUserId('invoices.json', req.userId);
    
    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      invoices = invoices.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
        invoice.customerDetails.name.toLowerCase().includes(searchLower) ||
        invoice.customerDetails.email?.toLowerCase().includes(searchLower)
      );
    }
    
    if (status) {
      invoices = invoices.filter(invoice => invoice.status === status);
    }
    
    if (startDate) {
      invoices = invoices.filter(invoice => 
        new Date(invoice.createdAt) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      invoices = invoices.filter(invoice => 
        new Date(invoice.createdAt) <= new Date(endDate)
      );
    }
    
    // Sort by creation date (newest first)
    invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedInvoices = invoices.slice(startIndex, endIndex);
    
    res.json({
      invoices: paginatedInvoices,
      pagination: {
        total: invoices.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(invoices.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch invoices'
    });
  }
};

// Get single invoice
const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await findItemById('invoices.json', id);

    if (!invoice || invoice.userId !== req.userId) {
      return res.status(404).json({ 
        error: 'Invoice not found',
        message: 'Invoice not found or access denied'
      });
    }

    res.json({ invoice });

  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch invoice'
    });
  }
};

// Create new invoice
const createInvoice = async (req, res) => {
  try {
    const { error } = validateInvoice(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: error.details[0].message 
      });
    }

    // Get user's shop details
    const users = await readDataFromFile('users.json');
    const user = users.find(u => u.id === req.userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Validate product availability and stock
    const products = await readDataFromFile('products.json');
    const stockValidation = [];
    
    for (const item of req.body.items) {
      const product = products.find(p => p.id === item.productId && p.userId === req.userId);
      
      if (!product) {
        return res.status(400).json({
          error: 'Product not found',
          message: `Product with ID ${item.productId} not found`
        });
      }
      
      if (product.stock < item.quantity) {
        stockValidation.push({
          productId: item.productId,
          productName: item.name,
          requestedQuantity: item.quantity,
          availableStock: product.stock
        });
      }
    }
    
    // If any products have insufficient stock, return error
    if (stockValidation.length > 0) {
      return res.status(400).json({
        error: 'Insufficient stock',
        message: 'Some products have insufficient stock',
        insufficientStock: stockValidation
      });
    }

    // Update product quantities
    for (const item of req.body.items) {
      const productIndex = products.findIndex(p => p.id === item.productId);
      if (productIndex !== -1) {
        products[productIndex].stock -= item.quantity;
        products[productIndex].updatedAt = new Date().toISOString();
      }
    }
    
    // Save updated products
    await fs.writeFile(
      path.join(__dirname, '../data/products.json'),
      JSON.stringify(products, null, 2)
    );

    const invoiceNumber = await generateInvoiceNumber(req.userId);

    const newInvoice = {
      id: uuidv4(),
      invoiceNumber,
      userId: req.userId,
      shopDetails: user.shop,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await addItemToFile('invoices.json', newInvoice);

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice: newInvoice
    });

  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create invoice'
    });
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if invoice exists and belongs to user
    const invoice = await findItemById('invoices.json', id);
    if (!invoice || invoice.userId !== req.userId) {
      return res.status(404).json({ 
        error: 'Invoice not found',
        message: 'Invoice not found or access denied'
      });
    }

    const { error } = validateInvoice(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: error.details[0].message 
      });
    }

    // Handle stock changes if items are being updated
    if (req.body.items) {
      const products = await readDataFromFile('products.json');
      
      // Restore stock from original invoice
      for (const item of invoice.items) {
        const productIndex = products.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) {
          products[productIndex].stock += item.quantity;
        }
      }
      
      // Validate and reduce stock for new items
      const stockValidation = [];
      
      for (const item of req.body.items) {
        const product = products.find(p => p.id === item.productId && p.userId === req.userId);
        
        if (!product) {
          return res.status(400).json({
            error: 'Product not found',
            message: `Product with ID ${item.productId} not found`
          });
        }
        
        if (product.stock < item.quantity) {
          stockValidation.push({
            productId: item.productId,
            productName: item.name,
            requestedQuantity: item.quantity,
            availableStock: product.stock
          });
        }
      }
      
      // If any products have insufficient stock, return error
      if (stockValidation.length > 0) {
        // Restore original quantities before returning error
        for (const item of invoice.items) {
          const productIndex = products.findIndex(p => p.id === item.productId);
          if (productIndex !== -1) {
            products[productIndex].stock -= item.quantity;
          }
        }
        
        return res.status(400).json({
          error: 'Insufficient stock',
          message: 'Some products have insufficient stock',
          insufficientStock: stockValidation
        });
      }
      
      // Update product quantities for new items
      for (const item of req.body.items) {
        const productIndex = products.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) {
          products[productIndex].stock -= item.quantity;
          products[productIndex].updatedAt = new Date().toISOString();
        }
      }
      
      // Save updated products
      await fs.writeFile(
        path.join(__dirname, '../data/products.json'),
        JSON.stringify(products, null, 2)
      );
    }

    const updatedData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    const updatedInvoice = await updateItemInFile('invoices.json', id, updatedData);

    res.json({
      message: 'Invoice updated successfully',
      invoice: updatedInvoice
    });

  } catch (error) {
    console.error('Update invoice error:', error);
    if (error.message === 'Item not found') {
      return res.status(404).json({ 
        error: 'Invoice not found',
        message: 'Invoice not found'
      });
    }
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update invoice'
    });
  }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if invoice exists and belongs to user
    const invoice = await findItemById('invoices.json', id);
    if (!invoice || invoice.userId !== req.userId) {
      return res.status(404).json({ 
        error: 'Invoice not found',
        message: 'Invoice not found or access denied'
      });
    }

    // Restore product quantities before deleting invoice
    const products = await readDataFromFile('products.json');
    
    for (const item of invoice.items) {
      const productIndex = products.findIndex(p => p.id === item.productId);
      if (productIndex !== -1) {
        products[productIndex].stock += item.quantity;
        products[productIndex].updatedAt = new Date().toISOString();
      }
    }
    
    // Save updated products
    await fs.writeFile(
      path.join(__dirname, '../data/products.json'),
      JSON.stringify(products, null, 2)
    );

    await deleteItemFromFile('invoices.json', id);

    res.json({
      message: 'Invoice deleted successfully and stock restored'
    });

  } catch (error) {
    console.error('Delete invoice error:', error);
    if (error.message === 'Item not found') {
      return res.status(404).json({ 
        error: 'Invoice not found',
        message: 'Invoice not found'
      });
    }
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete invoice'
    });
  }
};

// Get invoice statistics
const getInvoiceStats = async (req, res) => {
  try {
    const invoices = await findItemsByUserId('invoices.json', req.userId);
    
    const stats = {
      total: invoices.length,
      paid: invoices.filter(inv => inv.status === 'paid').length,
      pending: invoices.filter(inv => inv.status === 'sent').length,
      draft: invoices.filter(inv => inv.status === 'draft').length,
      overdue: invoices.filter(inv => inv.status === 'overdue').length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.grandTotal, 0),
      paidAmount: invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.grandTotal, 0)
    };
    
    res.json({ stats });

  } catch (error) {
    console.error('Get invoice stats error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch invoice statistics'
    });
  }
};

// Download invoice as PDF
const downloadInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoice = await findItemById('invoices.json', id);
    if (!invoice) {
      return res.status(404).json({ 
        error: 'Invoice not found' 
      });
    }
    
    // Check if user owns this invoice
    if (invoice.userId !== req.userId) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }
    
    // Generate HTML and convert to PDF
    const html = generateInvoiceHTML(invoice);
    const pdfBuffer = await generatePDF(html);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Download invoice PDF error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to generate PDF'
    });
  }
};

module.exports = {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoiceStats,
  downloadInvoicePDF
};
