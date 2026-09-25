import axios from 'axios';

const BASE = 'http://localhost:5000/api';

async function run() {
  console.log('Testing full Registration OTP & Password Reset workflow...');

  const testUser = {
    name: 'Faith Kiprono',
    email: 'faith.kiprono@agrilink.co.ke',
    phone: '+254799887766',
    password: 'InitialPassword123!',
    role: 'FARMER',
    location: 'Nandi Hills'
  };

  // 1. Register User -> triggers OTP
  console.log('\n1. Calling POST /api/auth/register...');
  const regRes = await axios.post(`${BASE}/auth/register`, testUser);
  console.log('Register Response:', regRes.data);

  // 2. Fetch the verification code from DB to simulate reading email
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  const dbUser = await prisma.user.findUnique({ where: { email: testUser.email } });
  console.log(`Found generated Verification OTP in database: ${dbUser.verificationCode}`);

  // 3. Verify OTP
  console.log('\n2. Calling POST /api/auth/verify-email with 6-digit code...');
  const verifRes = await axios.post(`${BASE}/auth/verify-email`, {
    email: testUser.email,
    code: dbUser.verificationCode
  });
  console.log('Verification Success:', verifRes.data.success);
  console.log('User Email Verified:', verifRes.data.user.isEmailVerified);
  console.log('JWT Token Issued:', verifRes.data.token ? 'YES' : 'NO');

  // 4. Forgot Password
  console.log('\n3. Calling POST /api/auth/forgot-password...');
  const forgotRes = await axios.post(`${BASE}/auth/forgot-password`, {
    email: testUser.email
  });
  console.log('Forgot Password Response:', forgotRes.data.message);

  // 5. Read reset code from DB
  const dbUserReset = await prisma.user.findUnique({ where: { email: testUser.email } });
  console.log(`Found generated Password Reset Code in database: ${dbUserReset.resetCode}`);

  // 6. Reset Password with new password
  console.log('\n4. Calling POST /api/auth/reset-password...');
  const newPassword = 'BrandNewSecurePassword2026!';
  const resetRes = await axios.post(`${BASE}/auth/reset-password`, {
    email: testUser.email,
    code: dbUserReset.resetCode,
    newPassword
  });
  console.log('Reset Password Response:', resetRes.data.message);

  // 7. Login with new password
  console.log('\n5. Calling POST /api/auth/login with new password...');
  const loginRes = await axios.post(`${BASE}/auth/login`, {
    identifier: testUser.email,
    password: newPassword
  });
  console.log('Login Success with New Password:', loginRes.data.success);
  console.log('Authenticated User:', loginRes.data.user.name, `(${loginRes.data.user.role})`);

  // Clean up test user
  await prisma.user.delete({ where: { id: loginRes.data.user.id } });
  await prisma.$disconnect();

  console.log('\n🎉 ALL AUTHENTICATION, EMAIL OTP & PASSWORD RESET TESTS PASSED SUCCESSFULLY!\n');
}

run().catch(err => {
  console.error('Test Failed:', err.response?.data || err.message);
  process.exit(1);
});
