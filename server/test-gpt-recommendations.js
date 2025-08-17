const { generateRecommendations } = require('./routes/recommendations');
require('dotenv').config();

async function testGPTRecommendations() {
  try {
    console.log('🎵 Testing GPT-4 Recommendations Function...');
    
    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.log('❌ Please set OPENAI_API_KEY in your .env file');
      return;
    }

    console.log('✅ OpenAI API key found');
    
    // Mock user's favorite songs (based on what we saw in the database)
    const mockFavoriteSongs = [
      { title: "i wonder", artist: "kanye west", genre: "Hip-Hop" },
      { title: "apparently", artist: "j cole", genre: "Hip-Hop" },
      { title: "p power", artist: "gunna", genre: "Hip-Hop" },
      { title: "filght booked", artist: "drake", genre: "Hip-Hop" },
      { title: "You", artist: "Don toliver", genre: "Hip-Hop" },
      { title: "White iverson", artist: "Post malone", genre: "Hip-Hop" },
      { title: "Clouds", artist: "J cole", genre: "Hip-Hop" },
      { title: "Lost souls", artist: "Baby Keem", genre: "Hip-Hop" },
      { title: "Love Yourz", artist: "J cole", genre: "Hip-Hop" },
      { title: "Everything I am", artist: "Kanye West", genre: "Hip-Hop" }
    ];

    console.log('📊 Testing with user songs:', mockFavoriteSongs.map(s => `${s.title} by ${s.artist}`).join(', '));
    
    // Test the function directly
    const recommendations = await generateRecommendations(mockFavoriteSongs);
    
    console.log('🎉 GPT-4 Recommendations generated successfully!');
    console.log('📊 Recommendations:', JSON.stringify(recommendations, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing GPT-4 recommendations:', error);
  }
}

testGPTRecommendations(); 