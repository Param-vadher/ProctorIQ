import ExcelJS from 'exceljs';
import Submission from '../models/Submission';

export class ExportService {
  static async exportSubmissionsToExcel(examId: string) {
    const submissions = await Submission.find({ examId }).populate('studentId', 'name email');
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Exam Results');
    
    worksheet.columns = [
      { header: 'Student Name', key: 'name', width: 25 },
      { header: 'Student Email', key: 'email', width: 30 },
      { header: 'Score', key: 'score', width: 10 },
      { header: 'Passed', key: 'isPassed', width: 10 },
      { header: 'Warnings', key: 'warnings', width: 15 },
      { header: 'Submitted At', key: 'submittedAt', width: 25 },
    ];
    
    submissions.forEach(sub => {
      const student: any = sub.studentId;
      worksheet.addRow({
        name: student?.name || 'Unknown',
        email: student?.email || 'Unknown',
        score: sub.score,
        isPassed: sub.isPassed ? 'Yes' : 'No',
        warnings: sub.warnings,
        submittedAt: sub.submittedAt.toISOString()
      });
    });
    
    return await workbook.xlsx.writeBuffer();
  }
}
