const Joi = require('joi');

// User registration validation
const validateUserRegistration = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    shop: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      address: Joi.string().min(5).max(200).required(),
      phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).required(),
      email: Joi.string().email().optional(),
      gst: Joi.string().optional(),
      logo: Joi.string().optional()
    }).required()
  });
  
  return schema.validate(data);
};

// User login validation
const validateUserLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  
  return schema.validate(data);
};

// Product validation
const validateProduct = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    category: Joi.string().min(1).max(50).required(),
    price: Joi.number().positive().required(),
    stock: Joi.number().integer().min(0).required(),
    sku: Joi.string().max(50).optional(),
    description: Joi.string().max(500).optional(),
    image: Joi.string().optional()
  });
  
  return schema.validate(data);
};

// Invoice validation
const validateInvoice = (data) => {
  const schema = Joi.object({
    customerDetails: Joi.object({
      name: Joi.string().min(1).max(100).required(),
      phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).optional(),
      address: Joi.string().max(200).optional(),
      email: Joi.string().email().optional()
    }).required(),
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        name: Joi.string().required(),
        quantity: Joi.number().positive().required(),
        price: Joi.number().positive().required(),
        discount: Joi.number().min(0).max(100).default(0),
        total: Joi.number().positive().required()
      })
    ).min(1).required(),
    subtotal: Joi.number().positive().required(),
    taxRate: Joi.number().min(0).max(100).default(0),
    taxAmount: Joi.number().min(0).required(),
    discount: Joi.number().min(0).default(0),
    grandTotal: Joi.number().positive().required(),
    paymentMethod: Joi.string().valid('cash', 'card', 'upi', 'bank_transfer', 'check').required(),
    notes: Joi.string().max(500).optional(),
    status: Joi.string().valid('draft', 'sent', 'paid', 'overdue').default('draft')
  });
  
  return schema.validate(data);
};

// Shop update validation
const validateShopUpdate = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    address: Joi.string().min(5).max(200).optional(),
    phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).optional(),
    email: Joi.string().email().optional(),
    gst: Joi.string().optional(),
    logo: Joi.string().optional()
  });
  
  return schema.validate(data);
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateProduct,
  validateInvoice,
  validateShopUpdate
};
