import { ExamSubmission } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/AppError.js';
import { TokenPayload } from '../../lib/auth.js';
import { isDbConfigured } from '../../lib/dbStore.js';
import {
  AnswersMap,
  ICreateExamPayload,
  ICreateQuestionPayload,
  ILeaderboardEntry,
  IUpdateExamPayload,
  IUpdateQuestionPayload,
} from './exam.interface.js';

function assertDbConfigured() {
  if (!isDbConfigured) {
    throw new AppError(500, 'ডাটাবেজ কনফিগার করা নেই।');
  }
}

function validateQuestionOptions(options: string[], correctOption: number) {
  if (correctOption < 0 || correctOption >= options.length) {
    throw new AppError(
      400,
      `সঠিক উত্তর (correctOption) অবশ্যই ০ থেকে ${options.length - 1}-এর মধ্যে হতে হবে।`
    );
  }
}

async function recalculateExamTotalMarks(examId: string): Promise<number> {
  const agg = await prisma.examQuestion.aggregate({
    where: { examId },
    _sum: { marks: true },
  });
  const totalMarks = Math.round((agg._sum.marks || 0) * 100) / 100;
  await prisma.exam.update({
    where: { id: examId },
    data: { totalMarks },
  });
  return totalMarks;
}

interface QuestionForEvaluation {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string | null;
  marks: number;
  orderIndex: number;
}

function evaluateExamAnswers(
  questions: QuestionForEvaluation[],
  rawAnswers: AnswersMap,
  negativeMarking: number
) {
  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;
  let rawScore = 0;
  let penalty = 0;

  const cleanAnswers: Record<string, number> = {};

  const answerSheet = questions.map((q) => {
    const rawChoice = rawAnswers?.[q.id];
    const selectedOption =
      typeof rawChoice === 'number' &&
      Number.isInteger(rawChoice) &&
      rawChoice >= 0 &&
      rawChoice < q.options.length
        ? rawChoice
        : null;

    if (selectedOption !== null) {
      cleanAnswers[q.id] = selectedOption;
    }

    const isCorrect = selectedOption !== null && selectedOption === q.correctOption;

    if (selectedOption === null) {
      unattemptedCount++;
    } else if (isCorrect) {
      correctCount++;
      rawScore += q.marks;
    } else {
      wrongCount++;
      penalty += negativeMarking;
    }

    return {
      id: q.id,
      question: q.question,
      options: q.options,
      correctOption: q.correctOption,
      selectedOption,
      isCorrect,
      explanation: q.explanation,
      marks: q.marks,
      orderIndex: q.orderIndex,
    };
  });

  const totalScore = Math.round((rawScore - penalty) * 100) / 100;

  return {
    cleanAnswers,
    totalScore,
    totalQuestions: questions.length,
    correctCount,
    wrongCount,
    unattemptedCount,
    answerSheet,
  };
}

async function assertStudentEligibility(
  exam: { id: string; courseId: string | null; isPublic: boolean },
  userId: string
) {
  if (exam.isPublic || !exam.courseId) {
    return true;
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      courseId: exam.courseId,
      status: 'APPROVED',
    },
    select: { id: true },
  });

  if (!enrollment) {
    throw new AppError(
      403,
      'এই পরীক্ষায় অংশগ্রহণ করতে সংশ্লিষ্ট কোর্সটিতে এনরোল ও অনুমোদিত হতে হবে।'
    );
  }

  return true;
}

async function finalizeExpiredSubmissionIfNeeded(
  exam: {
    id: string;
    durationMinutes: number;
    negativeMarking: number;
  },
  submission: ExamSubmission
): Promise<ExamSubmission> {
  if (submission.status === 'SUBMITTED') {
    return submission;
  }

  const maxAllowedSeconds = exam.durationMinutes * 60;
  const elapsedSeconds = Math.floor((Date.now() - submission.startedAt.getTime()) / 1000);

  if (elapsedSeconds < maxAllowedSeconds) {
    return submission;
  }

  const questions = await prisma.examQuestion.findMany({
    where: { examId: exam.id },
    orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
  });

  const evaluated = evaluateExamAnswers(
    questions,
    (submission.answers as AnswersMap) || {},
    exam.negativeMarking
  );

  return await prisma.examSubmission.update({
    where: { id: submission.id },
    data: {
      status: 'SUBMITTED',
      answers: evaluated.cleanAnswers,
      totalScore: evaluated.totalScore,
      totalQuestions: evaluated.totalQuestions,
      correctCount: evaluated.correctCount,
      wrongCount: evaluated.wrongCount,
      unattemptedCount: evaluated.unattemptedCount,
      timeTakenSeconds: maxAllowedSeconds,
      submittedAt: new Date(submission.startedAt.getTime() + maxAllowedSeconds * 1000),
    },
  });
}

async function buildLeaderboardData(examId: string, currentUserId?: string) {
  const submissions = await prisma.examSubmission.findMany({
    where: {
      examId,
      status: 'SUBMITTED',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          institution: true,
          district: true,
        },
      },
    },
    orderBy: [
      { totalScore: 'desc' },
      { timeTakenSeconds: 'asc' },
      { submittedAt: 'asc' },
    ],
  });

  let myRank: number | null = null;
  const entries: ILeaderboardEntry[] = submissions.map((sub, idx) => {
    const rank = idx + 1;
    const isCurrentUser = Boolean(currentUserId && sub.userId === currentUserId);
    if (isCurrentUser) {
      myRank = rank;
    }
    return {
      rank,
      userId: sub.userId,
      studentName: sub.user?.name || 'শিক্ষার্থী',
      institution: sub.user?.institution || '',
      district: sub.user?.district || '',
      totalScore: sub.totalScore,
      totalQuestions: sub.totalQuestions,
      correctCount: sub.correctCount,
      wrongCount: sub.wrongCount,
      unattemptedCount: sub.unattemptedCount,
      timeTakenSeconds: sub.timeTakenSeconds,
      submittedAt: sub.submittedAt,
      isCurrentUser,
    };
  });

  return {
    entries,
    myRank,
    totalParticipants: entries.length,
  };
}

// ==========================================
// Admin Exam Management Services
// ==========================================

const getAllAdminExams = async () => {
  assertDbConfigured();
  return await prisma.exam.findMany({
    include: {
      course: {
        select: {
          id: true,
          title: true,
          level: true,
        },
      },
      _count: {
        select: {
          questions: true,
          submissions: {
            where: { status: 'SUBMITTED' },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getAdminExamById = async (examId: string) => {
  assertDbConfigured();
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          level: true,
        },
      },
      questions: {
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
      },
      _count: {
        select: {
          questions: true,
          submissions: {
            where: { status: 'SUBMITTED' },
          },
        },
      },
    },
  });

  if (!exam) {
    throw new AppError(404, 'পরীক্ষাটি খুঁজে পাওয়া যায়নি।');
  }

  return exam;
};

const createExam = async (payload: ICreateExamPayload) => {
  assertDbConfigured();

  const normalizedCourseId =
    payload.courseId && payload.courseId.trim().length > 0 ? payload.courseId.trim() : null;

  if (normalizedCourseId) {
    const course = await prisma.course.findUnique({ where: { id: normalizedCourseId } });
    if (!course) {
      throw new AppError(404, 'সংযুক্ত করার জন্য নির্বাচিত কোর্সটি খুঁজে পাওয়া যায়নি।');
    }
  }

  return await prisma.exam.create({
    data: {
      courseId: normalizedCourseId,
      title: payload.title,
      description: payload.description || null,
      durationMinutes: payload.durationMinutes,
      passMarks: payload.passMarks ?? 0,
      negativeMarking: payload.negativeMarking ?? 0.25,
      isPublic: normalizedCourseId ? (payload.isPublic ?? false) : true,
      isActive: payload.isActive ?? true,
    },
    include: {
      course: {
        select: { id: true, title: true, level: true },
      },
      _count: {
        select: {
          questions: true,
          submissions: { where: { status: 'SUBMITTED' } },
        },
      },
    },
  });
};

const updateExam = async (examId: string, payload: IUpdateExamPayload) => {
  assertDbConfigured();

  const existing = await prisma.exam.findUnique({ where: { id: examId } });
  if (!existing) {
    throw new AppError(404, 'পরীক্ষাটি খুঁজে পাওয়া যায়নি।');
  }

  let normalizedCourseId = existing.courseId;
  if (payload.courseId !== undefined) {
    normalizedCourseId =
      payload.courseId && payload.courseId.trim().length > 0 ? payload.courseId.trim() : null;
    if (normalizedCourseId) {
      const course = await prisma.course.findUnique({ where: { id: normalizedCourseId } });
      if (!course) {
        throw new AppError(404, 'নির্বাচিত কোর্সটি খুঁজে পাওয়া যায়নি।');
      }
    }
  }

  return await prisma.exam.update({
    where: { id: examId },
    data: {
      ...(payload.title !== undefined && { title: payload.title }),
      ...(payload.description !== undefined && { description: payload.description }),
      ...(payload.durationMinutes !== undefined && { durationMinutes: payload.durationMinutes }),
      ...(payload.passMarks !== undefined && { passMarks: payload.passMarks }),
      ...(payload.negativeMarking !== undefined && { negativeMarking: payload.negativeMarking }),
      ...(payload.courseId !== undefined && { courseId: normalizedCourseId }),
      ...(payload.isPublic !== undefined && {
        isPublic: normalizedCourseId ? payload.isPublic : true,
      }),
      ...(payload.isActive !== undefined && { isActive: payload.isActive }),
    },
    include: {
      course: {
        select: { id: true, title: true, level: true },
      },
      _count: {
        select: {
          questions: true,
          submissions: { where: { status: 'SUBMITTED' } },
        },
      },
    },
  });
};

const deleteExam = async (examId: string) => {
  assertDbConfigured();

  const existing = await prisma.exam.findUnique({ where: { id: examId } });
  if (!existing) {
    throw new AppError(404, 'মুছে ফেলার জন্য পরীক্ষাটি খুঁজে পাওয়া যায়নি।');
  }

  await prisma.exam.delete({ where: { id: examId } });
  return { deleted: true, message: 'পরীক্ষাটি সফলভাবে মুছে ফেলা হয়েছে।' };
};

const addQuestion = async (examId: string, payload: ICreateQuestionPayload) => {
  assertDbConfigured();

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { _count: { select: { questions: true } } },
  });
  if (!exam) {
    throw new AppError(404, 'পরীক্ষাটি খুঁজে পাওয়া যায়নি।');
  }

  validateQuestionOptions(payload.options, payload.correctOption);

  const question = await prisma.examQuestion.create({
    data: {
      examId,
      question: payload.question,
      options: payload.options,
      correctOption: payload.correctOption,
      explanation: payload.explanation || null,
      marks: payload.marks ?? 1.0,
      orderIndex: payload.orderIndex ?? exam._count.questions,
    },
  });

  const totalMarks = await recalculateExamTotalMarks(examId);
  return { question, totalMarks };
};

const bulkAddQuestions = async (examId: string, questions: ICreateQuestionPayload[]) => {
  assertDbConfigured();

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { _count: { select: { questions: true } } },
  });
  if (!exam) {
    throw new AppError(404, 'পরীক্ষাটি খুঁজে পাওয়া যায়নি।');
  }

  questions.forEach((q) => validateQuestionOptions(q.options, q.correctOption));

  const startIndex = exam._count.questions;

  await prisma.$transaction(
    questions.map((q, idx) =>
      prisma.examQuestion.create({
        data: {
          examId,
          question: q.question,
          options: q.options,
          correctOption: q.correctOption,
          explanation: q.explanation || null,
          marks: q.marks ?? 1.0,
          orderIndex: q.orderIndex ?? startIndex + idx,
        },
      })
    )
  );

  const totalMarks = await recalculateExamTotalMarks(examId);
  return { addedCount: questions.length, totalMarks };
};

const updateQuestion = async (
  examId: string,
  questionId: string,
  payload: IUpdateQuestionPayload
) => {
  assertDbConfigured();

  const existing = await prisma.examQuestion.findFirst({
    where: { id: questionId, examId },
  });
  if (!existing) {
    throw new AppError(404, 'প্রশ্নটি খুঁজে পাওয়া যায়নি।');
  }

  const nextOptions = payload.options ?? existing.options;
  const nextCorrect = payload.correctOption ?? existing.correctOption;
  validateQuestionOptions(nextOptions, nextCorrect);

  const question = await prisma.examQuestion.update({
    where: { id: questionId },
    data: {
      ...(payload.question !== undefined && { question: payload.question }),
      ...(payload.options !== undefined && { options: payload.options }),
      ...(payload.correctOption !== undefined && { correctOption: payload.correctOption }),
      ...(payload.explanation !== undefined && { explanation: payload.explanation }),
      ...(payload.marks !== undefined && { marks: payload.marks }),
      ...(payload.orderIndex !== undefined && { orderIndex: payload.orderIndex }),
    },
  });

  const totalMarks = await recalculateExamTotalMarks(examId);
  return { question, totalMarks };
};

const deleteQuestion = async (examId: string, questionId: string) => {
  assertDbConfigured();

  const existing = await prisma.examQuestion.findFirst({
    where: { id: questionId, examId },
  });
  if (!existing) {
    throw new AppError(404, 'মুছে ফেলার জন্য প্রশ্নটি খুঁজে পাওয়া যায়নি।');
  }

  await prisma.examQuestion.delete({ where: { id: questionId } });
  const totalMarks = await recalculateExamTotalMarks(examId);
  return { deleted: true, totalMarks };
};

// ==========================================
// Student Exam Taking & Leaderboard Services
// ==========================================

const getStudentExams = async (userPayload?: TokenPayload, courseId?: string) => {
  assertDbConfigured();

  const where: any = {
    isActive: true,
    questions: { some: {} },
  };
  if (courseId) {
    where.courseId = courseId;
  }

  const exams = await prisma.exam.findMany({
    where,
    include: {
      course: {
        select: {
          id: true,
          title: true,
          level: true,
        },
      },
      _count: {
        select: {
          questions: true,
          submissions: {
            where: { status: 'SUBMITTED' },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!userPayload) {
    return exams.map((exam) => ({
      ...exam,
      isEligible: false,
      requiresLogin: true,
      mySubmission: null,
    }));
  }

  const approvedEnrollments = await prisma.enrollment.findMany({
    where: { userId: userPayload.userId, status: 'APPROVED' },
    select: { courseId: true },
  });
  const approvedCourseIds = new Set(approvedEnrollments.map((e) => e.courseId));

  const userSubmissions = await prisma.examSubmission.findMany({
    where: {
      userId: userPayload.userId,
      examId: { in: exams.map((e) => e.id) },
    },
  });
  const subByExam = new Map(userSubmissions.map((s) => [s.examId, s]));

  const results = [];
  for (const exam of exams) {
    let sub: any = subByExam.get(exam.id) || null;
    if (sub && sub.status === 'IN_PROGRESS') {
      sub = await finalizeExpiredSubmissionIfNeeded(exam, sub);
    }

    const isEligible =
      userPayload.role === 'STUDENT' &&
      (exam.isPublic || !exam.courseId || approvedCourseIds.has(exam.courseId));

    results.push({
      ...exam,
      isEligible,
      requiresLogin: false,
      mySubmission: sub
        ? {
            id: sub.id,
            status: sub.status,
            totalScore: sub.totalScore,
            correctCount: sub.correctCount,
            wrongCount: sub.wrongCount,
            unattemptedCount: sub.unattemptedCount,
            timeTakenSeconds: sub.timeTakenSeconds,
            startedAt: sub.startedAt,
            submittedAt: sub.submittedAt,
          }
        : null,
    });
  }

  return results;
};

const startOrResumeExam = async (examId: string, userPayload: TokenPayload) => {
  assertDbConfigured();

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      course: {
        select: { id: true, title: true, level: true },
      },
      questions: {
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
        // SECURITY: Strictly strip correctOption & explanation before exam submission!
        select: {
          id: true,
          question: true,
          options: true,
          marks: true,
          orderIndex: true,
        },
      },
    },
  });

  if (!exam || !exam.isActive || exam.questions.length === 0) {
    throw new AppError(404, 'পরীক্ষাটি বর্তমানে পাওয়া যাচ্ছে না অথবা এখনো সক্রিয় করা হয়নি।');
  }

  await assertStudentEligibility(exam, userPayload.userId);

  let submission = await prisma.examSubmission.findUnique({
    where: {
      examId_userId: {
        examId,
        userId: userPayload.userId,
      },
    },
  });

  if (submission) {
    if (submission.status === 'IN_PROGRESS') {
      submission = await finalizeExpiredSubmissionIfNeeded(exam, submission);
    }

    if (submission.status === 'SUBMITTED') {
      return {
        alreadySubmitted: true,
        exam: {
          id: exam.id,
          title: exam.title,
        },
      };
    }
  } else {
    submission = await prisma.examSubmission.create({
      data: {
        examId,
        userId: userPayload.userId,
        status: 'IN_PROGRESS',
        totalQuestions: exam.questions.length,
        answers: {},
        startedAt: new Date(),
      },
    });
  }

  const maxAllowedSeconds = exam.durationMinutes * 60;
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - submission.startedAt.getTime()) / 1000)
  );
  const remainingSeconds = Math.max(0, maxAllowedSeconds - elapsedSeconds);

  return {
    alreadySubmitted: false,
    exam: {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      passMarks: exam.passMarks,
      negativeMarking: exam.negativeMarking,
      course: exam.course,
      questionCount: exam.questions.length,
    },
    questions: exam.questions,
    startedAt: submission.startedAt,
    remainingSeconds,
    draftAnswers: (submission.answers as AnswersMap) || {},
  };
};

const syncExamDraft = async (examId: string, userId: string, answers: AnswersMap) => {
  assertDbConfigured();

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, durationMinutes: true },
  });
  if (!exam) {
    throw new AppError(404, 'পরীক্ষাটি খুঁজে পাওয়া যায়নি।');
  }

  const submission = await prisma.examSubmission.findUnique({
    where: { examId_userId: { examId, userId } },
  });

  if (!submission || submission.status === 'SUBMITTED') {
    return { synced: false, alreadySubmitted: submission?.status === 'SUBMITTED' };
  }

  const elapsed = Math.floor((Date.now() - submission.startedAt.getTime()) / 1000);
  if (elapsed > exam.durationMinutes * 60 + 60) {
    return { synced: false, expired: true };
  }

  await prisma.examSubmission.update({
    where: { id: submission.id },
    data: { answers },
  });

  return { synced: true };
};

const submitExam = async (examId: string, userId: string, submittedAnswers: AnswersMap) => {
  assertDbConfigured();

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      course: { select: { id: true, title: true, level: true } },
      questions: {
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });

  if (!exam || !exam.isActive || exam.questions.length === 0) {
    throw new AppError(404, 'পরীক্ষাটি খুঁজে পাওয়া যায়নি।');
  }

  await assertStudentEligibility(exam, userId);

  const existingSubmission = await prisma.examSubmission.findUnique({
    where: { examId_userId: { examId, userId } },
  });

  if (existingSubmission?.status === 'SUBMITTED') {
    return await getExamResult(examId, userId);
  }

  const startedAt = existingSubmission?.startedAt ?? new Date();
  const maxAllowedSeconds = exam.durationMinutes * 60;
  const actualElapsed = Math.max(1, Math.floor((Date.now() - startedAt.getTime()) / 1000));

  // If submitted beyond 90s past deadline, evaluate previously synced draft answers to prevent timer-bypass cheating
  const answersToGrade =
    existingSubmission && actualElapsed > maxAllowedSeconds + 90
      ? ((existingSubmission.answers as AnswersMap) || {})
      : submittedAnswers;

  const timeTakenSeconds = Math.min(actualElapsed, maxAllowedSeconds);

  const evaluated = evaluateExamAnswers(exam.questions, answersToGrade, exam.negativeMarking);

  if (existingSubmission) {
    await prisma.examSubmission.update({
      where: { id: existingSubmission.id },
      data: {
        status: 'SUBMITTED',
        answers: evaluated.cleanAnswers,
        totalScore: evaluated.totalScore,
        totalQuestions: evaluated.totalQuestions,
        correctCount: evaluated.correctCount,
        wrongCount: evaluated.wrongCount,
        unattemptedCount: evaluated.unattemptedCount,
        timeTakenSeconds,
        submittedAt: new Date(),
      },
    });
  } else {
    await prisma.examSubmission.create({
      data: {
        examId,
        userId,
        status: 'SUBMITTED',
        answers: evaluated.cleanAnswers,
        totalScore: evaluated.totalScore,
        totalQuestions: evaluated.totalQuestions,
        correctCount: evaluated.correctCount,
        wrongCount: evaluated.wrongCount,
        unattemptedCount: evaluated.unattemptedCount,
        timeTakenSeconds,
        startedAt,
        submittedAt: new Date(),
      },
    });
  }

  return await getExamResult(examId, userId);
};

const getExamResult = async (examId: string, userId: string) => {
  assertDbConfigured();

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      course: { select: { id: true, title: true, level: true } },
      questions: {
        orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });

  if (!exam) {
    throw new AppError(404, 'পরীক্ষাটি খুঁজে পাওয়া যায়নি।');
  }

  let submission = await prisma.examSubmission.findUnique({
    where: { examId_userId: { examId, userId } },
  });

  if (!submission) {
    throw new AppError(404, 'আপনি এখনো এই পরীক্ষায় অংশগ্রহণ করেননি।');
  }

  if (submission.status === 'IN_PROGRESS') {
    submission = await finalizeExpiredSubmissionIfNeeded(exam, submission);
    if (submission.status !== 'SUBMITTED') {
      throw new AppError(403, 'পরীক্ষা সাবমিট না করে ফলাফল ও উত্তরমালা দেখা যাবে না।');
    }
  }

  const evaluated = evaluateExamAnswers(
    exam.questions,
    (submission.answers as AnswersMap) || {},
    exam.negativeMarking
  );

  const leaderboardData = await buildLeaderboardData(examId, userId);

  const accuracy =
    submission.totalQuestions > 0
      ? Math.round((submission.correctCount / submission.totalQuestions) * 100)
      : 0;

  return {
    exam: {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      passMarks: exam.passMarks,
      negativeMarking: exam.negativeMarking,
      course: exam.course,
    },
    result: {
      totalScore: submission.totalScore,
      totalQuestions: submission.totalQuestions,
      correctCount: submission.correctCount,
      wrongCount: submission.wrongCount,
      unattemptedCount: submission.unattemptedCount,
      timeTakenSeconds: submission.timeTakenSeconds,
      startedAt: submission.startedAt,
      submittedAt: submission.submittedAt,
      passed: submission.totalScore >= exam.passMarks,
      accuracy,
      rank: leaderboardData.myRank,
      totalParticipants: leaderboardData.totalParticipants,
    },
    answerSheet: evaluated.answerSheet,
    leaderboard: leaderboardData.entries,
  };
};

const getExamLeaderboard = async (examId: string, requester: TokenPayload) => {
  assertDbConfigured();

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      course: { select: { id: true, title: true, level: true } },
    },
  });

  if (!exam) {
    throw new AppError(404, 'পরীক্ষাটি খুঁজে পাওয়া যায়নি।');
  }

  if (requester.role === 'STUDENT') {
    let submission = await prisma.examSubmission.findUnique({
      where: { examId_userId: { examId, userId: requester.userId } },
    });

    if (submission && submission.status === 'IN_PROGRESS') {
      submission = await finalizeExpiredSubmissionIfNeeded(exam, submission);
    }

    if (!submission || submission.status !== 'SUBMITTED') {
      throw new AppError(
        403,
        'মেধাতালিকা দেখার জন্য অনুগ্রহ করে প্রথমে পরীক্ষায় অংশগ্রহণ করে সাবমিট করুন।'
      );
    }
  }

  const leaderboardData = await buildLeaderboardData(examId, requester.userId);

  return {
    exam: {
      id: exam.id,
      title: exam.title,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      passMarks: exam.passMarks,
      negativeMarking: exam.negativeMarking,
      course: exam.course,
    },
    ...leaderboardData,
  };
};

export const ExamService = {
  getAllAdminExams,
  getAdminExamById,
  createExam,
  updateExam,
  deleteExam,
  addQuestion,
  bulkAddQuestions,
  updateQuestion,
  deleteQuestion,
  getStudentExams,
  startOrResumeExam,
  syncExamDraft,
  submitExam,
  getExamResult,
  getExamLeaderboard,
};
