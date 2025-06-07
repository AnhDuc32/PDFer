"use client";

import type { Question } from "@prisma/client";
import { Quiz } from "@prisma/client";
import { BarChart, ChevronRight, Loader2, Timer } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button, buttonVariants } from "./ui/button";
import QuestionCounter from "./QuestionCounter";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { checkAnswerSchema } from "@/schemas/form/quiz";
import { toast } from "sonner";
import Link from "next/link";
import { cn, formatTimeDelta } from "@/lib/utils";
import { differenceInSeconds } from "date-fns";

type Props = {
  quiz: Quiz & { questions: Pick<Question, "id" | "question" | "options">[] };
};

const Question = ({ quiz }: Props) => {
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [wrongAnswers, setwrongAnswers] = useState<number>(0);
  const [hasEnded, setHasEnded] = useState<boolean>(false);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      if (!hasEnded) {
        setNow(new Date());
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const currentQuestion = useMemo(() => {
    return quiz.questions[questionIndex];
  }, [questionIndex]);

  const { mutate: checkAnswer, isPending: isChecking } = useMutation({
    mutationFn: async () => {
      const payload: z.infer<typeof checkAnswerSchema> = {
        questionId: currentQuestion.id,
        userAnswer: options[selectedChoice],
      };
      const response = await axios.post("/api/checkAnswer", payload);

      return response.data;
    },
  });

  const handleNext = useCallback(() => {
    if (isChecking) return;

    checkAnswer(undefined, {
      onSuccess: ({ isCorrect }: { isCorrect: boolean }) => {
        if (isCorrect) {
          toast.success("Correct!");
          setCorrectAnswers((prev) => prev + 1);
        } else {
          toast.error("Incorrect!");
          setwrongAnswers((prev) => prev + 1);
        }

        if (questionIndex === quiz.questions.length - 1) {
          setHasEnded(true);
          return;
        }

        setQuestionIndex((prev) => prev + 1);
      },
    });
  }, [checkAnswer, isChecking, questionIndex, quiz.questions.length]);

  useEffect(() => {
    const handleKeyDowm = (event: KeyboardEvent) => {
      if (event.key === "1") {
        setSelectedChoice(0);
      } else if (event.key === "2") {
        setSelectedChoice(1);
      } else if (event.key === "3") {
        setSelectedChoice(2);
      } else if (event.key === "4") {
        setSelectedChoice(3);
      } else if (event.key === "Enter") {
        handleNext();
      }
    };

    document.addEventListener("keydown", handleKeyDowm);

    return () => {
      document.removeEventListener("keydown", handleKeyDowm);
    };
  }, [handleNext]);

  const options = useMemo(() => {
    if (!currentQuestion) return [];
    if (!currentQuestion.options) return [];

    return JSON.parse(currentQuestion.options as string) as string[];
  }, [currentQuestion]);

  if (hasEnded) {
    return (
      <div className="absolute flex flex-col justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="px-4 mt-2 font-semibold text-white bg-green-500 rounded-md whitespace-nowrap">
          You completed in {"3m 4s"}
        </div>

        <Link
          href={`/statistics/${quiz.id}`}
          className={cn(buttonVariants(), "mt-2")}
        >
          View Statistics
          <BarChart className=" w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:w-[80vw] max-w-4xl w-[90vw]">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          <p>
            <span className="text-slate-400 mr-2">Topic</span>
            <span className="px-2 py-1 text-white rounded-lg bg-blue-500">
              {quiz.topic}
            </span>
          </p>

          <div className="flex self-start mt-3 text-slate-400">
            <Timer className="mr-2" />
            <span>
              {formatTimeDelta(differenceInSeconds(now, quiz.timeStarted ?? 0))}
            </span>
          </div>
        </div>

        <QuestionCounter
          correctAnswers={correctAnswers}
          wrongAnswers={wrongAnswers}
        />
      </div>

      <Card className="w-full mt-4">
        <CardHeader className="flex flex-row items-center">
          <CardTitle className="mr-5 text-center divide-y divide-zinc-600/50">
            <div>{questionIndex + 1}</div>
            <div className="text-base text-slate-400">
              {quiz.questions.length}
            </div>
          </CardTitle>

          <CardDescription className="flex-grow text-lg">
            {currentQuestion.question}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex flex-col items-center justify-center w-full mt-4">
        {options.map((option, index) => {
          return (
            <Button
              key={index}
              className="justify-start w-full py-8 mb-4 cursor-pointer"
              variant={selectedChoice === index ? "default" : "custom"}
              onClick={() => setSelectedChoice(index)}
            >
              <div className="flex items-center justify-start">
                <div className="p-2 px-3 mr-5 border rounded-md">
                  {index + 1}
                </div>

                <div className="text-start">{option}</div>
              </div>
            </Button>
          );
        })}

        <Button
          className="mt-2 cursor-pointer"
          onClick={() => handleNext()}
          disabled={isChecking}
        >
          {isChecking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Next <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Question;
