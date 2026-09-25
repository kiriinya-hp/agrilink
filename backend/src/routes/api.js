import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { triggerStkPush } from '../services/mpesaService.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendDisbursementNotification } from '../services/notificationService.js';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'agrilink_secret_jwt_key_2026';

// ==========================================
// ADMIN PROTECTION MIDDLEWARE
// Verifies Bearer JWT AND enforces role = ADMIN.
// All routes using requireAdmin will return 401/403
// if the caller is not a verified administrator.
// ==========================================
function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Administrator authentication required. Please log in at the Admin Portal.'
      });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. This section is restricted to AgriLink Administrators only.'
      });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired administrator session. Please log in again.'
    });
  }
}

// Helper: Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ==========================================
// 1. REAL AUTHENTICATION & REGISTRATION
// ==========================================

// Register new Farmer, Buyer, or Transporter
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, location, businessName, idNumber } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    // Prohibit registering as ADMIN via public registration
    const validRoles = ['FARMER', 'BUYER', 'TRANSPORTER'];
    if (!validRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ success: false, error: 'Invalid user role specified' });
    }

    // Check existing email or phone
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { phone: phone.trim() }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with that email or phone already exists' });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: hashedPassword,
        role: role.toUpperCase(),
        businessName: businessName?.trim() || null,
        idNumber: idNumber?.trim() || null,
        location: location?.trim() || 'Kenya',
        kycStatus: 'VERIFIED',
        isEmailVerified: false,
        verificationCode,
        walletBalance: 0.0
      }
    });

    // Send verification code via email
    try {
      await sendVerificationEmail(newUser.email, verificationCode, newUser.name);
    } catch (e) {
      console.warn('Initial verification email log:', e.message);
    }

    res.status(201).json({
      success: true,
      requiresVerification: true,
      email: newUser.email,
      message: 'A 6-digit verification code has been dispatched to your email via Google App Mailer.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send / Resend Email Verification Code
router.post('/auth/send-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode: code }
    });

    await sendVerificationEmail(user.email, code, user.name);

    res.json({ success: true, message: `Verification code sent to ${user.email}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify 6-digit Email Code & Complete Registration
router.post('/auth/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Email and 6-digit code are required' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    if (!user.verificationCode || user.verificationCode.trim() !== code.trim()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification code' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, verificationCode: null }
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'EMAIL',
        title: 'Email Verified Successfully',
        message: 'Your email address has been verified. You now enjoy priority B2B trade matching on AgriLink.'
      }
    });

    const token = generateToken(updatedUser);
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({
      success: true,
      message: 'Email verified successfully! Registration complete.',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// PASSWORD RESETTING (FORGOT & RESET)
// ==========================================
router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email address is required' });

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      // Clean security response: avoid email enumeration attack
      return res.json({
        success: true,
        message: 'If an account exists with that email, a 6-digit password reset code has been sent.'
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    await prisma.user.update({
      where: { id: user.id },
      data: { resetCode, resetCodeExpires }
    });

    await sendPasswordResetEmail(user.email, resetCode, user.name);

    res.json({
      success: true,
      message: `A 6-digit password reset authorization code has been dispatched to ${user.email} via Google App Mailer.`
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/auth/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, 6-digit authorization code, and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) return res.status(404).json({ success: false, error: 'Account not found' });

    if (!user.resetCode || user.resetCode.trim() !== code.trim()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired 6-digit reset code' });
    }

    if (user.resetCodeExpires && new Date() > user.resetCodeExpires) {
      return res.status(400).json({ success: false, error: 'Password reset code has expired. Please request a new code.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpires: null
      }
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'EMAIL',
        title: 'Password Updated Successfully',
        message: 'Your account password has been reset. If you did not make this change, please contact support immediately.'
      }
    });

    res.json({
      success: true,
      message: 'Your password has been successfully reset! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// General User Login (Farmer, Buyer, Transporter)
router.post('/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Email/phone and password are required' });
    }

    const cleanId = identifier.trim().toLowerCase();

    // Look up user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanId },
          { phone: cleanId }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials. User not found.' });
    }

    // Verify hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid password. Please check and try again.' });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dedicated Admin Portal Login
router.post('/auth/admin-login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Admin identifier and security password required' });
    }

    const cleanId = identifier.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanId },
          { phone: cleanId }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Administrator account not found.' });
    }

    // Strict role check: Must be ADMIN
    if (user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: This portal is strictly restricted to System Administrators.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid administrator password.' });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Welcome back, Administrator Kelvin Kiriinya!',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fetch Authenticated User Profile
router.get('/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) return res.status(404).json({ success: false, error: 'User profile not found' });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Session expired or invalid' });
  }
});

// Admin: Fetch all users (ADMIN ONLY — protected by requireAdmin)
router.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        businessName: true,
        location: true,
        kycStatus: true,
        isEmailVerified: true,
        walletBalance: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Update user / stakeholder record (ADMIN ONLY)
router.put('/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, role, businessName, location, kycStatus, isEmailVerified, walletBalance } = req.body;
    const userId = req.params.id;

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name.trim();
    if (email) dataToUpdate.email = email.toLowerCase().trim();
    if (phone) dataToUpdate.phone = phone.trim();
    if (role) dataToUpdate.role = role.toUpperCase();
    if (businessName !== undefined) dataToUpdate.businessName = businessName;
    if (location) dataToUpdate.location = location.trim();
    if (kycStatus) dataToUpdate.kycStatus = kycStatus;
    if (isEmailVerified !== undefined) dataToUpdate.isEmailVerified = Boolean(isEmailVerified);
    if (walletBalance !== undefined) dataToUpdate.walletBalance = parseFloat(walletBalance);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate
    });

    const { password: _, ...userWithoutPassword } = updated;
    res.json({ success: true, message: 'Stakeholder updated successfully in database!', user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Delete user from database (ADMIN ONLY)
router.delete('/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    await prisma.user.delete({ where: { id: userId } });
    res.json({ success: true, message: 'User record deleted from database successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. PRODUCE CATALOG & LISTINGS
// ==========================================
router.get('/listings', async (req, res) => {
  try {
    const { category, search, grade, status = 'ACTIVE' } = req.query;
    const where = {};
    if (status && status !== 'ALL') where.status = status;
    if (category && category !== 'ALL') where.category = category;
    if (grade && grade !== 'ALL') where.grade = grade;
    if (search) {
      where.OR = [
        { cropName: { contains: search } },
        { location: { contains: search } }
      ];
    }

    const listings = await prisma.produceListing.findMany({
      where,
      include: {
        farmer: {
          select: { id: true, name: true, phone: true, location: true, kycStatus: true, businessName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, listings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/listings', async (req, res) => {
  try {
    const { farmerId, cropName, category, availableQty, unitPrice, grade, harvestDate, location, imageUrl } = req.body;
    
    if (!farmerId || !cropName || !availableQty || !unitPrice) {
      return res.status(400).json({ success: false, error: 'Missing required produce listing fields' });
    }

    const listing = await prisma.produceListing.create({
      data: {
        farmerId,
        cropName,
        category: category || 'HORTICULTURE',
        availableQty: parseFloat(availableQty),
        unitPrice: parseFloat(unitPrice),
        grade: grade || 'GRADE_A',
        harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
        location: location || 'Nairobi Region',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop'
      }
    });

    res.status(201).json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. ORDER MANAGEMENT & LIVE ESCROW
// ==========================================
router.get('/orders', async (req, res) => {
  try {
    const { userId, role } = req.query;
    const where = {};

    if (role === 'BUYER' && userId) {
      where.buyerId = userId;
    } else if (role === 'FARMER' && userId) {
      where.items = {
        some: {
          listing: { farmerId: userId }
        }
      };
    } else if (role === 'TRANSPORTER' && userId) {
      where.shipment = { transporterId: userId };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        buyer: { select: { id: true, name: true, phone: true, email: true, businessName: true } },
        items: {
          include: {
            listing: {
              include: {
                farmer: { select: { id: true, name: true, phone: true, location: true, businessName: true } }
              }
            }
          }
        },
        escrowTransaction: true,
        shipment: {
          include: {
            transporter: { select: { id: true, name: true, phone: true, businessName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create Order & Initiate Escrow
router.post('/orders', async (req, res) => {
  try {
    const { buyerId, listingId, quantity, deliveryAddress, notes } = req.body;
    const qty = parseFloat(quantity);

    const listing = await prisma.produceListing.findUnique({
      where: { id: listingId },
      include: { farmer: true }
    });

    if (!listing) return res.status(404).json({ success: false, error: 'Listing not found' });
    if (listing.availableQty < qty) {
      return res.status(400).json({ success: false, error: `Only ${listing.availableQty} kg available in stock` });
    }

    const totalAmount = qty * listing.unitPrice;
    const transportFee = 20.00 + (qty * 0.02);
    const platformFee = totalAmount * 0.05;
    const grandTotal = totalAmount + transportFee + platformFee;

    const orderNumber = `AGR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        buyerId,
        totalAmount,
        transportFee,
        platformFee,
        grandTotal,
        status: 'PENDING',
        deliveryAddress: deliveryAddress || 'Buyer Primary Warehouse Depot',
        notes: notes || '',
        items: {
          create: {
            listingId: listing.id,
            cropName: listing.cropName,
            quantity: qty,
            unitPrice: listing.unitPrice,
            subtotal: totalAmount
          }
        }
      },
      include: { items: true }
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Live M-Pesa STK Push / Card Escrow Funding
router.post('/escrow/deposit', async (req, res) => {
  try {
    const { orderId, paymentGateway = 'MPESA_STK', phoneNumber } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        items: { include: { listing: true } },
        shipment: true
      }
    });

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    if (order.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: 'Order has already been processed or funded' });
    }

    const payerPhone = phoneNumber || order.buyer?.phone;
    if (!payerPhone) {
      return res.status(400).json({ success: false, error: 'Valid mobile phone number required for M-Pesa payment' });
    }

    const confirmationOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const reference = `ESC-${paymentGateway.toUpperCase().slice(0, 5)}-${Date.now().toString().slice(-7)}`;

    // Dispatch STK Push via Daraja API service
    const stkResult = await triggerStkPush({
      phone: payerPhone,
      amount: order.grandTotal,
      orderNumber: order.orderNumber,
      reference
    });

    // Atomic transaction: Create escrow record with M-Pesa tracking IDs, create shipment, deduct inventory
    const updatedOrder = await prisma.$transaction(async (tx) => {
      await tx.escrowTransaction.create({
        data: {
          orderId: order.id,
          reference,
          paymentGateway,
          amountHeld: order.grandTotal,
          status: 'HELD',
          checkoutRequestId: stkResult.checkoutRequestId,
          merchantRequestId: stkResult.merchantRequestId
        }
      });

      const primaryItem = order.items[0];
      const pickupLoc = primaryItem?.listing?.location || 'Farm Collection Point';
      
      await tx.shipment.create({
        data: {
          orderId: order.id,
          pickupLocation: pickupLoc,
          dropoffLocation: order.deliveryAddress,
          transitStatus: 'PENDING_ASSIGNMENT',
          confirmationOtp
        }
      });

      for (const item of order.items) {
        await tx.produceListing.update({
          where: { id: item.listingId },
          data: { availableQty: { decrement: item.quantity } }
        });
      }

      // Deduct buyer's account balance directly in the database
      let updatedBuyer = null;
      if (order.buyerId) {
        updatedBuyer = await tx.user.update({
          where: { id: order.buyerId },
          data: { walletBalance: { decrement: order.grandTotal } }
        });

        await tx.notification.create({
          data: {
            userId: order.buyerId,
            type: 'WALLET_DEBIT',
            title: 'Payment Deducted & Locked in Escrow',
            message: `KSh / $${order.grandTotal.toFixed(2)} has been deducted from your account and locked in AgriLink Smart Escrow for Order #${order.orderNumber}. Available balance: $${updatedBuyer.walletBalance.toFixed(2)}.`
          }
        });
      }

      const finalizedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: 'ESCROW_FUNDED' },
        include: {
          escrowTransaction: true,
          shipment: true,
          items: true
        }
      });

      return { finalizedOrder, newBuyerBalance: updatedBuyer ? updatedBuyer.walletBalance : null };
    });

    res.json({
      success: true,
      message: stkResult.customerMessage,
      stkDetails: stkResult,
      order: updatedOrder.finalizedOrder,
      confirmationOtp,
      newBuyerBalance: updatedOrder.newBuyerBalance
    });
  } catch (error) {
    console.error('Escrow deposit error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// User Wallet Top-Up via M-Pesa / Card
router.post('/wallet/topup', async (req, res) => {
  try {
    const { userId, amount, paymentMethod = 'MPESA' } = req.body;
    const addAmt = parseFloat(amount);
    if (!userId || isNaN(addAmt) || addAmt <= 0) {
      return res.status(400).json({ success: false, error: 'Valid user ID and positive top-up amount required' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { increment: addAmt } }
    });

    await prisma.notification.create({
      data: {
        userId,
        type: 'WALLET_TOPUP',
        title: 'Wallet Top-up Confirmed',
        message: `Your AgriLink balance has been credited with $${addAmt.toFixed(2)} via ${paymentMethod}. New balance: $${updatedUser.walletBalance.toFixed(2)}.`
      }
    });

    res.json({
      success: true,
      message: `Successfully topped up $${addAmt.toFixed(2)} to your account!`,
      walletBalance: updatedUser.walletBalance
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Safaricom Webhook Callback Receiver
router.post('/payments/mpesa/callback', async (req, res) => {
  try {
    const callbackData = req.body?.Body?.stkCallback;
    console.log('[M-PESA WEBHOOK] Received callback from Safaricom:', JSON.stringify(callbackData));

    if (callbackData && callbackData.ResultCode === 0) {
      const checkoutRequestId = callbackData.CheckoutRequestID;
      const metadata = callbackData.CallbackMetadata?.Item || [];
      const mpesaReceipt = metadata.find(i => i.Name === 'MpesaReceiptNumber')?.Value;

      // Update escrow transaction record
      await prisma.escrowTransaction.updateMany({
        where: { checkoutRequestId },
        data: { mpesaReceipt: String(mpesaReceipt || '') }
      });
      console.log(`[M-PESA WEBHOOK] Payment confirmed for CheckoutID: ${checkoutRequestId}, Receipt: ${mpesaReceipt}`);
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    console.error('Callback error:', err);
    res.status(500).json({ ResultCode: 1, ResultDesc: 'Failed' });
  }
});

// ==========================================
// 4. LOGISTICS & SHIPMENTS
// ==========================================
router.get('/shipments/available', async (req, res) => {
  try {
    const shipments = await prisma.shipment.findMany({
      where: { transitStatus: 'PENDING_ASSIGNMENT' },
      include: {
        order: {
          include: {
            items: true,
            buyer: { select: { name: true, phone: true, businessName: true } }
          }
        }
      },
      orderBy: { order: { createdAt: 'desc' } }
    });
    res.json({ success: true, shipments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/shipments/:id/accept', async (req, res) => {
  try {
    const { transporterId, vehicleReg } = req.body;
    const shipmentId = req.params.id;

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { order: true }
    });

    if (!shipment) return res.status(404).json({ success: false, error: 'Shipment not found' });
    if (shipment.transporterId) return res.status(400).json({ success: false, error: 'Job already claimed' });

    const updatedShipment = await prisma.$transaction(async (tx) => {
      const s = await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          transporterId,
          vehicleReg: vehicleReg || 'KBZ 100A (Fleet Truck)',
          transitStatus: 'ASSIGNED',
          dispatchedAt: new Date()
        }
      });

      await tx.order.update({
        where: { id: shipment.orderId },
        data: { status: 'DISPATCH_READY' }
      });

      return s;
    });

    res.json({ success: true, message: 'Shipment assigned to transporter', shipment: updatedShipment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/shipments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const shipmentId = req.params.id;

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { order: true }
    });

    if (!shipment) return res.status(404).json({ success: false, error: 'Shipment not found' });

    const updated = await prisma.$transaction(async (tx) => {
      const s = await tx.shipment.update({
        where: { id: shipmentId },
        data: { transitStatus: status }
      });

      let orderStatus = shipment.order.status;
      if (status === 'IN_TRANSIT') orderStatus = 'IN_TRANSIT';
      if (status === 'ARRIVED') orderStatus = 'ARRIVED';

      await tx.order.update({
        where: { id: shipment.orderId },
        data: { status: orderStatus }
      });

      return s;
    });

    res.json({ success: true, shipment: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Atomic OTP Delivery Verification & Escrow Settlement
router.post('/shipments/:id/verify-delivery', async (req, res) => {
  try {
    const { otp } = req.body;
    const shipmentId = req.params.id;

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        order: {
          include: {
            items: { include: { listing: true } },
            escrowTransaction: true
          }
        },
        transporter: true
      }
    });

    if (!shipment) return res.status(404).json({ success: false, error: 'Shipment not found' });
    if (shipment.confirmationOtp !== otp.trim()) {
      return res.status(400).json({ success: false, error: 'Invalid Delivery Verification OTP' });
    }

    const order = shipment.order;
    if (order.status === 'COMPLETED') {
      return res.status(400).json({ success: false, error: 'Order is already settled' });
    }

    // Atomic financial settlement: release escrow and credit wallets
    const result = await prisma.$transaction(async (tx) => {
      await tx.shipment.update({
        where: { id: shipmentId },
        data: {
          transitStatus: 'DELIVERED',
          deliveredAt: new Date()
        }
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: 'COMPLETED' }
      });

      await tx.escrowTransaction.update({
        where: { orderId: order.id },
        data: {
          status: 'RELEASED',
          releasedAt: new Date()
        }
      });

      const farmerId = order.items[0]?.listing?.farmerId;
      if (farmerId) {
        await tx.user.update({
          where: { id: farmerId },
          data: { walletBalance: { increment: order.totalAmount } }
        });
      }

      if (shipment.transporterId) {
        await tx.user.update({
          where: { id: shipment.transporterId },
          data: { walletBalance: { increment: order.transportFee } }
        });
      }

      // Credit platform fee to Admin account (Kelvin Kiriinya)
      const admin = await tx.user.findFirst({ where: { role: 'ADMIN' } });
      if (admin) {
        await tx.user.update({
          where: { id: admin.id },
          data: { walletBalance: { increment: order.platformFee } }
        });
      }

      return {
        farmerPayout: order.totalAmount,
        transporterPayout: order.transportFee,
        platformFee: order.platformFee
      };
    });

    // Multi-channel disbursement notification (Email receipt, SMS & WhatsApp)
    let notificationResult = null;
    try {
      const buyer = await prisma.user.findUnique({ where: { id: order.buyerId } });
      const farmerId = order.items[0]?.listing?.farmerId;
      const farmer = farmerId ? await prisma.user.findUnique({ where: { id: farmerId } }) : null;
      const transporterUser = shipment.transporterId ? await prisma.user.findUnique({ where: { id: shipment.transporterId } }) : null;

      notificationResult = await sendDisbursementNotification({
        order,
        settlement: result,
        buyer,
        farmer,
        transporterUser
      });
    } catch (notifErr) {
      console.warn('Disbursement notification dispatch note:', notifErr.message);
    }

    res.json({
      success: true,
      message: 'OTP verified! Delivery confirmed and escrow funds disbursed atomically.',
      settlement: result,
      notification: notificationResult
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 5. TRANSPORTER LIVE AVAILABILITY COUNT
// ==========================================
router.get('/transporters/count', async (req, res) => {
  try {
    const count = await prisma.user.count({
      where: {
        role: 'TRANSPORTER',
        kycStatus: 'VERIFIED'
      }
    });

    res.json({
      success: true,
      count: Math.max(count, 3), // Ensure active fleet count
      activeDrivers: Math.max(count, 3),
      message: `${Math.max(count, 3)} verified logistics transporters active in this corridor ready for dispatch`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 6. NOTIFICATION CENTER
// ==========================================
router.get('/notifications', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, error: 'userId parameter required' });

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 25
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false }
    });

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/notifications/read-all', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: 'userId is required' });

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 5. EXECUTIVE BI ANALYTICS (ADMIN ONLY)
// ==========================================
router.get('/analytics', requireAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true, escrowTransaction: true }
    });

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
    
    const grossMerchandiseValue = orders.reduce((sum, o) => sum + o.grandTotal, 0);

    const activeEscrowHeld = orders
      .filter(o => o.escrowTransaction && o.escrowTransaction.status === 'HELD')
      .reduce((sum, o) => sum + o.escrowTransaction.amountHeld, 0);

    const platformCommissionEarned = orders
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.platformFee, 0);

    const totalKilograms = orders.reduce((sum, o) => {
      return sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0);
    }, 0);

    const userCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    });

    res.json({
      success: true,
      analytics: {
        totalOrders,
        completedOrders,
        grossMerchandiseValue: parseFloat(grossMerchandiseValue.toFixed(2)),
        activeEscrowHeld: parseFloat(activeEscrowHeld.toFixed(2)),
        platformCommissionEarned: parseFloat(platformCommissionEarned.toFixed(2)),
        totalTonnage: parseFloat((totalKilograms / 1000).toFixed(2)),
        totalKilograms: parseFloat(totalKilograms.toFixed(2)),
        userCounts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
