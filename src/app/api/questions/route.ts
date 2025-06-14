import { db } from "@/db";
import { strict_output } from "@/lib/googleai";
import { pinecone } from "@/lib/pinecone";
import { quizCreationSchema } from "@/schemas/form/quiz";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { amount, topic, fileId } = quizCreationSchema.parse(body);

    const file = await db.file.findFirst({
      where: {
        id: fileId,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_AI_KEY,
      model: "text-embedding-004",
    });

    const pineconeIndex = pinecone.Index("pdfer");
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: file.id,
    });

    const results = await vectorStore.similaritySearch(topic, 4);
    const context = results.map((r) => r.pageContent).join("\n\n");

    const questions = await strict_output(
      `You are a helpful AI that generates mcq questions and answers based on the provided PDF context. The length of each answer and options should not exceed 15 words. Output a single JSON array with exactly ${amount} objects, one object per question.`,
      new Array(amount).fill(
        `You are to generate a random mcq question about ${topic} based on the following PDF context: ${context}.`
      ),
      {
        question: "question",
        answer: "answer with max length of 15 words",
        option1: "1st option with max length of 15 words",
        option2: "2st option with max length of 15 words",
        option3: "3st option with max length of 15 words",
      }
    );

    return NextResponse.json({ questions: questions }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: `An unexpected error occured in /api/question: ${error}` },
        { status: 500 }
      );
    }
  }
};
