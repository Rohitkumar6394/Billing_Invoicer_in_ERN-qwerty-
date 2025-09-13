# Billing Invoicer React-Express-Node Application - Copilot Instructions

## Project Overview
Create a professional web-based Billing Invoicer application using React frontend, Express.js backend, and Node.js with JSON file storage. The application serves small shop owners for invoice generation and inventory management.

## Architecture Requirements

### Technology Stack
- **Frontend**: React 18+ with modern hooks, React Router
- **Backend**: Express.js with RESTful API
- **Runtime**: Node.js (v16+)
- **Data Storage**: JSON files with fs module
- **Styling**: Modern CSS with professional design system
- **HTTP Client**: Axios for API calls
- **Authentication**: JWT tokens

### Project Structure
```
billing-invoicer/
├── client/                    # React Frontend
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.js
│   │   │   │   └── Register.js
│   │   │   ├── Dashboard/
│   │   │   │   └── Dashboard.js
│   │   │   ├── Products/
│   │   │   │   ├── ProductList.js
│   │   │   │   ├── ProductForm.js
│   │   │   │   └── ProductCard.js
│   │   │   ├── Billing/
│   │   │   │   ├── BillingForm.js
│   │   │   │   ├── InvoicePreview.js
│   │   │   │   └── InvoiceHistory.js
│   │   │   ├── Layout/
│   │   │   │   ├── Header.js
│   │   │   │   ├── Sidebar.js
│   │   │   │   └── Layout.js
│   │   │   └── UI/
│   │   │       ├── Button.js
│   │   │       ├── Input.js
│   │   │       ├── Modal.js
│   │   │       └── Table.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── AppContext.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useApi.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   ├── components.css
│   │   │   └── print.css
│   │   ├── utils/
│   │   │   ├── helpers.js
│   │   │   └── constants.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .gitignore
├── server/                    # Express Backend
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── invoiceController.js
│   │   └── shopController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── cors.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── invoices.js
│   │   └── shop.js
│   ├── data/
│   │   ├── users.json
│   │   ├── products.json
│   │   ├── invoices.json
│   │   └── shops.json
│   ├── utils/
│   │   ├── fileHandler.js
│   │   ├── pdfGenerator.js
│   │   └── validation.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── README.md
```

## Data Models

### User/Shop Owner
```javascript
{
  id: "user_001",
  username: "shopkeeper1",
  email: "shop@email.com",
  password: "hashed_password",
  shop: {
    name: "ABC Electronics",
    address: "123 Main Street, City",
    phone: "+1234567890",
    email: "abc@electronics.com",
    gst: "GST123456789",
    logo: "base64_image_string"
  },
  createdAt: "2025-01-15T10:30:00Z",
  updatedAt: "2025-01-15T10:30:00Z"
}
```

### Product
```javascript
{
  id: "prod_001",
  userId: "user_001",
  name: "Samsung Galaxy S24",
  category: "Electronics",
  price: 899.99,
  stock: 25,
  sku: "SAM-S24-128",
  description: "Latest Samsung smartphone",
  image: "product_image_url",
  createdAt: "2025-01-15T10:30:00Z",
  updatedAt: "2025-01-15T10:30:00Z"
}
```

### Invoice
```javascript
{
  id: "inv_001",
  invoiceNumber: "INV-2025-001",
  userId: "user_001",
  shopDetails: {
    name: "ABC Electronics",
    address: "123 Main Street",
    phone: "+1234567890",
    gst: "GST123456789"
  },
  customerDetails: {
    name: "John Doe",
    phone: "+0987654321",
    address: "456 Oak Street",
    email: "john@email.com"
  },
  items: [
    {
      productId: "prod_001",
      name: "Samsung Galaxy S24",
      quantity: 1,
      price: 899.99,
      discount: 0,
      total: 899.99
    }
  ],
  subtotal: 899.99,
  taxRate: 18,
  taxAmount: 161.998,
  discount: 0,
  grandTotal: 1061.988,
  paymentMethod: "cash",
  notes: "Thank you for your business",
  status: "paid",
  createdAt: "2025-01-15T14:30:00Z"
}
```

## API Endpoints

### Authentication Routes
```javascript
POST /api/auth/register    // Register new shop owner
POST /api/auth/login       // Login shop owner
GET  /api/auth/profile     // Get user profile
PUT  /api/auth/profile     // Update user profile
```

### Product Routes
```javascript
GET    /api/products          // Get all products for user
POST   /api/products          // Create new product
GET    /api/products/:id      // Get single product
PUT    /api/products/:id      // Update product
DELETE /api/products/:id      // Delete product
```

### Invoice Routes
```javascript
GET    /api/invoices          // Get all invoices for user
POST   /api/invoices          // Create new invoice
GET    /api/invoices/:id      // Get single invoice
PUT    /api/invoices/:id      // Update invoice
DELETE /api/invoices/:id      // Delete invoice
GET    /api/invoices/:id/pdf  // Download invoice as PDF
```

## Key Features Implementation Guide

### 1. Authentication System
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes middleware
- Session management

### 2. Product Management
- CRUD operations for products
- Image upload capability
- Stock management
- Category filtering
- Search functionality

### 3. Invoice Generation
- Dynamic invoice creation
- Real-time calculations
- Customer management
- Multiple payment methods
- Print/PDF generation

### 4. File Storage
- JSON file-based database
- Atomic write operations
- Data backup and recovery
- File locking mechanisms

## Development Instructions

### Backend Setup (server/)
```bash
npm init -y
npm install express cors dotenv bcryptjs jsonwebtoken helmet morgan
npm install --save-dev nodemon concurrently
```

### Frontend Setup (client/)
```bash
npx create-react-app client
cd client
npm install axios react-router-dom react-toastify jspdf html2pdf.js
```

### Environment Variables (.env)
```
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## Professional Styling Guide

### Color Palette
```css
:root {
  --primary: #2563eb;      /* Blue */
  --primary-dark: #1d4ed8;
  --secondary: #64748b;    /* Slate */
  --success: #059669;      /* Green */
  --warning: #d97706;      /* Orange */
  --error: #dc2626;        /* Red */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border: #e2e8f0;
}
```

### Typography
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
}

h1 { font-size: 2.25rem; font-weight: 700; }
h2 { font-size: 1.875rem; font-weight: 600; }
h3 { font-size: 1.5rem; font-weight: 600; }
h4 { font-size: 1.25rem; font-weight: 500; }
```

### Component Styling Guidelines
- Use CSS Grid and Flexbox for layouts
- Implement responsive design (mobile-first)
- Add hover and focus states
- Use smooth transitions (0.2s ease)
- Consistent spacing (8px base unit)
- Card-based design with subtle shadows
- Form validation with clear error states

### Print Styles
```css
@media print {
  .no-print { display: none !important; }
  .invoice-container { 
    box-shadow: none; 
    border: none; 
    max-width: 100%; 
  }
  body { font-size: 12px; }
}
```

## Security Considerations
- Input validation and sanitization
- SQL injection prevention (even with JSON files)
- XSS protection
- CORS configuration
- Rate limiting
- Secure file uploads
- JWT token expiration

## Performance Optimization
- Lazy loading for components
- Pagination for large datasets
- Debounced search functionality
- Memoization for expensive calculations
- Image optimization
- Bundle size optimization

## Testing Strategy
- Unit tests for utilities and services
- Integration tests for API endpoints
- Component testing for React components
- E2E testing for critical user flows

This structure provides a solid foundation for building a professional billing invoicer application that can scale and maintain code quality.