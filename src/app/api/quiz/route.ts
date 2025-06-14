import { db } from "@/db";
import { quizCreationSchema } from "@/schemas/form/quiz";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { generateQuestions } from "@/lib/generateQuestions";

interface mcqQuestion {
  question: string;
  answer: string;
  option1: string;
  option2: string;
  option3: string;
}

export async function GET(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "fileId is required" },
        { status: 400 }
      );
    }

    const quizzes = await db.quiz.findMany({
      where: { fileId },
      orderBy: { timeStarted: "desc" },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    return NextResponse.json(
      {
        error: `An unexpected error occured in GET method of /api/quiz: ${error}`,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();

    const { amount, topic, fileId } = quizCreationSchema.parse(body);

    const quiz = await db.quiz.create({
      data: {
        userId: user.id,
        topic: topic,
        fileId: fileId,
        timeStarted: new Date(),
      },
    });

    const { questions } = await generateQuestions(amount, topic, fileId);

    const manyData = (questions as mcqQuestion[]).map((question) => {
      const options = [
        question.answer,
        question.option1,
        question.option2,
        question.option3,
      ].sort(() => Math.random() - 0.5);

      return {
        question: question.question,
        answer: question.answer,
        options: JSON.stringify(options),
        quizId: quiz.id,
      };
    });

    await db.question.createMany({
      data: manyData,
    });

    return NextResponse.json({ quizId: quiz.id }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    } else {
      return NextResponse.json(
        {
          error: `An unexpected error occured in POST method of /api/quiz: ${error}`,
        },
        { status: 500 }
      );
    }
  }
}
