export interface ICreateExamPayload {
  courseId?: string | null;
  title: string;
  description?: string | null;
  durationMinutes: number;
  passMarks?: number;
  negativeMarking?: number;
  isPublic?: boolean;
  isActive?: boolean;
}

export interface IUpdateExamPayload {
  courseId?: string | null;
  title?: string;
  description?: string | null;
  durationMinutes?: number;
  passMarks?: number;
  negativeMarking?: number;
  isPublic?: boolean;
  isActive?: boolean;
}

export interface ICreateQuestionPayload {
  question: string;
  options: string[];
  correctOption: number;
  explanation?: string | null;
  marks?: number;
  orderIndex?: number;
}

export interface IUpdateQuestionPayload {
  question?: string;
  options?: string[];
  correctOption?: number;
  explanation?: string | null;
  marks?: number;
  orderIndex?: number;
}

export type AnswersMap = Record<string, number | null>;

export interface ILeaderboardEntry {
  rank: number;
  userId: string;
  studentName: string;
  institution: string;
  district: string;
  totalScore: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  timeTakenSeconds: number;
  submittedAt: Date | null;
  isCurrentUser: boolean;
}
