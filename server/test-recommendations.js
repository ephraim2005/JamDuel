const axios = require('axios');
require('dotenv').config();

async function testRecommendations() {
  try {
    console.log('🎵 Testing GPT-4 Recommendations System...');
    
    // First, let's check if we have an OpenAI API key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.log('❌ Please set OPENAI_API_KEY in your .env file');
      console.log('   Get your API key from: https://platform.openai.com/api-keys');
      return;
    }

    console.log('✅ OpenAI API key found');
    
    // Test the recommendations endpoint for user ID 2
    const response = await axios.post('http://localhost:5001/api/recommendations/user/2/generate', {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('🎉 Recommendations generated successfully!');
    console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing recommendations:', error.response?.data || error.message);
  }
}

testRecommendations(); 