export interface TypingDataPoint {
  timestamp: number; // Time in milliseconds from the start of the session
  codeLength: number; // Length of the code at this timestamp
}

export interface Student {
  id: string;
  name: string;
  username: string;
  password?: string; // Password is required for authentication
  studentNumber?: string;
}

export interface Classroom {
  id:string;
  name: string;
  studentIds: string[];
}

export interface Submission {
  id: string;
  problemId: string;
  studentId: string;
  classId: string;
  finalCode: string;
  typingHistory: TypingDataPoint[];
  submittedAt: Date;
}

export interface Problem {
  id: string;
  title: string; // Fallback / for teacher-created problems
  description: string; // Fallback / for teacher-created problems
  titleKey?: string;
  descriptionKey?: string;
  initialCode: string;
  hint?: string; // For teacher-created problems
  hintKey?: string; // For pre-defined problems
}

export interface TeachingMaterial {
  id: string;
  name: string;
  description: string;
  file: File;
  fileURL: string;
  uploadedAt: Date;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: 'teacher' | 'student';
  classId?: string; // Only for students
  studentNumber?: string;
}