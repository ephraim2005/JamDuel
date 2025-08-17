#!/bin/bash

echo "🎵 Setting up JamDuel - Music Discovery App"
echo "============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install

# Check if PostgreSQL is running
echo "🗄️ Checking PostgreSQL connection..."
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not found. Please install PostgreSQL first."
    echo "   You can still continue with the setup, but you'll need to set up the database manually."
else
    echo "✅ PostgreSQL client found"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jamduel
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
EOF
    echo "✅ .env file created. Please update it with your actual credentials."
else
    echo "✅ .env file already exists"
fi

cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update server/.env with your database and Spotify credentials"
echo "2. Set up PostgreSQL database named 'jamduel'"
echo "3. Run: npm run setup-db (to create database tables)"
echo "4. Run: npm run seed (to populate with sample battles)"
echo "5. Run: npm run dev (to start both servers)"
echo ""
echo "🌐 The app will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "🎵 Happy battling! ⚔️" 