"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useForm } from "react-hook-form";
import { quizCreationSchema } from "@/schemas/form/quiz";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Props {
  fileId: string;
}

type Input = z.infer<typeof quizCreationSchema>;

const QuizCreation = ({ fileId }: Props) => {
  const router = useRouter();

  const { mutate: getQuiz, isPending } = useMutation({
    mutationFn: async ({ amount, topic, fileId }: Input) => {
      const response = await axios.post("/api/quiz", {
        amount,
        topic,
        fileId,
      });
      return response.data;
    },
  });

  const form = useForm<Input>({
    resolver: zodResolver(quizCreationSchema),
    defaultValues: {
      amount: 3,
      topic: "",
      fileId: fileId,
    },
  });

  const onSubmit = (input: Input) => {
    getQuiz(
      {
        amount: input.amount,
        topic: input.topic,
        fileId: input.fileId,
      },
      {
        onSuccess: ({ quizId }) => {
          router.push(`/dashboard/${fileId}/${quizId}`);
        },
      }
    );
  };

  form.watch();

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Quiz Creation</CardTitle>

        <CardDescription></CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a topic..." {...field} />
                  </FormControl>
                  <FormDescription>Please provide a topic</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Questions</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter an amount..."
                      {...field}
                      type="number"
                      min={1}
                      max={10}
                      onChange={(e) =>
                        form.setValue("amount", parseInt(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Please provide a number of questions
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={isPending}
              type="submit"
              className="cursor-pointer w-full"
            >
              {isPending ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default QuizCreation;
