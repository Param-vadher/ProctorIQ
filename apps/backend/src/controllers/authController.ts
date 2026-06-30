import { Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthService } from '../services/authService';

export const register = async (req: Request, res: Response) => {
  try {
    await AuthService.registerUser(req.body);
    return ApiResponse.success(res, 'User registered successfully', undefined, 201);
  } catch (error: any) {
    if (error.message === 'User already exists') {
      return ApiResponse.error(res, error.message, 400);
    }
    return ApiResponse.error(res, 'Server error during registration', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const data = await AuthService.loginUser(req.body);
    
    res.cookie('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return ApiResponse.success(res, 'Login successful', data);
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      return ApiResponse.error(res, error.message, 400);
    }
    return ApiResponse.error(res, 'Server error', 500);
  }
};

export const logout = async (req: Request, res: Response) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0)
  });
  return ApiResponse.success(res, 'Logged out successfully');
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await AuthService.getProfile(req.user?.userId!);
    return ApiResponse.success(res, 'Profile retrieved', user);
  } catch (error: any) {
    if (error.message === 'User not found') return ApiResponse.error(res, error.message, 404);
    return ApiResponse.error(res, 'Server error', 500);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = await AuthService.updateProfile(req.user?.userId!, req.body);
    return ApiResponse.success(res, 'Profile updated', user);
  } catch (error: any) {
    if (error.message === 'User not found') return ApiResponse.error(res, error.message, 404);
    return ApiResponse.error(res, 'Server error', 500);
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    await AuthService.changePassword(req.user?.userId!, req.body);
    return ApiResponse.success(res, 'Password changed successfully');
  } catch (error: any) {
    if (error.message === 'User not found') return ApiResponse.error(res, error.message, 404);
    if (error.message === 'Incorrect current password') return ApiResponse.error(res, error.message, 400);
    return ApiResponse.error(res, 'Server error during password change', 500);
  }
};
