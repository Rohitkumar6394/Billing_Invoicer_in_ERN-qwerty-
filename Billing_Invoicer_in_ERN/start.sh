#!/bin/bash

# Billing Invoicer Application Startup Script

echo "🚀 Starting Billing Invoicer Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the root directory of the project"
    exit 1
fi

echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies (if not already done)
echo "📦 Installing client dependencies..."
cd client
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

echo "✅ All dependencies installed"

echo "🌐 Starting the application..."
echo ""
echo "The application will start with:"
echo "  - Backend server on http://localhost:5000"
echo "  - Frontend application on http://localhost:3000"
echo ""
echo "You can access the application at http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

# Start both client and server
npm run dev
