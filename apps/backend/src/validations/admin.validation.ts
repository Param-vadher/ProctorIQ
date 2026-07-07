import { z } from 'zod';

// Subject Schema
export const createSubjectSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required'),
  description: z.string().optional()
});

// Question Schema
export const createQuestionSchema = z.object({
  subjectId: z.string().min(1, 'Subject ID is required'),
  subtopic: z.string().min(1, 'Subtopic is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  questionText: z.string().min(1, 'Question text is required'),
  options: z.array(z.string()).length(4, 'Exactly 4 options are required'),
  correctOptionIndex: z.number().min(0).max(3),
  explanation: z.string().optional(),
  marks: z.number().min(1).optional()
});

export const updateQuestionSchema = createQuestionSchema.partial();

// Exam Schema
export const createExamSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  subjectId: z.string().min(1, 'Subject ID is required'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  totalMarks: z.number().min(1),
  passingMarks: z.number().min(1),
  windowStart: z.string().datetime(),
  windowEnd: z.string().datetime(),
  proctoringEnabled: z.boolean().optional(),
  dynamicConfig: z.object({
    enabled: z.boolean(),
    easyCount: z.number().min(0),
    mediumCount: z.number().min(0),
    hardCount: z.number().min(0)
  }).optional(),
  manualQuestions: z.array(z.string()).optional(),
  assignedStudents: z.array(z.string()).optional()
});

// User Schema (for admin user management)
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'teacher', 'student']),
  phone: z.string().optional(),
  profilePicture: z.string().optional()
});

export const updateUserSchema = createUserSchema.partial().extend({
  password: z.string().min(8).optional()
});
