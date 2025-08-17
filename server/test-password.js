const bcrypt = require('bcryptjs');

async function testPassword() {
  try {
    const password = 'asv52password2025';
    const storedHash = '$2a$12$CuPCgyp84l9o/tBiSjCDKO9.eZ07x6Df4xnRLLyQ0SSu1.s2o4yqG';
    
    console.log('🔐 Testing password verification...');
    console.log('Password:', password);
    console.log('Stored hash:', storedHash);
    
    // Test the password against the stored hash
    const isValid = await bcrypt.compare(password, storedHash);
    
    console.log('✅ Password verification result:', isValid);
    
    if (isValid) {
      console.log('🎉 Password is valid! You should be able to log in now.');
    } else {
      console.log('❌ Password verification failed.');
    }
    
  } catch (error) {
    console.error('❌ Error testing password:', error);
  }
}

testPassword(); 