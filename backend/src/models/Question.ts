import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  subjectId: mongoose.Types.ObjectId;
  subtopic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  marks: number;
}

const questionSchema = new Schema<IQuestion>({
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  subtopic: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }], // Array of 4 options
  correctOptionIndex: { type: Number, required: true }, // 0 to 3
  explanation: { type: String, default: '' },
  marks: { type: Number, default: 1 }
});

export default mongoose.model<IQuestion>('Question', questionSchema);
