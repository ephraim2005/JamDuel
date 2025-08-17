const bcrypt = require('bcryptjs');

async function generateHash() {
  try {
    const password = 'asv52password2025';
    const saltRounds = 12;
    
    console.log('🔐 Generating bcrypt hash for password:', password);
    
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('✅ Generated hash:');
    console.log(hash);
    
    // Test the hash
    const isValid = await bcrypt.compare(password, hash);
    console.log('✅ Hash verification:', isValid);
    
  } catch (error) {
    console.error('❌ Error generating hash:', error);
  }
}

generateHash(); 