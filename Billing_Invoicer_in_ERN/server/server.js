const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const invoiceRoutes = require('./routes/invoices');
const shopRoutes = require('./routes/shop');

const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure for tunnel environment
app.set('trust proxy', true);

// Enhanced CORS configuration for tunnels
// TEMP broaden origin for debug (will tighten later)
const corsOptions = {
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Handle tunnel-specific headers
// No tunnel-specific header handling

// Middleware
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"]
      },
    },
    crossOriginEmbedderPolicy: false
  }));
} else {
  // Dev: relaxed helmet (still basic protections)
  app.use(helmet({ crossOriginEmbedderPolicy: false }));
}
app.use(morgan('combined'));
app.use(cors(corsOptions));

// Diagnostic request logger (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin}`);
    next();
  });
}
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Billing Invoicer API is running',
    timestamp: new Date().toISOString()
  });
});
// Mirror health under /api for frontend baseURL pattern
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Billing Invoicer API (api path) is running',
    timestamp: new Date().toISOString()
  });
});

// Simpler ping without extra logic
app.get('/ping', (req, res) => res.send('pong'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/shop', shopRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `The endpoint ${req.originalUrl} does not exist`
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  
  // Tunnel logging removed
});
