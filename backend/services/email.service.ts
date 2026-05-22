import nodemailer from "nodemailer";
import { env } from "../utils/env";

const transporter = nodemailer.createTransport({
  host: env.MAILTRAP_HOST,
  port: env.MAILTRAP_PORT,
  auth: {
    user: env.MAILTRAP_USER,
    pass: env.MAILTRAP_PASS,
  },
});

const buildPasswordResetEmailHtml = (otp: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0f172a;">
      <h2 style="margin: 0 0 16px;">Password Reset Code</h2>
      <p style="margin: 0 0 12px;">Use the code below to reset your password:</p>
      <div style="margin: 20px 0; padding: 16px; text-align: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px;">${otp}</span>
      </div>
      <p style="margin: 0 0 10px;">This code expires in 15 minutes.</p>
      <p style="margin: 0; color: #475569;">If you did not request this, you can safely ignore this email.</p>
    </div>
  `;
};

export const sendPasswordResetOtpEmail = async (
  recipientEmail: string,
  otp: string,
) => {
  await transporter.sendMail({
    from: '"Charity Management System" <no-reply@charity-management.local>',
    to: recipientEmail,
    subject: "Password Reset Code",
    html: buildPasswordResetEmailHtml(otp),
  });
};

const buildPasswordResetSuccessEmailHtml = () => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0f172a;">
      <h2 style="margin: 0 0 16px;">Password Reset Successful</h2>
      <p style="margin: 0 0 10px;">
        Your account password was changed successfully.
      </p>
      <p style="margin: 0 0 10px;">
        If you made this change, no further action is needed.
      </p>
      <p style="margin: 0; color: #475569;">
        If you did not reset your password, secure your account immediately.
      </p>
    </div>
  `;
};

export const sendPasswordResetSuccessEmail = async (recipientEmail: string) => {
  await transporter.sendMail({
    from: '"Charity Management System" <no-reply@charity-management.local>',
    to: recipientEmail,
    subject: "Password Reset Successful",
    html: buildPasswordResetSuccessEmailHtml(),
  });
};
