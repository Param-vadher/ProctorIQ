import mongoose, { Schema, Document } from 'mongoose';

export interface IExam extends Document {
  title: string;
  subjectId: mongoose.Types.ObjectId;
  duration: number; // in minutes
  totalMarks: number;
  passingMarks: number;
  windowStart: Date;
  windowEnd: Date;
  proctoringEnabled: boolean;
  dynamicConfig: {
    enabled: boolean;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
  };
  manualQuestions: mongoose.Types.ObjectId[];
  assignedStudents: mongoose.Types.ObjectId[];
  isActive: boolean;
  isDeleted: boolean;
}

const examSchema = new Schema<IExam>({
  title: { type: String, required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  duration: { type: Number, required: true }, // in minutes
  totalMarks: { type: Number, required: true },
  passingMarks: { type: Number, required: true },
  windowStart: { type: Date, required: true },
  windowEnd: { type: Date, required: true },
  proctoringEnabled: { type: Boolean, default: true },
  dynamicConfig: {
    enabled: { type: Boolean, default: false },
    easyCount: { type: Number, default: 0 },
    mediumCount: { type: Number, default: 0 },
    hardCount: { type: Number, default: 0 },
  },
  manualQuestions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  assignedStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
});

examSchema.pre(/^find/, function() {
  (this as any).where({ isDeleted: { $ne: true } });
});

export default mongoose.model<IExam>('Exam', examSchema);
