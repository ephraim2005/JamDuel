-- Reset password for user asv52@drexel.edu (user ID 2)
-- This will set the password to: asv52password2025
-- First, let's see the current user info
SELECT id,
    username,
    email
FROM users
WHERE id = 2;
-- Now update the password hash
-- The hash below is for password: asv52password2025
UPDATE users
SET password_hash = '$2a$12$CHtgie35PMFXIPvB2wxG1us2FB1kVm3IFJJVIXeOK6FbXowTqZ3ti'
WHERE id = 2;
-- Verify the update
SELECT id,
    username,
    email
FROM users
WHERE id = 2;
-- Show the new login credentials
SELECT 'Login Credentials:' as info,
    username,
    email,
    'asv52password2025' as new_password
FROM users
WHERE id = 2;