import { Question } from "@prisma/client";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { cn } from "@/lib/utils";

type Props = {
  questions: Question[];
};

const QuestionList = ({ questions }: Props) => {
  return (
    <Table className="mt-4">
      <TableCaption>End of list.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[10px]">No.</TableHead>
          <TableHead>Question & Correct Answer</TableHead>
          <TableHead>Your Answer</TableHead>
          {}
        </TableRow>
      </TableHeader>

      <TableBody>
        <>
          {questions.map((question, index) => (
            <TableRow key={question.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                {question.question}
                <br />
                <br />
                <span className="font-semibold text-blue-500">
                  {question.answer}
                </span>
              </TableCell>

              <TableCell
                className={cn({
                  "text-green-600": question.isCorrect,
                  "text-red-600": !question.isCorrect,
                })}
              >
                {question.userAnswer}
              </TableCell>
            </TableRow>
          ))}
        </>
      </TableBody>
    </Table>
  );
};

export default QuestionList;
