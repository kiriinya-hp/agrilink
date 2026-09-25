import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

const {
  GMAIL_USER,
  GMAIL_APP_PASSWORD,
  SMTP_HOST,
  SMTP_PORT = 587,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM = 'AgriLink Escrow Notifications <notifications@agrilink.co.ke>'
} = process.env;

// Initialize Nodemailer transporter with Google App Password or Custom SMTP
let transporter = null;

if (GMAIL_USER && GMAIL_APP_PASSWORD && !GMAIL_USER.includes('your_email')) {
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER.trim(),
        pass: GMAIL_APP_PASSWORD.replace(/\s+/g, '') // remove spaces from 16-character code
      }
    });
    console.log(`[EMAIL] Google App Mailer initialized successfully for ${GMAIL_USER}`);
  } catch (err) {
    console.warn('Google App Mailer initialization skipped:', err.message);
  }
} else if (SMTP_HOST && SMTP_USER && SMTP_PASS && !SMTP_USER.includes('YOUR_')) {
  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  } catch (err) {
    console.warn('SMTP transporter initialization skipped:', err.message);
  }
}

const getSenderAddress = () => {
  if (GMAIL_USER && !GMAIL_USER.includes('your_email')) {
    return `AgriLink Security <${GMAIL_USER.trim()}>`;
  }
  return SMTP_FROM;
};

/**
 * Format phone to international WhatsApp / SMS format (e.g. 254712345678)
 */
export function sanitizePhone(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned;
  }
  return cleaned;
}

/**
 * Send 6-digit Email Verification OTP
 */
export async function sendVerificationEmail(email, code, userName = 'Valued Partner') {
  const subject = `AgriLink Security: Your Email Verification Code is ${code}`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #15803d, #166534); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">AgriLink</h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Integrated B2B Agribusiness SCM Platform</p>
      </div>
      <div style="padding: 32px 24px; color: #1e293b;">
        <h2 style="font-size: 18px; margin-top: 0; color: #0f172a;">Verify Your Email Address</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">Hello <strong>${userName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">Thank you for registering on AgriLink. Please use the 6-digit verification code below to verify your email address and activate your verified badge:</p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; padding: 14px 28px; background-color: #f0fdf4; border: 2px dashed #22c55e; border-radius: 8px; font-size: 28px; font-family: monospace; font-weight: bold; letter-spacing: 6px; color: #15803d;">
            ${code}
          </div>
        </div>
        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">This code will expire in 15 minutes. If you did not create an account on AgriLink, please disregard this email.</p>
      </div>
      <div style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">
        © 2026 AgriLink Agribusiness SCM Platform. All rights reserved.
      </div>
    </div>
  `;

  console.log(`\n======================================================`);
  console.log(`📬 [GMAIL APP MAILER] 6-Digit Verification Code`);
  console.log(`📧 Recipient: ${email}`);
  console.log(`🔑 Verification OTP: ${code}`);
  console.log(`======================================================\n`);

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: getSenderAddress(),
        to: email,
        subject,
        html
      });
      console.log(`✓ Verification email sent via Google Mailer! Message ID: ${info.messageId}`);
      return { success: true, mode: 'GOOGLE_APP_SENT', messageId: info.messageId };
    } catch (err) {
      console.error('⚠️ Google Mailer send failed:', err.message);
    }
  }

  return { success: true, mode: 'PREVIEW_LOGGED', code };
}

/**
 * Send 6-digit Password Reset OTP
 */
export async function sendPasswordResetEmail(email, code, userName = 'Valued Partner') {
  const subject = `AgriLink Password Reset: Your Security Code is ${code}`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Agri<span style="color: #4ade80;">Link</span></h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Account Security & Credential Recovery</p>
      </div>
      <div style="padding: 32px 24px; color: #1e293b;">
        <h2 style="font-size: 18px; margin-top: 0; color: #0f172a;">Password Reset Request</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">Hello <strong>${userName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">We received a request to reset the password for your AgriLink account. Use the 6-digit authorization code below to choose a new password:</p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; padding: 14px 28px; background-color: #fef2f2; border: 2px dashed #ef4444; border-radius: 8px; font-size: 28px; font-family: monospace; font-weight: bold; letter-spacing: 6px; color: #b91c1c;">
            ${code}
          </div>
        </div>
        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">This password reset code is valid for 15 minutes. If you did not request a password reset, please secure your account immediately.</p>
      </div>
      <div style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">
        © 2026 AgriLink Agribusiness SCM Platform. All rights reserved.
      </div>
    </div>
  `;

  console.log(`\n======================================================`);
  console.log(`🔒 [PASSWORD RESET REQUEST] 6-Digit Code`);
  console.log(`📧 Recipient: ${email}`);
  console.log(`🔑 Reset Code: ${code}`);
  console.log(`======================================================\n`);

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: getSenderAddress(),
        to: email,
        subject,
        html
      });
      console.log(`✓ Password reset email sent via Google Mailer! Message ID: ${info.messageId}`);
      return { success: true, mode: 'GOOGLE_APP_SENT', messageId: info.messageId };
    } catch (err) {
      console.error('⚠️ Password reset email failed to send:', err.message);
    }
  }

  return { success: true, mode: 'PREVIEW_LOGGED', code };
}

/**
 * Dispatch Multi-Channel Settlement & Disbursement Receipt (Email, SMS & WhatsApp)
 */
export async function sendDisbursementNotification({ order, settlement, buyer, farmer, transporterUser }) {
  const cropItem = order.items?.[0] || {};
  const cropName = cropItem.cropName || 'Fresh Produce';
  const quantity = cropItem.quantity || 0;
  const orderNumber = order.orderNumber;
  const totalAmount = order.grandTotal.toFixed(2);
  const farmerPayout = settlement.farmerPayout.toFixed(2);
  const transporterPayout = settlement.transporterPayout.toFixed(2);
  const platformFee = settlement.platformFee.toFixed(2);

  // 1. Text for SMS & WhatsApp
  const smsMessage = `AgriLink ESCROW DISBURSED: Order #${orderNumber} (${quantity}kg ${cropName}) delivery confirmed. Farmer received $${farmerPayout}. Driver received $${transporterPayout}. Receipt: agrilink.co.ke/receipt/${order.id}`;

  const whatsappMessage = `*AGRILINK OFFICIAL DISBURSEMENT RECEIPT*\n` +
    `---------------------------------------\n` +
    `*Order Number:* ${orderNumber}\n` +
    `*Status:* COMPLETED & SETTLED (ESCROW RELEASED)\n` +
    `*Produce:* ${quantity} kg of ${cropName}\n` +
    `*Delivery To:* ${order.deliveryAddress}\n` +
    `---------------------------------------\n` +
    `*Total Escrow Held:* $${totalAmount}\n` +
    `• Farmer Payout (${farmer?.name || 'Producer'}): $${farmerPayout}\n` +
    `• Freight Payout (${transporterUser?.name || 'Driver'}): $${transporterPayout}\n` +
    `• Platform SCM Fee (5%): $${platformFee}\n` +
    `---------------------------------------\n` +
    `Verified via 4-Digit Delivery OTP. Funds disbursed to registered M-Pesa accounts.\n` +
    `Thank you for using AgriLink!`;

  // WhatsApp click-to-chat links
  const buyerWhatsAppLink = buyer?.phone
    ? `https://api.whatsapp.com/send?phone=${sanitizePhone(buyer.phone)}&text=${encodeURIComponent(whatsappMessage)}`
    : null;

  const farmerWhatsAppLink = farmer?.phone
    ? `https://api.whatsapp.com/send?phone=${sanitizePhone(farmer.phone)}&text=${encodeURIComponent(whatsappMessage)}`
    : null;

  // 2. HTML Email Receipt for Buyer
  const buyerHtmlReceipt = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #15803d, #0f172a); padding: 24px; text-align: center; color: #ffffff;">
        <span style="display: inline-block; padding: 4px 12px; background: rgba(34,197,94,0.25); border: 1px solid #4ade80; border-radius: 100px; font-size: 11px; font-weight: bold; text-transform: uppercase;">
          Settlement Confirmed
        </span>
        <h1 style="margin: 8px 0 0; font-size: 22px; font-weight: 800;">Official Escrow Disbursement Receipt</h1>
        <p style="margin: 4px 0 0; font-size: 12px; opacity: 0.85;">Order #${orderNumber}</p>
      </div>

      <div style="padding: 24px; color: #1e293b;">
        <p style="font-size: 14px; margin-top: 0;">Dear <strong>${buyer?.name || 'Customer'}</strong>,</p>
        <p style="font-size: 13px; line-height: 1.6; color: #475569;">
          Physical inspection of your order has been verified via the driver OTP. The escrow funds have been atomically disbursed to the producer and logistics provider.
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Produce Item:</td>
              <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #0f172a;">${cropName} (${quantity} kg)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Farmer Payout:</td>
              <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #15803d;">$${farmerPayout}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Logistics Freight Fee:</td>
              <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #0f172a;">$${transporterPayout}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Platform SCM Commission (5%):</td>
              <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #0f172a;">$${platformFee}</td>
            </tr>
            <tr style="border-top: 1px solid #cbd5e1;">
              <td style="padding: 10px 0 0; font-weight: bold; font-size: 14px;">Total Escrow Released:</td>
              <td style="padding: 10px 0 0; text-align: right; font-weight: bold; font-size: 16px; color: #15803d;">$${totalAmount}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
          Delivery Location: <strong>${order.deliveryAddress}</strong><br/>
          Payment Method: <strong>M-Pesa STK Escrow</strong>
        </p>
      </div>

      <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b;">
        AgriLink Escrow Engine • Automated System Generated Receipt
      </div>
    </div>
  `;

  // 3. Save In-App Notifications to Database
  try {
    if (buyer?.id) {
      await prisma.notification.create({
        data: {
          userId: buyer.id,
          type: 'EMAIL',
          title: `Disbursement Receipt: Order #${orderNumber}`,
          message: `Delivery confirmed. $${totalAmount} escrow funds disbursed ($${farmerPayout} to Farmer, $${transporterPayout} to Transporter).`,
          metadata: JSON.stringify({
            orderNumber,
            totalAmount,
            farmerPayout,
            transporterPayout,
            cropName,
            quantity,
            whatsappLink: buyerWhatsAppLink
          })
        }
      });
    }

    if (farmer?.id) {
      await prisma.notification.create({
        data: {
          userId: farmer.id,
          type: 'SMS',
          title: `Escrow Funds Credited: $${farmerPayout}`,
          message: `Delivery confirmed for Order #${orderNumber}! $${farmerPayout} has been credited to your AgriLink wallet for 200kg ${cropName}.`,
          metadata: JSON.stringify({
            orderNumber,
            farmerPayout,
            whatsappLink: farmerWhatsAppLink
          })
        }
      });
    }
  } catch (dbErr) {
    console.error('Failed to create in-app notification records:', dbErr.message);
  }

  // 4. Send Email to Buyer if SMTP is active
  if (transporter && buyer?.email) {
    try {
      await transporter.sendMail({
        from: SMTP_FROM,
        to: buyer.email,
        subject: `AgriLink Settlement: Official Receipt for Order #${orderNumber}`,
        html: buyerHtmlReceipt
      });
    } catch (e) {
      console.warn('Could not dispatch SMTP email receipt:', e.message);
    }
  }

  console.log(`[NOTIFICATION DISBURSEMENT] Order #${orderNumber}: SMS & WhatsApp message prepared.`);
  console.log(`- SMS preview: ${smsMessage}`);
  console.log(`- WhatsApp preview: ${whatsappMessage}`);

  return {
    success: true,
    smsMessage,
    whatsappMessage,
    buyerWhatsAppLink,
    farmerWhatsAppLink
  };
}
