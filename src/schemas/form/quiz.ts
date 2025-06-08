import { z } from "zod";

export const quizCreationSchema = z.object({
  topic: z.string().min(1, { message: "Topic must not be empty!" }),
  amount: z.number().min(1).max(10),
  fileId: z.string(),
});

export const checkAnswerSchema = z.object({
  questionId: z.string(),
  userAnswer: z.string(),
});

export const endQuizSchema = z.object({
  quizId: z.string(),
});
