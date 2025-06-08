import AccuracyCard from "@/components/statistics/AccuracyCard";
import QuestionList from "@/components/statistics/QuestionList";
import ResultCard from "@/components/statistics/ResultCard";
import TimeTakenCard from "@/components/statistics/TimeTakenCard";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

interface Props {
  params: Promise<{ quizId: string }>;
}

const StatisticsPage = async ({ params }: Props) => {
  const { quizId } = await params;

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
      questions: true,
    },
  });

  const file = await db.file.findUnique({
    where: {
      id: quiz?.fileId,
    },
  });

  if (!quiz) {
    return redirect("/dashboard");
  }

  let accuracy: number = 0;
  const totalCorrect = quiz.questions.reduce((acc, question) => {
    if (question.isCorrect) {
      return acc + 1;
    }
    return acc;
  }, 0);
  accuracy = (totalCorrect / quiz.questions.length) * 100;
  accuracy = Math.round(accuracy * 100) / 100;

  return (
    <>
      <div className="p-8 mx-auto max-w-7xl">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Statistics</h2>

          <div className="flex items-center space-x-2">
            <Link
              href={`/dashboard/${quiz.fileId}`}
              className={buttonVariants()}
            >
              <ChevronLeft />
              Back to {file?.name}
            </Link>
          </div>
        </div>

        <div className="grid gap-4 mt-4 md:grid-cols-7">
          <ResultCard accuracy={accuracy} />
          <AccuracyCard accuracy={accuracy} />
          <TimeTakenCard
            timeEnded={quiz.timeEnded ?? new Date()}
            timeStarted={quiz.timeStarted ?? new Date()}
          />
        </div>

        <QuestionList questions={quiz.questions} />
      </div>
    </>
  );
};

export default StatisticsPage;
