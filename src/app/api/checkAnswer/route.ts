import { db } from "@/db/index";
import { checkAnswerSchema } from "@/schemas/form/quiz";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { questionId, userAnswer } = checkAnswerSchema.parse(body);

    const question = await db.question.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    await db.question.update({
      where: {
        id: questionId,
      },
      data: {
        userAnswer,
      },
    });

    const isCorrect =
      question.answer.toLowerCase().trim() === userAnswer.toLowerCase().trim();

    await db.question.update({
      where: {
        id: questionId,
      },
      data: {
        isCorrect,
      },
    });

    return NextResponse.json({ isCorrect }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
  }
}
