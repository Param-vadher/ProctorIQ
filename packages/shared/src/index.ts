export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  profilePicture?: string;
}
