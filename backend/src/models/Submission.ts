import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  studentId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  answers: { questionId: mongoose.Types.ObjectId, selectedOptionIndex: number }[];
  score: number;
  isPassed: boolean;
  warnings: number;
  submittedAt: Date;
  identityPhoto?: string;
}

const submissionSchema = new Schema<ISubmission>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'ActiveExamSession', required: true },
  answers: [{
    questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
    selectedOptionIndex: { type: Number }
  }],
  score: { type: Number, required: true },
  isPassed: { type: Boolean, required: true },
  warnings: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
  identityPhoto: { type: String }
});

export default mongoose.model<ISubmission>('Submission', submissionSchema);

