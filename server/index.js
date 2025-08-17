const express = require('express');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { router: authRoutes } = require('./routes/auth');
const battleRoutes = require('./routes/battles');
const songRoutes = require('./routes/songs');
const userRoutes = require('./routes/users');
const spotifyRoutes = require('./routes/spotify');
const { router: recommendationRoutes } = require('./routes/recommendations');
const { router: friendRoutes } = require('./routes/friends');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100 // limit each IP to 1000 requests per windowMs in development
});
app.use(limiter);

// CORS
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/users', userRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/friends', friendRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'JamDuel server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 JamDuel server running on port ${PORT}`);
  console.log(`🎵 Ready for some epic music battles!`);
}); 