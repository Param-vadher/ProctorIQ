import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'teacher' | 'student';
  phone?: string;
  profilePicture?: string;
  isDeleted: boolean;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
  phone: { type: String },
  profilePicture: { type: String, default: '' },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.index({ role: 1, isDeleted: 1 });
// Exclude deleted users from find queries by default
userSchema.pre(/^find/, function() {
  (this as any).where({ isDeleted: { $ne: true } });
});

export default mongoose.model<IUser>('User', userSchema);
