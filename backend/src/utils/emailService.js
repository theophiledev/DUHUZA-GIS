/**
 * Email Service
 * Handles transactional emails (password reset, moderation notifications, receipts).
 * Integrates with Gmail SMTP / standard SMTP transport with elegant HTML templates.
 */

const nodemailer = require('nodemailer');

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const isSecure = process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === 'true' : port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user: user.trim(),
      pass: pass.replace(/\s+/g, ''), // strip any inadvertent spaces from app passwords
    },
    // Useful defaults for reliability
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  return cachedTransporter;
}

/**
 * Diagnostic helper to verify SMTP credentials and connectivity
 */
async function verifySmtpConnection() {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[EmailService] SMTP credentials not configured in environment variables.');
    return { success: false, message: 'SMTP credentials missing' };
  }

  try {
    await transporter.verify();
    console.log(`[EmailService] ✓ SMTP connection successfully verified for user: ${process.env.SMTP_USER}`);
    return { success: true, message: 'SMTP ready' };
  } catch (err) {
    console.error('[EmailService] ✗ SMTP connection failed:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Dispatches 6-digit verification code email for password reset
 */
async function sendPasswordResetEmail({ to, name, resetCode, resetLink }) {
  const recipient = to ? to.trim() : '';
  if (!recipient) return false;

  const subject = `${resetCode} is your Duhuza password reset code`;
  const formattedName = name ? name.trim() : 'Valued User';

  const textBody = `Hello ${formattedName},\n\nYou requested to reset your password on Duhuza.\nYour 6-digit verification code is: ${resetCode}\n\nThis verification code expires in 15 minutes.\nIf you did not request this, please disregard this email.\n\n— The Duhuza Team`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Duhuza Password Reset</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed; background-color:#f1f5f9; padding: 40px 15px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
              
              <!-- Brand Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0F766E 0%, #0d9488 100%); padding: 32px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">DUHUZA</h1>
                  <p style="color: #ccfbf1; margin: 6px 0 0 0; font-size: 13px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">Rwanda Multi-Vertical Platform</p>
                </td>
              </tr>

              <!-- Content Body -->
              <tr>
                <td style="padding: 36px 32px 28px 32px;">
                  <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 14px 0;">Password Reset Verification</h2>
                  <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                    Hello <strong style="color: #0f172a;">${formattedName}</strong>,<br>
                    We received a request to reset your password for your Duhuza account. Use the 6-digit code below to securely verify your identity:
                  </p>

                  <!-- 6-digit Code Badge -->
                  <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; background-color: #f0fdfa; border: 2px dashed #0F766E; border-radius: 12px; padding: 16px 36px;">
                      <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0F766E;">${resetCode}</span>
                    </div>
                  </div>

                  <p style="color: #64748b; font-size: 13px; text-align: center; margin: 0 0 24px 0;">
                    ⏱️ This verification code is valid for <strong>15 minutes</strong>.
                  </p>

                  <div style="background-color: #f8fafc; border-left: 4px solid #0F766E; border-radius: 6px; padding: 14px 16px; margin-bottom: 24px;">
                    <p style="color: #334155; font-size: 13px; margin: 0; line-height: 1.5;">
                      <strong>Security Tip:</strong> Never share this code with anyone. Duhuza support staff will never ask you for your verification code.
                    </p>
                  </div>

                  <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                    If you did not request this password reset, your account is safe and you can safely ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 30px; text-align: center;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} Duhuza Platform · Kigali, Rwanda<br>
                    Need assistance? Contact us at support@duhuza.rw
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"Duhuza Platform" <${process.env.SMTP_USER}>`,
        to: recipient,
        subject,
        text: textBody,
        html: htmlBody,
      });
      console.log(`[EmailService] ✓ Password reset OTP sent to ${recipient}`);
      return true;
    } catch (err) {
      console.error(`[EmailService] ✗ Failed to send reset email to ${recipient}:`, err.message);
      return false;
    }
  } else {
    console.log(`[EmailService] [Dev Fallback] Reset code [${resetCode}] for ${recipient}`);
    return true;
  }
}

/**
 * Dispatches moderation status notification (Approved, Published, Rejected) to submitter
 */
async function sendStatusUpdateEmail({ to, name, itemType, itemTitle, newStatus, comment }) {
  const recipient = to ? to.trim() : '';
  if (!recipient) return false;

  const isApproved = newStatus === 'PUBLISHED' || newStatus === 'APPROVED';
  const isRejected = newStatus === 'REJECTED';
  const statusLabel = isApproved ? 'Approved & Published' : isRejected ? 'Requires Revision' : newStatus;

  const subject = `Update on your ${itemType}: "${itemTitle}" (${statusLabel})`;
  const formattedName = name ? name.trim() : 'Valued User';

  const statusColor = isApproved ? '#0F766E' : isRejected ? '#dc2626' : '#2563eb';
  const statusBg = isApproved ? '#f0fdfa' : isRejected ? '#fef2f2' : '#eff6ff';

  const textBody = `Hello ${formattedName},\n\nYour ${itemType} "${itemTitle}" has been reviewed by the Duhuza moderation team.\nStatus: ${statusLabel}\n${comment ? `Feedback from Manager: ${comment}\n` : ''}\nLog in to your Duhuza dashboard to view your item.\n\n— The Duhuza Moderation Team`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Duhuza Status Update</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed; background-color:#f1f5f9; padding: 40px 15px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
              
              <!-- Brand Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0F766E 0%, #0d9488 100%); padding: 28px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800;">DUHUZA</h1>
                  <p style="color: #ccfbf1; margin: 4px 0 0 0; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Moderation Notification</p>
                </td>
              </tr>

              <!-- Content Body -->
              <tr>
                <td style="padding: 32px 30px 24px 30px;">
                  <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
                    Hello <strong style="color: #0f172a;">${formattedName}</strong>,
                  </p>
                  <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                    Your recent submission on Duhuza has been reviewed by our moderation team.
                  </p>

                  <!-- Status Card -->
                  <div style="background-color: ${statusBg}; border: 1px solid ${statusColor}33; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <span style="display: inline-block; background-color: ${statusColor}; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 6px;">${itemType}</span>
                          <span style="display: inline-block; margin-left: 6px; color: ${statusColor}; font-weight: 700; font-size: 13px;">• ${statusLabel}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #0f172a; font-size: 17px; font-weight: 700; padding-bottom: 8px;">
                          ${itemTitle}
                        </td>
                      </tr>
                      ${
                        comment
                          ? `
                      <tr>
                        <td style="padding-top: 10px; border-top: 1px dashed #cbd5e1; color: #334155; font-size: 14px; line-height: 1.5;">
                          <strong>Manager Feedback:</strong><br>
                          <span style="font-style: italic; color: #1e293b;">&ldquo;${comment}&rdquo;</span>
                        </td>
                      </tr>
                      `
                          : ''
                      }
                    </table>
                  </div>

                  ${
                    isRejected
                      ? `
                  <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
                    You can update the item details according to the manager's feedback and resubmit it at any time from your account dashboard.
                  </p>
                  `
                      : `
                  <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
                    Your item is now live and visible to all clients and visitors on the Duhuza platform.
                  </p>
                  `
                  }

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; text-align: center;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} Duhuza Platform · Kigali, Rwanda
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"Duhuza Platform" <${process.env.SMTP_USER}>`,
        to: recipient,
        subject,
        text: textBody,
        html: htmlBody,
      });
      console.log(`[EmailService] ✓ Status update notification sent to ${recipient} (${statusLabel})`);
      return true;
    } catch (err) {
      console.error(`[EmailService] ✗ Failed to send status email to ${recipient}:`, err.message);
      return false;
    }
  }

  return true;
}

/**
 * Dispatches confirmation that a submission was received and is in triage
 */
async function sendSubmissionReceivedEmail({ to, name, itemType, itemTitle }) {
  const recipient = to ? to.trim() : '';
  if (!recipient) return false;

  const subject = `Received: Your ${itemType} "${itemTitle}" is under review`;
  const formattedName = name ? name.trim() : 'Valued User';

  const textBody = `Hello ${formattedName},\n\nThank you for submitting your ${itemType} "${itemTitle}" on Duhuza.\nOur moderation team is reviewing the details to ensure all information and photos meet platform quality standards. You will receive an email as soon as the review is complete.\n\n— The Duhuza Team`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Duhuza Submission Confirmation</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed; background-color:#f1f5f9; padding: 40px 15px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
              
              <!-- Brand Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0F766E 0%, #0d9488 100%); padding: 28px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800;">DUHUZA</h1>
                  <p style="color: #ccfbf1; margin: 4px 0 0 0; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Submission Confirmation</p>
                </td>
              </tr>

              <!-- Content Body -->
              <tr>
                <td style="padding: 32px 30px 24px 30px;">
                  <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
                    Hello <strong style="color: #0f172a;">${formattedName}</strong>,
                  </p>
                  <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                    We have successfully received your submission for <strong>${itemTitle}</strong> (${itemType}).
                  </p>

                  <div style="background-color: #f8fafc; border-left: 4px solid #0F766E; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
                    <p style="color: #334155; font-size: 14px; margin: 0; line-height: 1.5;">
                      🔍 <strong>What happens next:</strong> Our moderation team checks all media, location accuracy, and pricing details. Once verified, your submission will be published live across the network.
                    </p>
                  </div>

                  <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0;">
                    You will receive an update as soon as the review is complete.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; text-align: center;">
                  <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} Duhuza Platform · Kigali, Rwanda
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"Duhuza Platform" <${process.env.SMTP_USER}>`,
        to: recipient,
        subject,
        text: textBody,
        html: htmlBody,
      });
      console.log(`[EmailService] ✓ Submission receipt sent to ${recipient}`);
      return true;
    } catch (err) {
      console.error(`[EmailService] ✗ Failed to send submission receipt to ${recipient}:`, err.message);
      return false;
    }
  }

  return true;
}

module.exports = {
  verifySmtpConnection,
  sendPasswordResetEmail,
  sendStatusUpdateEmail,
  sendSubmissionReceivedEmail,
};
