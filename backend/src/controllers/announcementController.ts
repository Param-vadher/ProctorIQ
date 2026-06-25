import { Request, Response } from 'express';
import Announcement from '../models/Announcement';

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const { title, message, type } = req.body;
    const role = req.user?.role;
    
    if (type === 'global' && role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create global announcements' });
    }
    if (type === 'exam' && role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create exam announcements' });
    }
    
    const announcement = new Announcement({
      title,
      message,
      type,
      createdBy: req.user?.userId
    });
    
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Error creating announcement' });
  }
};

export const getUnreadAnnouncements = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    
    let query: any = {
      readBy: { $ne: userId }
    };
    
    if (role === 'student') {
      // Students see both global and exam announcements
      query.type = { $in: ['global', 'exam'] };
    } else {
      // Teachers and admins only see global announcements aimed at them
      query.type = 'global';
    }
    
    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    await Announcement.findByIdAndUpdate(id, {
      $addToSet: { readBy: userId }
    });
    
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking announcement as read' });
  }
};

export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    // For admin/teacher to see what they have sent
    const announcements = await Announcement.find({ createdBy: req.user?.userId }).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements' });
  }
};
