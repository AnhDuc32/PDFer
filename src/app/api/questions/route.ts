import { strict_output } from "@/lib/googleai";
import { quizCreationSchema } from "@/schemas/form/quiz";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const POST = async (req: Request, res: Response) => {
  try {
    const body = await req.json();
    const { amount, topic, type } = quizCreationSchema.parse(body);

    let questions: any;

    if (type === "mcq") {
      questions = await strict_output(
        "You are a helpful AI that is able to generate mcq questions and answers, the length of each answer should not exceed 15 words",
        new Array(amount).fill(
          `You are to generate a random mcq question about ${topic}`
        ),
        {
          question: "question",
          answer: "answer with max length of 15 words",
          option1: "1st option with max length of 15 words",
          option2: "2st option with max length of 15 words",
          option3: "3st option with max length of 15 words",
        }
      );
    }

    return NextResponse.json(
      {
        questions,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    } else {
      console.error(error);
      return NextResponse.json(
        { error: "An unexpected error occured." },
        { status: 500 }
      );
    }
  }
};
