# JamDuel 🎵⚔️

A music battle app where users can compete with songs and vote on their favorites!

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Spotify API credentials (required for full experience)
- OpenAI API key (required for personalized recommendations)

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

3. **Quick Start (No Database Setup Required)**

   ```bash
   cd server

   # Copy environment file
   cp env.example .env

   # For basic testing, you can use the demo mode
   # Just add a simple JWT_SECRET to your .env file
   # JWT_SECRET=your_secret_key_here
   ```

4. **Spotify API Setup (Required for Full Experience)**

   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Click "Create App" and fill in basic info (takes 2 minutes)
   - Get your `CLIENT_ID` and `CLIENT_SECRET`
   - Add them to your `.env` file

5. **OpenAI API Setup (Required for Recommendations)**

   - Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Sign up/login and create a new API key
   - Add it to your `.env` file as `OPENAI_API_KEY`
   - **Result**: You get personalized music recommendations powered by GPT-4!

6. **Environment Variables**
   Create a `.env` file in the `server` directory with:

   ```env
   # Required for basic functionality
   JWT_SECRET=your_jwt_secret_key_here
   PORT=3001

   # Required for song search and full functionality
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

   # Required for personalized recommendations
   OPENAI_API_KEY=your_openai_api_key_here

   # Note: Database credentials are not needed for basic testing
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

#### What Works With/Without Spotify API:

**With Both APIs (Full Experience):**

- ✅ Search for any song by title/artist
- ✅ Create custom battles with real music
- ✅ High-quality album covers
- ✅ 30-second song previews
- ✅ Real song metadata
- ✅ **Personalized music recommendations** powered by GPT-4
- ✅ **Smart song suggestions** based on your music taste

**Without Spotify API (Demo Mode):**

- ✅ View pre-loaded demo battles
- ✅ Vote on existing battles
- ✅ User authentication
- ✅ Basic app navigation
- ❌ Cannot search for new songs
- ❌ Cannot create custom battles

**💡 Pro Tip**: Getting both API keys takes 5 minutes and gives you the FULL app experience with AI-powered recommendations!

#### For Testers:

1. **Register/Login**: Create an account or use demo credentials
2. **Browse Battles**: View ongoing music battles (demo data)
3. **Vote**: Listen to songs and vote for your favorite
4. **Create Battles**: Start new battles (requires Spotify API for song search)
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
- **Database**: MySQL (for production) / Demo mode (for testing)
- **Authentication**: JWT
- **Music**: Spotify API integration (with demo fallback)

### 📱 App Structure

- **Login/Register**: User authentication
- **Battle Feed**: View all ongoing battles
- **Battle Page**: Individual battle interface
- **Song Picker**: Select songs for battles
- **Profile**: User statistics and history
- **Friends**: Social features

### 🐛 Troubleshooting

- **Port conflicts**: Change ports in `.env` file
- **Demo mode issues**: Make sure JWT_SECRET is set in `.env`
- **Spotify API**: Verify API credentials and quotas (required for song search)
- **OpenAI API**: Verify API key and check usage limits (required for recommendations)
- **Build errors**: Clear `node_modules` and reinstall dependencies
- **Database errors**: The app should work in demo mode without a database

### 🎵 Quick API Setup

**Spotify API (2 minutes):**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create App"
3. Fill in:
   - **App name**: `JamDuel Test` (or any name)
   - **App description**: `Testing JamDuel music battle app`
   - **Website**: `http://localhost:3000`
   - **Redirect URI**: `http://localhost:3000/callback`
4. Click "Save"
5. Copy your `Client ID` and `Client Secret`

**OpenAI API (3 minutes):**
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign up/login to OpenAI
3. Click "Create new secret key"
4. Copy your API key
5. Add both to your `.env` file

**That's it!** You now have full access to all features including AI recommendations.

### 📞 Support

If you encounter issues during testing, please:

1. Check the console for error messages
2. Verify all setup steps were completed
3. Contact the development team with specific error details

---

**Happy Testing! 🎵🎉**
