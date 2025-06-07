import Question from "@/components/Question";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

interface QuizProps {
  params: Promise<{ quizId: string; fileid: string }>;
}

const QuizPage = async ({ params }: QuizProps) => {
  const { quizId, fileid } = await params;

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    return redirect("/");
  }

  const quiz = await db.quiz.findUnique({
    where: {
      id: quizId,
    },
    include: {
      questions: {
        select: {
          id: true,
          question: true,
          options: true,
        },
      },
    },
  });

  if (!quiz) {
    return redirect(`/dashboard/${fileid}`);
  }

  return <Question quiz={quiz} />;
};

export default QuizPage;
