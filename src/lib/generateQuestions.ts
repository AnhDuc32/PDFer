import { db } from "@/db";
import { strict_output } from "@/lib/googleai";
import { pinecone } from "@/lib/pinecone";
import { quizCreationSchema } from "@/schemas/form/quiz";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { ZodError } from "zod";

export async function generateQuestions(
  amount: number,
  topic: string,
  fileId: string
) {
  try {
    const {
      amount: parsedAmount,
      topic: parsedTopic,
      fileId: parsedFileId,
    } = quizCreationSchema.parse({
      amount,
      topic,
      fileId,
    });

    const file = await db.file.findFirst({
      where: {
        id: parsedFileId,
      },
    });

    if (!file) {
      throw new Error("File not found");
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

    const results = await vectorStore.similaritySearch(parsedTopic, 4);
    const context = results.map((r) => r.pageContent).join("\n\n");

    const questions = await strict_output(
      `You are a helpful AI that generates mcq questions and answers based on the provided PDF context. The length of each answer and options should not exceed 15 words. Output a single JSON array with exactly ${parsedAmount} objects, one object per question.`,
      new Array(parsedAmount).fill(
        `You are to generate a random mcq question about ${parsedTopic} based on the following PDF context: ${context}.`
      ),
      {
        question: "question",
        answer: "answer with max length of 15 words",
        option1: "1st option with max length of 15 words",
        option2: "2st option with max length of 15 words",
        option3: "3st option with max length of 15 words",
      }
    );

    return { questions };
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(`Validation error: ${error.issues}`);
    } else {
      throw new Error(`An unexpected error occurred: ${error}`);
    }
  }
}
