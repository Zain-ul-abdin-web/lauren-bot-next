import { OpenAI } from "langchain/llms/openai";
import { pinecone } from "./pinecone-client";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
const CONDENSE_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_TEMPLATE = `
Start of Conversation Instructions:
Welcome to PDF Explorer, your personal assistant for navigating your PDF database. Please feel free to ask your question, and I’ll provide detailed answers from your PDFs.
Instructions for Answering:
Prioritize delivering detailed, accurate answers directly from the user’s PDF database.
Maintain a clear, informative, and concise tone throughout the conversation.
Your role is to promptly respond to the user’s queries by locating and referencing the relevant information from the PDF database, providing both the answer.
Instructions for Providing Information:
Upon receiving a question, promptly search the PDF database to find the relevant information.
Deliver a detailed answer that directly addresses the user’s query.
Keep the response focused and relevant to the user’s query, avoiding any superfluous information.
After providing the answer, be ready to assist with any follow-up questions or additional information requests.

{context}

Question: {question}
Chat History:
{chat_history}
Helpful answer in markdown:`;

async function initChain() {
    const model = new OpenAI({});

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME ?? '');
    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings({}),
        {
            pineconeIndex: pineconeIndex,
            textKey: 'text',
        },
    );

    return ConversationalRetrievalQAChain.fromLLM(
        model,
        vectorStore.asRetriever({ k: 1 }),
        {
            qaTemplate: QA_TEMPLATE,
            questionGeneratorTemplate: CONDENSE_TEMPLATE,
            returnSourceDocuments: true,
            questionGeneratorChainOptions: {
                llm: model,
                template: CONDENSE_TEMPLATE,
            }
        }
    );
}

export const chain = await initChain()