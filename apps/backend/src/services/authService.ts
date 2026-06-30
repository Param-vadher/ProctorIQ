import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { config } from '../config';

export class AuthService {
  static async registerUser(data: any) {
    const { name, email, password, profilePicture } = data;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'student',
      profilePicture: profilePicture || ''
    });
    await newUser.save();
    return newUser;
  }

  static async loginUser(data: any) {
    const { email, password } = data;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, config.jwtSecret, { expiresIn: '1d' });
    return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
  }

  static async getProfile(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }

  static async updateProfile(userId: string, data: any) {
    const user = await User.findByIdAndUpdate(userId, data, { new: true }).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }

  static async changePassword(userId: string, data: any) {
    const { currentPassword, newPassword } = data;
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    const isMatch = await bcrypt.compare(currentPassword, user.password!);
    if (!isMatch) throw new Error('Incorrect current password');
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
  }
}
