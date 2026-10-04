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

// Initialize Nodemailer with explicit Gmail SMTP (port 465 SSL)
let transporter = null;

if (GMAIL_USER && GMAIL_APP_PASSWORD && !GMAIL_USER.includes('your_email')) {
  const cleanPass = GMAIL_APP_PASSWORD.replace(/\s+/g, '');
  const cleanUser = GMAIL_USER.trim();

  console.log(`[EMAIL] Initializing Gmail SMTP for: ${cleanUser}`);
  console.log(`[EMAIL] App Password length: ${cleanPass.length} characters`);

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: cleanUser,
      pass: cleanPass
    },
    tls: { rejectUnauthorized: false }
  });

  // Verify connection at server startup — logs success or full error details
  transporter.verify((err, success) => {
    if (err) {
      console.error('==========================================');
      console.error('[EMAIL ERROR] Gmail SMTP FAILED TO CONNECT:');
      console.error('Error Code:', err.code);
      console.error('Error Message:', err.message);
      console.error('SMTP Response:', err.response);
      console.error('==========================================');
    } else {
      console.log('[EMAIL] ✅ Gmail SMTP connected — emails will send successfully!');
    }
  });

} else if (SMTP_HOST && SMTP_USER && SMTP_PASS && !SMTP_USER.includes('YOUR_')) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
} else {
  console.warn('[EMAIL] ⚠️ No email credentials set. Codes will only log to console.');
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
  const subject = `🔐 AgriLink Security: ${code} is your Account Verification Code`;
  const text = `AgriLink Security Verification Code: ${code}\n\nHello ${userName},\n\nUse this 6-digit code to verify your AgriLink account: ${code}\nThis code expires in 15 minutes. Never share this code with anyone.\n\n© 2026 AgriLink Agribusiness SCM Platform`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your AgriLink Account</title>
    </head>
    <body style="margin: 0; padding: 24px 12px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <!-- Top Branded Banner -->
        <tr>
          <td style="background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #022c22 100%); padding: 32px 28px; text-align: center;">
            <div style="display: inline-block; padding: 6px 16px; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 9999px; margin-bottom: 12px;">
              <span style="color: #6ee7b7; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">Official Security Portal</span>
            </div>
            <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Agri<span style="color: #34d399;">Link</span></h1>
            <p style="margin: 6px 0 0; color: #a7f3d0; font-size: 13px; font-weight: 500;">Direct B2B Agribusiness SCM & Safaricom Daraja Escrow</p>
          </td>
        </tr>

        <!-- Main Body Content -->
        <tr>
          <td style="padding: 36px 32px; color: #1e293b;">
            <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
              Verify Your Email Address
            </h2>
            <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #475569;">
              Hello <strong style="color: #0f172a;">${userName}</strong>,
            </p>
            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #475569;">
              Thank you for registering on AgriLink. To finalize your account setup and activate your verified badge, enter this 6-digit one-time authorization code:
            </p>

            <!-- OTP Code Display Card -->
            <div style="margin: 28px 0; padding: 24px; background: #f0fdf4; border: 2px dashed #10b981; border-radius: 14px; text-align: center;">
              <span style="display: block; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #065f46; margin-bottom: 8px;">
                Your One-Time Passcode (OTP)
              </span>
              <div style="font-family: 'SF Mono', Monaco, 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #047857; padding: 4px 0;">
                ${code}
              </div>
              <span style="display: block; font-size: 11px; color: #059669; margin-top: 8px; font-weight: 600;">
                ⏱ Valid for 15 minutes • Single-use only
              </span>
            </div>

            <!-- Security Advisory Strip -->
            <div style="background-color: #f8fafc; border-left: 4px solid #059669; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 12px; color: #334155; line-height: 1.5;">
                <strong style="color: #0f172a;">Security Advisory:</strong> AgriLink support agents will never call or message asking for your password, M-Pesa PIN, or this OTP code.
              </p>
            </div>

            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">
              If you did not initiate this registration request, please disregard this email or contact security at <a href="mailto:agrilink287@gmail.com" style="color: #059669; text-decoration: none; font-weight: bold;">agrilink287@gmail.com</a>.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #f1f5f9; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #475569;">
              AgriLink B2B Agribusiness SCM Platform
            </p>
            <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.4;">
              Nairobi, Kenya • Automated Notification Dispatcher • Ref: ${Math.random().toString(36).substring(2, 9).toUpperCase()}
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
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
        text,
        html
      });
      console.log(`✅ Verification email SENT! Message ID: ${info.messageId}`);
      return { success: true, mode: 'GOOGLE_APP_SENT', messageId: info.messageId };
    } catch (err) {
      console.error('==========================================');
      console.error('❌ VERIFICATION EMAIL FAILED TO SEND:');
      console.error('Code:', err.code);
      console.error('Message:', err.message);
      console.error('Response:', err.response);
      console.error('==========================================');
    }
  } else {
    console.warn('[EMAIL] transporter is null — check GMAIL_USER and GMAIL_APP_PASSWORD env vars');
  }

  return { success: true, mode: 'PREVIEW_LOGGED', code };
}

/**
 * Send 6-digit Password Reset OTP
 */
export async function sendPasswordResetEmail(email, code, userName = 'Valued Partner') {
  const subject = `🔒 AgriLink Security: ${code} is your Password Recovery Code`;
  const text = `AgriLink Password Recovery Code: ${code}\n\nHello ${userName},\n\nUse this 6-digit code to reset your AgriLink password: ${code}\nValid for 15 minutes. If you did not request this, secure your account immediately.\n\n© 2026 AgriLink Agribusiness SCM Platform`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Recovery</title>
    </head>
    <body style="margin: 0; padding: 24px 12px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <!-- Top Branded Banner -->
        <tr>
          <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #020617 100%); padding: 32px 28px; text-align: center;">
            <div style="display: inline-block; padding: 6px 16px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 9999px; margin-bottom: 12px;">
              <span style="color: #fca5a5; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">Credential Recovery</span>
            </div>
            <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Agri<span style="color: #4ade80;">Link</span></h1>
            <p style="margin: 6px 0 0; color: #cbd5e1; font-size: 13px;">Security & Password Authorization Center</p>
          </td>
        </tr>

        <!-- Main Body Content -->
        <tr>
          <td style="padding: 36px 32px; color: #1e293b;">
            <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 800; color: #0f172a;">
              Password Reset Request
            </h2>
            <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #475569;">
              Hello <strong style="color: #0f172a;">${userName}</strong>,
            </p>
            <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #475569;">
              We received an authorization request to reset the password for your AgriLink account associated with <strong style="color: #0f172a;">${email}</strong>. Use the 6-digit security code below to establish a new password:
            </p>

            <!-- Reset Code Card -->
            <div style="margin: 28px 0; padding: 24px; background: #fef2f2; border: 2px dashed #ef4444; border-radius: 14px; text-align: center;">
              <span style="display: block; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #991b1b; margin-bottom: 8px;">
                Password Reset Security Code
              </span>
              <div style="font-family: 'SF Mono', Monaco, 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #b91c1c; padding: 4px 0;">
                ${code}
              </div>
              <span style="display: block; font-size: 11px; color: #dc2626; margin-top: 8px; font-weight: 600;">
                ⏱ Expires in 15 minutes
              </span>
            </div>

            <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 12px; color: #9a3412; line-height: 1.5;">
                <strong>Did not request this?</strong> If you did not ask to reset your password, someone may have entered your email address by mistake. Your account remains secure and no changes have been made.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #f1f5f9; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #475569;">
              AgriLink Agribusiness SCM Platform
            </p>
            <p style="margin: 0; font-size: 11px; color: #94a3b8;">
              Ref: PWD-${Math.random().toString(36).substring(2, 9).toUpperCase()}
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
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
        text,
        html
      });
      console.log(`✅ Password reset email SENT! Message ID: ${info.messageId}`);
      return { success: true, mode: 'GOOGLE_APP_SENT', messageId: info.messageId };
    } catch (err) {
      console.error('==========================================');
      console.error('❌ PASSWORD RESET EMAIL FAILED TO SEND:');
      console.error('Code:', err.code);
      console.error('Message:', err.message);
      console.error('Response:', err.response);
      console.error('==========================================');
    }
  } else {
    console.warn('[EMAIL] transporter is null — check GMAIL_USER and GMAIL_APP_PASSWORD env vars');
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
  const totalAmountKes = Math.round(order.grandTotal * 130).toLocaleString();
  const farmerPayout = settlement.farmerPayout.toFixed(2);
  const farmerPayoutKes = Math.round(settlement.farmerPayout * 130).toLocaleString();
  const transporterPayout = settlement.transporterPayout.toFixed(2);
  const transporterPayoutKes = Math.round(settlement.transporterPayout * 130).toLocaleString();
  const platformFee = settlement.platformFee.toFixed(2);
  const platformFeeKes = Math.round(settlement.platformFee * 130).toLocaleString();

  // 1. Text for SMS & WhatsApp
  const smsMessage = `AgriLink ESCROW DISBURSED: Order #${orderNumber} (${quantity}kg ${cropName}) delivery confirmed. Farmer received KES ${farmerPayoutKes} ($${farmerPayout}). Driver received KES ${transporterPayoutKes} ($${transporterPayout}). Delivery OTP verified.`;

  const whatsappMessage = `*AGRILINK OFFICIAL DISBURSEMENT CERTIFICATE*\n` +
    `---------------------------------------\n` +
    `*Order Number:* #${orderNumber}\n` +
    `*Status:* COMPLETED & ATOMICALLY SETTLED\n` +
    `*Produce Item:* ${quantity} kg of ${cropName}\n` +
    `*Delivery Hub:* ${order.deliveryAddress}\n` +
    `---------------------------------------\n` +
    `*Total Escrow Released:* KES ${totalAmountKes} ($${totalAmount})\n` +
    `• Farmer Settlement (${farmer?.name || 'Producer'}): KES ${farmerPayoutKes} ($${farmerPayout})\n` +
    `• Logistics Freight Fee (${transporterUser?.name || 'Driver'}): KES ${transporterPayoutKes} ($${transporterPayout})\n` +
    `• SCM Platform Fee (5%): KES ${platformFeeKes} ($${platformFee})\n` +
    `---------------------------------------\n` +
    `✓ Verified via Physical Delivery Inspection OTP.\n` +
    `✓ Funds released directly to recipient accounts.\n` +
    `Thank you for trusting AgriLink!`;

  // WhatsApp click-to-chat links
  const buyerWhatsAppLink = buyer?.phone
    ? `https://api.whatsapp.com/send?phone=${sanitizePhone(buyer.phone)}&text=${encodeURIComponent(whatsappMessage)}`
    : null;

  const farmerWhatsAppLink = farmer?.phone
    ? `https://api.whatsapp.com/send?phone=${sanitizePhone(farmer.phone)}&text=${encodeURIComponent(whatsappMessage)}`
    : null;

  // 2. HTML Email Receipt for Buyer
  const buyerHtmlReceipt = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Official Escrow Disbursement Receipt</title>
    </head>
    <body style="margin: 0; padding: 24px 12px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <tr>
          <td style="background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%); padding: 32px; text-align: center; color: #ffffff;">
            <div style="display: inline-block; padding: 6px 14px; background: rgba(52, 211, 153, 0.2); border: 1px solid #34d399; border-radius: 9999px; margin-bottom: 12px;">
              <span style="color: #6ee7b7; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">✓ Escrow Settled & Disbursed</span>
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">Official Escrow Settlement Receipt</h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8; font-family: monospace;">Order #${orderNumber}</p>
          </td>
        </tr>

        <tr>
          <td style="padding: 32px; color: #1e293b;">
            <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6;">
              Dear <strong>${buyer?.name || 'Customer'}</strong>,
            </p>
            <p style="margin: 0 0 24px; font-size: 13px; line-height: 1.6; color: #475569;">
              Physical quality inspection for Order <strong>#${orderNumber}</strong> was completed and authenticated via the driver delivery OTP. The escrow deposit has been automatically and atomically disbursed to the agricultural producer and logistics contractor.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; font-size: 13px; margin-bottom: 24px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Produce Consignment:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #0f172a;">${quantity} kg of ${cropName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Farmer Net Payout:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #059669;">KES ${farmerPayoutKes} ($${farmerPayout})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Freight Logistics Fee:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #0f172a;">KES ${transporterPayoutKes} ($${transporterPayout})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Platform SCM Fee (5%):</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 800; color: #0f172a;">KES ${platformFeeKes} ($${platformFee})</td>
              </tr>
              <tr style="border-top: 2px solid #e2e8f0;">
                <td style="padding: 14px 0 0; font-size: 15px; font-weight: 900; color: #0f172a;">Total Escrow Released:</td>
                <td style="padding: 14px 0 0; text-align: right; font-size: 16px; font-weight: 900; color: #059669;">KES ${totalAmountKes} ($${totalAmount})</td>
              </tr>
            </table>

            <div style="background-color: #f1f5f9; padding: 14px 18px; border-radius: 8px; font-size: 12px; color: #475569;">
              <p style="margin: 0 0 4px;"><strong>Destination:</strong> ${order.deliveryAddress}</p>
              <p style="margin: 0;"><strong>Payment Mechanism:</strong> Safaricom Daraja M-Pesa Escrow</p>
            </div>
          </td>
        </tr>

        <tr>
          <td style="background-color: #f1f5f9; padding: 18px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            AgriLink Escrow Engine • Safaricom B2C Certified • Ref: ESC-${order.id.substring(0, 8).toUpperCase()}
          </td>
        </tr>
      </table>
    </body>
    </html>
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
