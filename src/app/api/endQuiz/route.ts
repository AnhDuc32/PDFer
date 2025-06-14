import { db } from "@/db";
import { endQuizSchema } from "@/schemas/form/quiz";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quizId } = endQuizSchema.parse(body);

    const quiz = await db.quiz.findUnique({
      where: {
        id: quizId,
      },
    });

    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    await db.quiz.update({
      where: {
        id: quizId,
      },
      data: {
        timeEnded: new Date(),
      },
    });

    return NextResponse.json({ message: "Game ended" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `Something went wrong: ${error}` },
      { status: 500 }
    );
  }
}
