import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  code: string;
  description?: string;
}

const subjectSchema = new Schema<ISubject>({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  description: { type: String }
});

export default mongoose.model<ISubject>('Subject', subjectSchema);
