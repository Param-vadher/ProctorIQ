import { Request, Response } from 'express';
import Message from '../models/Message';
import User from '../models/User';

export const getContacts = async (req: Request, res: Response) => {
  try {
    const role = req.user?.role;
    let query = {};
    if (role === 'student') {
      query = { role: { $in: ['admin', 'teacher'] } };
    } else if (role === 'teacher') {
      query = { role: { $in: ['admin', 'student'] } };
    } else if (role === 'admin') {
      query = { role: { $in: ['teacher', 'student'] } };
    }
    
    const contacts = await User.find(query).select('name email role profilePicture');
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId1 = req.user?.userId;
    const userId2 = req.params.userId;
    
    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 }
      ]
    }).sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user?.userId;
    
    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver and content are required' });
    }
    
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content
    });
    
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
};
