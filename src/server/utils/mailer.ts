// src/server/utils/mailer.ts
// WORKZEN Enterprise Email Delivery System
// Supports branded responsive HTML templates with plain-text alternatives

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  // In development and staging, log the outgoing email for rapid inspection and verification
  console.log(`\n============================================================`);
  console.log(`[WORKZEN Mailer] Outgoing Email`);
  console.log(`To:      ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`------------------------------------------------------------`);
  console.log(options.text || options.html);
  console.log(`============================================================\n`);

  return true;
};

const getEmailWrapper = (title: string, bodyContent: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
              <!-- Header -->
              <tr>
                <td style="background-color: #0f172a; padding: 28px 32px; text-align: left;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width: 32px; height: 32px; background-color: #4f46e5; border-radius: 8px; text-align: center; vertical-align: middle; color: #ffffff; font-weight: bold; font-size: 18px;">W</td>
                      <td style="padding-left: 12px; color: #ffffff; font-weight: bold; font-size: 18px; letter-spacing: -0.5px;">WORKZEN</td>
                    </tr>
                  </table>
                  <div style="color: #94a3b8; font-size: 12px; margin-top: 6px;">Plan Smarter. Work Together. Achieve More.</div>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 36px 32px; color: #334155; font-size: 15px; line-height: 1.6;">
                  ${bodyContent}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f1f5f9; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px; line-height: 1.5;">
                  &copy; 2026 WORKZEN Enterprise SaaS. All rights reserved.<br>
                  This is a mandatory security communication. If you did not initiate this request, contact <a href="mailto:security@workzen.io" style="color: #4f46e5; text-decoration: none;">security@workzen.io</a> immediately.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export const sendVerificationEmail = async (
  email: string,
  name: string,
  token: string,
  otp: string
): Promise<boolean> => {
  const subject = `[WORKZEN] Verify your email address (Security Code: ${otp})`;
  const verificationUrl = `http://localhost:3070/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  const htmlContent = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700;">Welcome to WORKZEN, ${name}!</h2>
    <p>Thank you for creating an account. To protect your organization data and activate your enterprise workspaces, please confirm your email address.</p>
    
    <div style="background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
      <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #4338ca; margin-bottom: 8px;">Your 6-Digit Security Code</div>
      <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #312e81;">${otp}</div>
      <div style="font-size: 12px; color: #6366f1; margin-top: 6px;">Expires in 15 minutes</div>
    </div>

    <p style="text-align: center; margin: 28px 0 20px 0;">
      <a href="${verificationUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">Verify Account Now &rarr;</a>
    </p>

    <p style="font-size: 13px; color: #64748b;">Or paste this link into your browser:<br><span style="word-break: break-all; color: #4f46e5;">${verificationUrl}</span></p>
  `;

  const textContent = `Welcome to WORKZEN, ${name}!\n\nYour 6-digit email verification code is: ${otp}\n(Valid for 15 minutes)\n\nOr verify directly by clicking: ${verificationUrl}\n\nPlan Smarter. Work Together. Achieve More.`;

  return sendEmail({
    to: email,
    subject,
    html: getEmailWrapper('Verify Your Email Address', htmlContent),
    text: textContent
  });
};

export const sendOTPEmail = async (email: string, otp: string, purpose: string): Promise<boolean> => {
  const subject = `[WORKZEN] Your Security Passcode: ${otp}`;

  const htmlContent = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700;">Security Passcode Required</h2>
    <p>You requested a one-time passcode (OTP) for: <strong>${purpose}</strong>.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
      <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f172a;">${otp}</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 6px;">Valid for 15 minutes &bull; Maximum 3 attempts</div>
    </div>

    <p style="font-size: 13px; color: #64748b;">Never share this security code with anyone. Workzen support personnel will never ask for your OTP.</p>
  `;

  const textContent = `WORKZEN Security Code: ${otp}\nPurpose: ${purpose}\nValid for 15 minutes. Never share this code.`;

  return sendEmail({
    to: email,
    subject,
    html: getEmailWrapper('Security Passcode', htmlContent),
    text: textContent
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  token: string,
  otp: string
): Promise<boolean> => {
  const subject = `[WORKZEN] Password Reset Request (Code: ${otp})`;
  const resetUrl = `http://localhost:3070/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  const htmlContent = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700;">Password Reset Instructions</h2>
    <p>Hello ${name},</p>
    <p>We received a request to reset the password for your Workzen account. You can enter the security code below or click the reset link to choose a new password.</p>
    
    <div style="background-color: #fffbe6; border: 1px solid #ffe58f; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
      <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #d48806; margin-bottom: 8px;">Reset Verification Code</div>
      <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ad6800;">${otp}</div>
      <div style="font-size: 12px; color: #d48806; margin-top: 6px;">Expires in 15 minutes &bull; Single-use token</div>
    </div>

    <p style="text-align: center; margin: 28px 0 20px 0;">
      <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">Reset Password &rarr;</a>
    </p>

    <p style="font-size: 13px; color: #64748b;">If you did not request a password reset, you can safely ignore this email. Your existing password remains active.</p>
  `;

  const textContent = `WORKZEN: Password Reset Code for ${email} is ${otp}.\nReset link: ${resetUrl}\nExpires in 15 minutes.`;

  return sendEmail({
    to: email,
    subject,
    html: getEmailWrapper('Reset Your Password', htmlContent),
    text: textContent
  });
};

export const sendPasswordChangedConfirmationEmail = async (
  email: string,
  name: string
): Promise<boolean> => {
  const subject = `[WORKZEN] Security Alert: Your password was changed`;

  const htmlContent = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700;">Password Changed Successfully</h2>
    <p>Hello ${name},</p>
    <p>This is confirmation that the password for your Workzen account was successfully changed at ${new Date().toUTCString()}.</p>
    <p>For your security, all other active sessions and refresh tokens on your account have been revoked.</p>
    <p style="color: #dc2626; font-size: 13px; font-weight: 600;">If you did NOT make this change, please contact our security team immediately at security@workzen.io.</p>
  `;

  const textContent = `WORKZEN: Your password was changed at ${new Date().toUTCString()}. If you did not make this change, contact security@workzen.io.`;

  return sendEmail({
    to: email,
    subject,
    html: getEmailWrapper('Password Changed Confirmation', htmlContent),
    text: textContent
  });
};

export const sendInvitationEmail = async (params: {
  email: string;
  inviterName: string;
  orgName: string;
  roleName: string;
  inviteUrl: string;
  expiresAt: Date;
}): Promise<boolean> => {
  const { email, inviterName, orgName, roleName, inviteUrl, expiresAt } = params;
  const subject = `[WORKZEN] Invitation to join ${orgName} on WORKZEN`;

  const htmlContent = `
    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700;">You've Been Invited to Join ${orgName}</h2>
    <p>Hello,</p>
    <p><strong>${inviterName}</strong> has invited you to join the <strong>${orgName}</strong> organization on WORKZEN as <strong>${roleName}</strong>.</p>
    <p>WORKZEN is an enterprise project management and team collaboration platform where teams plan smarter, work together, and achieve more.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <div style="font-size: 13px; color: #64748b; margin-bottom: 6px;"><strong>Invited By:</strong> ${inviterName}</div>
      <div style="font-size: 13px; color: #64748b; margin-bottom: 6px;"><strong>Assigned Role:</strong> ${roleName}</div>
      <div style="font-size: 13px; color: #64748b;"><strong>Invitation Expiration:</strong> ${expiresAt.toLocaleDateString()} (in 7 days)</div>
    </div>

    <p style="text-align: center; margin: 28px 0 20px 0;">
      <a href="${inviteUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">Accept Invitation & Join &rarr;</a>
    </p>

    <p style="font-size: 13px; color: #64748b;">Or paste this link into your browser:<br><span style="word-break: break-all; color: #4f46e5;">${inviteUrl}</span></p>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">If you were not expecting this invitation, you can safely ignore this email.</p>
  `;

  const textContent = `You have been invited to join ${orgName} on WORKZEN as ${roleName} by ${inviterName}.\n\nAccept your invitation at: ${inviteUrl}\n(Expires in 7 days on ${expiresAt.toLocaleDateString()})\n\nPlan Smarter. Work Together. Achieve More.`;

  return sendEmail({
    to: email,
    subject,
    html: getEmailWrapper('Team Invitation', htmlContent),
    text: textContent
  });
};
