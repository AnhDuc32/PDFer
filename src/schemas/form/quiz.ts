import { z } from "zod";

export const quizCreationSchema = z.object({
  topic: z.string().min(1, { message: "Topic must not be empty!" }),
  type: z.enum(["mcq"]),
  amount: z.number().min(1).max(10),
});
