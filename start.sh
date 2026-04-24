#!/bin/bash
set -e

echo "=========================================="
echo "  AI Logo & Brand Kit Generator"
echo "=========================================="

# Kill processes on ports 3001 and 3000
echo "🧹 Cleaning up ports 3000 and 3001..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 1

# Check if PostgreSQL is running
if ! pg_isready -q 2>/dev/null; then
  echo "⚠️  PostgreSQL is not running. Starting it..."
  brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || {
    echo "❌ Could not start PostgreSQL. Please start it manually."
    exit 1
  }
  sleep 2
fi

# Create database if it doesn't exist
echo "🗄️  Setting up database..."
createdb brandkit 2>/dev/null || true

# Install dependencies
echo "📦 Installing server dependencies..."
cd server && npm install --silent
cd ..

echo "📦 Installing client dependencies..."
cd client && npm install --silent
cd ..

# Install root dependencies
npm install --silent

# Seed the database
echo "🌱 Seeding database..."
cd server && node seed.js
cd ..

# Start both server and client with hot reload
echo ""
echo "=========================================="
echo "  🚀 Starting Application"
echo "  Server: http://localhost:3001"
echo "  Client: http://localhost:3000"
echo "  Login:  demo@brandkit.com / password123"
echo "=========================================="
echo ""

npx concurrently \
  --names "SERVER,CLIENT" \
  --prefix-colors "cyan,magenta" \
  "cd server && npx nodemon --watch . --ext js,json index.js" \
  "cd client && BROWSER=none PORT=3000 npm start"
