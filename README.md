# JamDuel 🎵⚔️

A music battle app where users can compete with songs and vote on their favorites!

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MySQL database
- Spotify API credentials

### 📋 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/allenvarghese05/JamDuel.git
   cd JamDuel
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Database Setup**
   ```bash
   cd server
   
   # Copy environment file
   cp env.example .env
   
   # Edit .env with your database credentials
   # DATABASE_HOST=localhost
   # DATABASE_USER=your_username
   # DATABASE_PASSWORD=your_password
   # DATABASE_NAME=jamduel
   
   # Run database setup script
   node scripts/setup-database.js
   ```

4. **Spotify API Setup**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Get your `CLIENT_ID` and `CLIENT_SECRET`
   - Add them to your `.env` file

5. **Environment Variables**
   Create a `.env` file in the `server` directory with:
   ```env
   DATABASE_HOST=localhost
   DATABASE_USER=your_username
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=jamduel
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   JWT_SECRET=your_jwt_secret_key
   PORT=3001
   ```

### 🎯 Running the App

1. **Start the server**
   ```bash
   cd server
   npm start
   ```
   Server will run on http://localhost:3001

2. **Start the client** (in a new terminal)
   ```bash
   cd client
   npm start
   ```
   App will open on http://localhost:3000

### 🧪 User Testing Guide

#### For Testers:
1. **Register/Login**: Create an account or use existing credentials
2. **Browse Battles**: View ongoing music battles
3. **Vote**: Listen to songs and vote for your favorite
4. **Create Battles**: Start new battles with your own songs
5. **Profile**: Check your battle history and stats

#### Key Features to Test:
- ✅ User registration and login
- ✅ Creating new music battles
- ✅ Voting on songs
- ✅ Battle feed and navigation
- ✅ User profiles and statistics
- ✅ Mobile responsiveness

### 🛠️ Development

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Authentication**: JWT
- **Music**: Spotify API integration

### 📱 App Structure

- **Login/Register**: User authentication
- **Battle Feed**: View all ongoing battles
- **Battle Page**: Individual battle interface
- **Song Picker**: Select songs for battles
- **Profile**: User statistics and history
- **Friends**: Social features

### 🐛 Troubleshooting

- **Port conflicts**: Change ports in `.env` file
- **Database connection**: Check MySQL is running and credentials are correct
- **Spotify API**: Verify API credentials and quotas
- **Build errors**: Clear `node_modules` and reinstall dependencies

### 📞 Support

If you encounter issues during testing, please:
1. Check the console for error messages
2. Verify all setup steps were completed
3. Contact the development team with specific error details

---

**Happy Testing! 🎵🎉**
