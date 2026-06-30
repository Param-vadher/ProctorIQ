import { Request, Response } from 'express';
import Inquiry from '../models/Inquiry';
import User from '../models/User';
import { sendEmail } from '../services/emailService';

// ========================
// PUBLIC: Submit Inquiry
// ========================
export const submitInquiry = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newInquiry = new Inquiry({ name, email, message });
    await newInquiry.save();

    // Send confirmation email to user
    const userHtml = `
      <h3>Inquiry Received</h3>
      <p>Hi ${name},</p>
      <p>Thank you for reaching out! We have received your message and our team will get back to you shortly.</p>
      <p><strong>Your Message:</strong><br/>${message}</p>
      <hr/>
      <p>ProctorIQ Support Team</p>
    `;
    await sendEmail(email, 'ProctorIQ - We received your inquiry', userHtml);

    res.status(201).json({ message: 'Inquiry submitted successfully' });
  } catch (error) {
    console.error('Submit Inquiry Error:', error);
    res.status(500).json({ message: 'Server error while submitting inquiry' });
  }
};

// ========================
// ADMIN: Manage Inquiries
// ========================
export const getInquiries = async (req: Request, res: Response) => {
  try {
    const inquiries = await Inquiry.find({ recipientRole: 'admin' }).sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching inquiries' });
  }
};

export const replyToInquiry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    inquiry.adminReply = replyMessage;
    inquiry.status = 'replied';
    inquiry.repliedAt = new Date();
    await inquiry.save();

    // Send reply email to user
    const replyHtml = `
      <h3>Response to your Inquiry</h3>
      <p>Hi ${inquiry.name},</p>
      <p>Our team has reviewed your inquiry. Here is the response:</p>
      <p style="padding: 10px; border-left: 4px solid #4f46e5; background: #f9fafb;">${replyMessage.replace(/\n/g, '<br/>')}</p>
      <br/>
      <p><strong>Your Original Message:</strong><br/>${inquiry.message}</p>
      <hr/>
      <p>ProctorIQ Support Team</p>
    `;
    await sendEmail(inquiry.email, 'ProctorIQ - Response to your Inquiry', replyHtml);

    res.json({ message: 'Reply sent successfully', inquiry });
  } catch (error) {
    console.error('Reply Inquiry Error:', error);
    res.status(500).json({ message: 'Server error while replying to inquiry' });
  }
};

// ========================
// AUTH USER: Manage Own Inquiries
// ========================
export const submitAuthInquiry = async (req: Request, res: Response) => {
  try {
    const { message, recipientRole, recipientId } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });
    
    const user = await User.findById(req.user?.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newInquiry = new Inquiry({ 
      userId: req.user?.userId,
      recipientRole: recipientRole || 'admin',
      recipientId: recipientId || undefined,
      name: user.name, 
      email: user.email,
      message 
    });
    
    await newInquiry.save();
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Submit Auth Inquiry Error:', error);
    res.status(500).json({ message: 'Server error while submitting message' });
  }
};

export const getAuthInquiries = async (req: Request, res: Response) => {
  try {
    // Return messages sent BY this user
    const sentInquiries = await Inquiry.find({ userId: req.user?.userId }).sort({ createdAt: -1 });
    res.json(sentInquiries);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

export const getReceivedInquiries = async (req: Request, res: Response) => {
  try {
    let receivedInquiries;
    if (req.user?.role === 'teacher') {
      // Teachers see messages sent to "teacher"
      receivedInquiries = await Inquiry.find({ recipientRole: 'teacher' }).sort({ createdAt: -1 });
    } else if (req.user?.role === 'student') {
      // Students see messages sent directly to their user ID
      receivedInquiries = await Inquiry.find({ recipientId: req.user.userId, recipientRole: 'student' }).sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    res.json(receivedInquiries);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching received messages' });
  }
};
