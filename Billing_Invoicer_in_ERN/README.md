# Billing Invoicer Application

A professional web-based billing and invoicing application built with React, Express.js, and Node.js. Designed for small shop owners to manage their inventory and generate invoices efficiently.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)

### Easy Setup (Recommended)

1. **Clone or download the project**
2. **Navigate to the project directory**
   ```bash
   cd Billing_Invoicer_in_ERN
   ```
3. **Run the startup script**
   ```bash
   ./start.sh
   ```

The script will automatically:
- Install all dependencies
- Start both backend and frontend servers
- Open the application at `http://localhost:3000`

### Manual Setup

If you prefer to set up manually:

1. **Install root dependencies**
   ```bash
   npm install
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 📱 Getting Started

1. **Register a new account** at http://localhost:3000/register
   - Create your user account
   - Set up your shop information

2. **Explore the Dashboard**
   - View your business statistics
   - Access quick actions

3. **Manage Products**
   - Add products to your inventory
   - Organize by categories
   - Track stock levels

4. **Create Invoices**
   - Generate professional invoices
   - Add customer details
   - Calculate taxes and discounts

## ✨ Features

### 🏪 Shop Management
- Complete shop profile setup
- Shop details and branding
- GST and business information

### 📦 Product Management
- Add, edit, and delete products
- Category-based organization
- Stock tracking
- SKU management
- Product search and filtering

### 🧾 Invoice Generation
- Dynamic invoice creation
- Real-time calculations
- Customer management
- Multiple payment methods
- Professional invoice templates
- Print functionality

### 📊 Dashboard & Analytics
- Invoice statistics
- Sales overview
- Recent activities
- Quick actions

### 🔐 Authentication & Security
- JWT-based authentication
- Secure user registration
- Protected routes
- Session management

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Authentication**: JWT tokens
- **Password Hashing**: bcrypt
- **Data Storage**: JSON files
- **Validation**: Joi

### Frontend
- **Framework**: React 18+ with TypeScript
- **Routing**: React Router
- **HTTP Client**: Axios
- **Styling**: Modern CSS with design system
- **State Management**: Context API

## 📁 Project Structure

```
billing-invoicer/
├── client/                    # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React context
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API services
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utility functions
│   └── package.json
├── server/                    # Express Backend
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Express middleware
│   ├── routes/               # API routes
│   ├── data/                 # JSON data files
│   ├── utils/                # Utility functions
│   └── package.json
├── start.sh                  # Easy startup script
└── README.md
```

## 🔧 Available Scripts

### Root Directory
- `npm run dev` - Start both client and server in development mode
- `npm run server:dev` - Start only the backend server
- `npm run client:dev` - Start only the frontend
- `npm run build` - Build the client for production
- `npm start` - Start the production server

### Client Directory
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Server Directory
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/categories` - Get product categories

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/:id` - Get single invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `GET /api/invoices/stats` - Get invoice statistics

### Shop
- `GET /api/shop` - Get shop details
- `PUT /api/shop` - Update shop details

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Protected API routes
- CORS configuration
- Helmet.js security headers

## 💾 Data Storage

The application uses JSON files for data storage, making it:
- **Simple**: No database setup required
- **Portable**: Easy to backup and migrate
- **Transparent**: Data is human-readable
- **Development-friendly**: Easy to inspect and modify

Data files are stored in `server/data/`:
- `users.json` - User accounts and shop information
- `products.json` - Product inventory
- `invoices.json` - Invoice records

## 🎨 Design System

The application features a professional design system with:
- Consistent color palette
- Typography scale
- Component library
- Responsive design
- Print-optimized styles
- Professional Inter font

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Production Deployment

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Configure environment variables**
   - Update `server/.env` with production values
   - Set `NODE_ENV=production`

3. **Start the production server**
   ```bash
   cd server
   npm start
   ```

4. **Serve the built client files**
   - Configure your web server to serve `client/build/`
   - Set up API proxy to the backend server

## 🛠 Development

### Adding New Features

1. **Backend**: Add routes in `server/routes/`, controllers in `server/controllers/`
2. **Frontend**: Add components in `client/src/components/`, pages in `client/src/pages/`
3. **Types**: Update TypeScript types in `client/src/types/`

### Code Style

- Use TypeScript for type safety
- Follow React functional component patterns
- Use custom hooks for reusable logic
- Maintain consistent file structure

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   - Change ports in `server/.env` and `client/.env`

2. **Dependencies not installed**
   - Run `./start.sh` or install manually

3. **API connection errors**
   - Check if backend server is running
   - Verify API URL in `client/.env`

### Getting Help

1. Check the browser console for errors
2. Check the server logs in the terminal
3. Verify all dependencies are installed
4. Ensure both servers are running

## 📄 License

This project is licensed under the ISC License.

## 🙏 Support

For support and questions, please check the troubleshooting section or create an issue in the repository.

---

**Built with ❤️ for small business owners**

### 🎯 Perfect for:
- Small retail shops
- Service providers
- Freelancers
- Small businesses
- Anyone who needs professional invoicing
