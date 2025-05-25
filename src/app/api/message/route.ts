import { db } from "@/db";
import { genAI } from "@/lib/googleai";
import { pinecone } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const { id: userId } = user;

  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { fileId, message } = SendMessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) return new Response("Not found", { status: 404 });

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  // vectorize message
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_AI_KEY,
    model: "text-embedding-004",
  });

  const pineconeIndex = pinecone.Index("pdfer");

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace: file.id,
  });

  const results = await vectorStore.similaritySearch(message, 4);

  const prevMessages = await db.message.findMany({
    where: {
      fileId: fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });

  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage ? ("user" as const) : ("model" as const),
    parts: [{ text: msg.text }],
  }));

  // Construct the prompt
  const prompt = `
**INSTRUCTION**: Use the following pieces of context (or previous conversation if needed) to answer the user's question in markdown format. If you don't know the answer, just say that you don't know, don't try to make up an answer.

**PREVIOUS CONVERSATION**:
${formattedPrevMessages
  .map((msg) => {
    if (msg.role === "user") return `User: ${msg.parts[0].text}\n`;
    return `Assistant: ${msg.parts[0].text}\n`;
  })
  .join("")}

**CONTEXT**:
${results.map((r) => r.pageContent).join("\n\n")}

**USER QUESTION**:
${message}
  `;

  // Use a single user message with the combined prompt
  const messages = [
    {
      role: "user",
      parts: [{ text: prompt }],
    },
  ];

  // Use Gemini API for chat completion with streaming
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0,
    },
  });

  const stream = (await model.generateContentStream({
    contents: messages,
  })) as unknown as AsyncIterable<{ text(): string }>;

  // Collect the full response for onCompletion
  let fullResponse = "";

  // Set up the response stream for the client
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.text();
          if (text) {
            fullResponse += text; // Accumulate the response
            controller.enqueue(encoder.encode(text));
          }
        }
        // Save the assistant's response to the database
        await db.message.create({
          data: {
            text: fullResponse,
            isUserMessage: false,
            fileId,
            userId,
          },
        });
        controller.close();
      } catch (error) {
        console.error("Error streaming response:", error);
        controller.error(error);
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
};
