const bcrypt = require('bcryptjs');
const pool = require('./config/database');
require('dotenv').config();

async function resetPassword() {
  try {
    console.log('🔐 Resetting password for user asv52@drexel.edu...');
    
    // New password to set
    const newPassword = 'asv52password2025';
    
    // Hash the new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the password in the database
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = 2 RETURNING username, email',
      [passwordHash]
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Password reset successfully!');
      console.log(`👤 Username: ${result.rows[0].username}`);
      console.log(`📧 Email: ${result.rows[0].email}`);
      console.log(`🔑 New Password: ${newPassword}`);
      console.log('\n💡 You can now log in with:');
      console.log(`   Email: ${result.rows[0].email}`);
      console.log(`   Password: ${newPassword}`);
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await pool.end();
  }
}

resetPassword(); 