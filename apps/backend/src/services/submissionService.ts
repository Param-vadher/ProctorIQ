import mongoose from 'mongoose';
import Submission from '../models/Submission';
import ActiveExamSession from '../models/ActiveExamSession';

export class SubmissionService {
  static async submitExam(studentId: string, examId: string, sessionId: string, answers: any[], score: number, isPassed: boolean, warnings: number) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const submission = new Submission({
        studentId,
        examId,
        sessionId,
        answers,
        score,
        isPassed,
        warnings,
      });
      await submission.save({ session });

      await ActiveExamSession.findByIdAndUpdate(
        sessionId,
        { status: 'Completed', endTime: new Date() },
        { session }
      );

      await session.commitTransaction();
      return submission;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
