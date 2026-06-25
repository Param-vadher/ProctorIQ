import mongoose, { Schema, Document } from 'mongoose';

export interface IActiveExamSession extends Document {
  studentId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  status: 'in-progress' | 'submitted' | 'terminated';
  answers: {
    questionId: mongoose.Types.ObjectId;
    selectedOptionIndex: number;
  }[];
  visitedQuestions: mongoose.Types.ObjectId[];
  flaggedQuestions: mongoose.Types.ObjectId[];
  warnings: number;
  startTime: Date;
  lastSyncTime: Date;
  generatedQuestions: mongoose.Types.ObjectId[]; // The pool of questions generated for this specific session
  identityPhoto?: string;
}

const activeExamSessionSchema = new Schema<IActiveExamSession>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  status: { type: String, enum: ['in-progress', 'submitted', 'terminated'], default: 'in-progress' },
  answers: [{
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedOptionIndex: { type: Number, required: true }
  }],
  visitedQuestions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  flaggedQuestions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  warnings: { type: Number, default: 0 },
  startTime: { type: Date, default: Date.now },
  lastSyncTime: { type: Date, default: Date.now },
  generatedQuestions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  identityPhoto: { type: String }
});

export default mongoose.model<IActiveExamSession>('ActiveExamSession', activeExamSessionSchema);
