import nodemailer from "nodemailer";
import { env } from "../utils/env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL,
    pass: env.EMAIL_APP_PASSWORD,
  },
});

const APP_NAME = "Charity Management System";

const buildEmailLayout = (options: {
  title: string;
  subtitle: string;
  bodyHtml: string;
}) => {
  const { title, subtitle, bodyHtml } = options;

  return `
    <div style="margin:0; padding:24px 12px; background:#f2f8ff; font-family:Arial,Helvetica,sans-serif; color:#0f172a;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #dce8f4; border-radius:16px; overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg, #0b2b53 0%, #0f3c73 100%); padding:20px 24px; color:#ffffff;">
            <p style="margin:0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; opacity:0.9;">${APP_NAME}</p>
            <h1 style="margin:8px 0 0; font-size:22px; line-height:1.3;">${title}</h1>
            <p style="margin:8px 0 0; font-size:14px; color:#dbeafe;">${subtitle}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px 22px; border-top:1px solid #e2e8f0; color:#64748b; font-size:12px;">
            This is an automated message from ${APP_NAME}. Please do not reply.
          </td>
        </tr>
      </table>
    </div>
  `;
};

const buildPasswordResetEmailHtml = (otp: string) => {
  return buildEmailLayout({
    title: "Password Reset Code",
    subtitle: "Use this one-time code to reset your password.",
    bodyHtml: `
      <p style="margin:0 0 12px; font-size:14px; color:#334155;">Use the code below to reset your password:</p>
      <div style="margin:18px 0; padding:14px 16px; text-align:center; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:12px;">
        <span style="font-size:30px; font-weight:700; letter-spacing:6px; color:#0b2b53;">${otp}</span>
      </div>
      <p style="margin:0 0 8px; font-size:13px; color:#475569;">This code expires in <strong>15 minutes</strong>.</p>
      <p style="margin:0; font-size:13px; color:#64748b;">If you did not request this, you can safely ignore this email.</p>
    `,
  });
};

export const sendPasswordResetOtpEmail = async (
  recipientEmail: string,
  otp: string,
) => {
  await transporter.sendMail({
    from: `"Charity Management System" <${env.EMAIL}>`,
    to: recipientEmail,
    subject: "Password Reset Code",
    html: buildPasswordResetEmailHtml(otp),
  });
};

const buildPasswordResetSuccessEmailHtml = () => {
  return buildEmailLayout({
    title: "Password Reset Successful",
    subtitle: "Your account password was changed successfully.",
    bodyHtml: `
      <p style="margin:0 0 10px; font-size:14px; color:#334155;">Your account password was changed successfully.</p>
      <p style="margin:0 0 10px; font-size:14px; color:#334155;">If you made this change, no further action is needed.</p>
      <div style="margin:16px 0 0; padding:12px 14px; border-left:3px solid #0b2b53; background:#f8fafc; border-radius:8px;">
        <p style="margin:0; font-size:13px; color:#475569;">If you did not reset your password, secure your account immediately.</p>
      </div>
    `,
  });
};

export const sendPasswordResetSuccessEmail = async (recipientEmail: string) => {
  await transporter.sendMail({
    from: `"Charity Management System" <${env.EMAIL}>`,
    to: recipientEmail,
    subject: "Password Reset Successful",
    html: buildPasswordResetSuccessEmailHtml(),
  });
};
