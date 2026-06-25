import mongoose, { Schema, Document } from 'mongoose';

export interface IInquiry extends Document {
  userId?: mongoose.Types.ObjectId;
  recipientRole?: 'admin' | 'teacher' | 'student';
  recipientId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  message: string;
  status: 'pending' | 'replied';
  adminReply?: string;
  createdAt: Date;
  repliedAt?: Date;
}

const inquirySchema = new Schema<IInquiry>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  recipientRole: { type: String, enum: ['admin', 'teacher', 'student'], default: 'admin' },
  recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'replied'], default: 'pending' },
  adminReply: { type: String },
  createdAt: { type: Date, default: Date.now },
  repliedAt: { type: Date }
});

export default mongoose.model<IInquiry>('Inquiry', inquirySchema);
