import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Standard Nodemailer configuration
// For development or production, provide SMTP details in .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ SMTP_USER and SMTP_PASS are not set. Emails will not actually be sent.');
      console.log(`[Mock Email to: ${to}]\nSubject: ${subject}\nBody: ${html}`);
      return;
    }
    
    await transporter.sendMail({
      from: `"ProctorIQ Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
