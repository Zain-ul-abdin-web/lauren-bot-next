import { ChatOpenAI } from "langchain/chat_models/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { getVectorStore } from "./vector-store";
import { getPineconeClient } from "./pinecone-client";
import { formatChatHistory } from "./utils";

const CONDENSE_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_TEMPLATE = `You are an enthusiastic AI assistant. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

{context}

Question: {question}
Helpful answer in markdown:`;

function makeChain(vectorstore: PineconeStore) {
  const streamingModel = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0,
    verbose: true,
  });
  const nonStreamingModel = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    verbose: true,
    temperature: 0,
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    nonStreamingModel,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_TEMPLATE,
      questionGeneratorTemplate: CONDENSE_TEMPLATE,
      returnSourceDocuments: true,
      questionGeneratorChainOptions: {
        llm: nonStreamingModel,
      },
    }
  );
  return chain;
}

type callChainArgs = {
  question: string;
  chatHistory: [string, string][];
};

export async function callChain({ question, chatHistory }: callChainArgs) {
  try {
    const sanitizedQuestion = question.trim().replaceAll("\n", " ");
    const pineconeClient = await getPineconeClient();
    const vectorStore = await getVectorStore(pineconeClient);
    const chain = makeChain(vectorStore);
    const formattedChatHistory = formatChatHistory(chatHistory);

    const res = await chain.call({
      question: sanitizedQuestion,
      chat_history: formattedChatHistory,
    });

    const sourceDocuments = res?.sourceDocuments;
    const firstTwoDocuments = sourceDocuments.slice(0, 2);
    const pageContents = firstTwoDocuments.map(
      ({ pageContent }: { pageContent: string }) => pageContent
    );
    const stringifiedPageContents = JSON.stringify(pageContents);

    return stringifiedPageContents;
  } catch (e) {
    console.error(e);
    throw new Error("Call chain method failed to execute successfully!!");
  }
}