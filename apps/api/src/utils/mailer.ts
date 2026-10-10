import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { AppError } from './errors';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    console.log(`[SMTP] Attempting to send email via ${config.smtp.host}:${config.smtp.port}`);
    await transporter.sendMail({
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to,
      subject,
      html,
    });
    console.log(`[SMTP] Successfully sent email to ${to}`);
  } catch (error: any) {
    console.error(`[SMTP ERROR] Failed to send email via ${config.smtp.host}:${config.smtp.port}. Code: ${error?.code || 'UNKNOWN'}`);
    throw new AppError(500, 'Failed to send email. Please check SMTP configuration.');
  }
};
