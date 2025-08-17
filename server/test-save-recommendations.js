const { generateRecommendations, saveRecommendations } = require('./routes/recommendations');
require('dotenv').config();

async function testSaveRecommendations() {
  try {
    console.log('💾 Testing Save Recommendations to Database...');
    
    // Mock user's favorite songs
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

    console.log('📊 Generating recommendations for user songs...');
    
    // Generate recommendations
    const recommendations = await generateRecommendations(mockFavoriteSongs);
    
    console.log('🎉 Recommendations generated!');
    
    // Save to database for user ID 2
    console.log('💾 Saving recommendations to database for user ID 2...');
    await saveRecommendations(2, recommendations);
    
    console.log('✅ Recommendations saved to database successfully!');
    console.log('📊 You can now check the user_recommendations table in the database');
    
  } catch (error) {
    console.error('❌ Error testing save recommendations:', error);
  }
}

testSaveRecommendations(); 