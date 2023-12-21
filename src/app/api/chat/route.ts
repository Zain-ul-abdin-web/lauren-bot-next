import { NextResponse } from 'next/server';
import { chain } from "@/utils/chain";
import { formatChatHistory } from '@/lib/utils';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const question: string = body.question;
        const history: [string,string][] = body.history ?? []
        const sanitizedQuestion = question.trim().replaceAll("\n", " ");
        const formatedHistory = formatChatHistory(history)
        console.log(formatedHistory)
        const res = await chain.call({
            question: sanitizedQuestion,
            chat_history: formatedHistory,
        });
        if (res.sourceDocuments.length === 0) {
            return NextResponse.json({ role: "assistant", content: res.text }, { status: 200 })
        }
        const source: {
            pageNumber: number,
            source: string,
        } = {
            pageNumber: res.sourceDocuments[0].metadata["loc.pageNumber"],
            source: res.sourceDocuments[0].metadata.source,
        }
        return NextResponse.json({ role: "assistant", content: res.text, source: source }, { status: 200 })
    } catch (e) {
        console.log(e)
        return NextResponse.json({ error: "Something went wrong." }, { status: 500 })
    }
}