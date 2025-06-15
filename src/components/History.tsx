import { Quiz } from "@prisma/client";
import { Clock, CopyCheck, Ghost, Loader2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type Props = {
  fileId: string;
};

const History = ({ fileId }: Props) => {
  const [quizs, setQuizs] = useState<Quiz[]>([]);

  const [isLoading, setIsloading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`/api/quiz?fileId=${fileId}`)
      .then((res) => res.json())
      .then((data) => {
        setQuizs(data);
        setIsloading(false);
      });
  }, [fileId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">History</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-8 h-[350px] overflow-y-scroll">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-blue-500 h-8 w-8" />
            </div>
          ) : quizs.length > 0 ? (
            quizs.map((quiz) => (
              <div className="flex items-center justify-between" key={quiz.id}>
                <div className="flex items-center">
                  <CopyCheck className="mr-3" />
                  <div className="ml-4 space-y-1">
                    <Link
                      href={`/statistics/${quiz.id}`}
                      className="text-base font-medium leading-none hover:underline hover:text-blue-500"
                    >
                      {quiz.topic}
                    </Link>

                    <p className="flex items-center px-2 py-1 text-sm text-white rounded-lg w-fit bg-blue-500 mt-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(quiz.timeStarted ?? 0).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center mt-28 flex-col gap-2">
              <Ghost color="gray" />
              <p className="text-center text-zinc-500">
                You don&apos;t have any quizzes yet!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default History;
