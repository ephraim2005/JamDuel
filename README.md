# 🎵 JamDuel - Music Battle App

A React-based music battle application where users can vote on song battles, discover new music, and get personalized recommendations powered by AI.

## ✨ Features

- 🥊 **Music Battles**: Vote on head-to-head song matchups
- 🎯 **Daily Voting System**: 10 votes per day with streak tracking
- 👥 **Social Features**: Add friends, view profiles, see voting history
- 🎵 **Music Discovery**: Find new songs through battles and recommendations
- 🤖 **AI-Powered Recommendations**: Personalized music suggestions using GPT-4
- 🎬 **YouTube Integration**: Watch music videos and get thumbnails
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- **Three API Keys Required:**
  - Spotify API credentials (for song search and metadata)
  - YouTube API key (for video thumbnails and playback)
  - OpenAI API key (for AI-powered music recommendations)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd INFO310_Website
   ```

2. **Install dependencies**

   ```bash
   # Install server dependencies
   cd server && npm install

   # Install client dependencies
   cd ../client && npm install
   ```

3. **Set up the database**

   ```bash
   cd ../server
   npm run setup-db
   ```

4. **Configure environment variables**

   ```bash
   # Copy the example environment file
   cp env.example .env

   # Edit .env with your API keys
   nano .env
   ```

5. **Start the servers**

   ```bash
   # Terminal 1: Start backend server
   cd server && npm run dev

   # Terminal 2: Start frontend
   cd client && npm start
   ```

## 🔑 API Configuration

### 1. **Spotify API** (Required for Song Search)

- **Purpose**: Search for songs, get album artwork, and song metadata
- **Used for**: Song picker, album covers, song information
- **Setup**:
  - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
  - Create a new app
  - Get `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`

### 2. **YouTube API** (Required for Video Features)

- **Purpose**: Get video thumbnails, video IDs, and enable video playback
- **Used for**: Video thumbnails in battle feeds, YouTube video player
- **Setup**:
  - Go to [Google Cloud Console](https://console.cloud.google.com/)
  - Enable YouTube Data API v3
  - Create credentials and get `YOUTUBE_API_KEY`

### 3. **OpenAI API** (Required for AI Recommendations)

- **Purpose**: Generate personalized music recommendations using GPT-4
- **Used for**: AI-powered song suggestions based on user preferences
- **Setup**:
  - Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
  - Sign up/login to OpenAI
  - Get your `OPENAI_API_KEY`

## 📁 Project Structure

```
INFO310_Website/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts (Auth)
│   │   └── App.tsx        # Main app component
│   └── package.json
├── server/                 # Express.js backend
│   ├── routes/            # API routes
│   ├── config/            # Database and API configs
│   ├── scripts/           # Database setup and seeding
│   └── index.js           # Server entry point
└── README.md
```

## 🎯 What Each API Enables

### **With Spotify API:**

- ✅ **Song Search**: Find and add songs to battles
- ✅ **Album Artwork**: High-quality song thumbnails
- ✅ **Song Metadata**: Title, artist, album information
- ✅ **Preview URLs**: 30-second song previews

### **With YouTube API:**

- ✅ **Video Thumbnails**: Rich visual experience in battle feeds
- ✅ **Video Playback**: Watch music videos in the app
- ✅ **Enhanced UI**: Better visual representation of songs

### **With OpenAI API:**

- ✅ **AI Recommendations**: Personalized music suggestions
- ✅ **Smart Categorization**: Songs grouped by mood/theme
- ✅ **User Insights**: Understanding of musical preferences

### **Without APIs (Demo Mode):**

- ❌ Limited song search functionality
- ❌ Placeholder images instead of album artwork
- ❌ No video playback features
- ❌ Basic recommendations only

## 🛠️ Development

### Available Scripts

**Server:**

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run setup-db` - Initialize database
- `npm run seed` - Seed with sample battles

**Client:**

- `npm start` - Start React development server
- `npm run build` - Build for production

### Database Schema

- **Users**: Authentication, voting stats, streaks
- **Songs**: Song metadata, album artwork, preview URLs
- **Battles**: Song matchups, voting results, timers
- **Recommendations**: AI-generated song suggestions

## 🌟 Key Features Explained

### **Music Battles System**

- Users can create battles between any two songs
- 10 votes per day with daily reset at midnight
- Voting streaks tracked for gamification
- Real-time battle results and statistics

### **AI Recommendations**

- Analyzes user's favorite songs and voting history
- Generates personalized song suggestions using GPT-4
- Categorizes recommendations by mood/theme
- Updates daily for fresh content

### **Social Features**

- Add friends by username or email
- View friend profiles and voting history
- Compare musical tastes with friends
- See who voted on which battles

## 🚨 Troubleshooting

### Common Issues

1. **"Connection refused" errors**

   - Ensure both server (port 5001) and client (port 3000) are running
   - Check that no other processes are using these ports

2. **API errors**

   - Verify all three API keys are set correctly in `.env`
   - Check API quotas and rate limits
   - Ensure API services are enabled

3. **Database connection issues**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Run `npm run setup-db` to initialize database

### Getting Help

1. Check the console logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Contact the development team with specific error details

## 🎉 Ready to Jam?

Once you have all three APIs configured, you'll have access to:

- 🎵 **Full song search and discovery**
- 🎬 **Rich video content and thumbnails**
- 🤖 **AI-powered personalized recommendations**
- 👥 **Complete social music experience**

**Pro Tip**: Getting all three API keys takes about 10 minutes and gives you the FULL app experience with AI-powered recommendations, rich media content, and comprehensive song discovery!

---

**Built with ❤️ using React, Express, PostgreSQL, and AI**
