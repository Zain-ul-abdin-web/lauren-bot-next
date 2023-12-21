"use client";

import { useRef, useState } from "react";
import { InputMessage } from "./input-message";
import { scrollToBottom, initialMessage } from "@/lib/utils";
import { ChatLine } from "./chat-line";
import { Message } from "@/types/message";

export function Chat() {
  const endpoint = "/api/chat";
  const [input, setInput] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessage);
  const [chatHistory, setChatHistory] = useState<[string, string][]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const updateMessages = (message: Message) => {
    setMessages((previousMessages) => [...previousMessages, message]);
    setTimeout(() => scrollToBottom(containerRef), 100);
  };

  const updateChatHistory = (question: string, answer: string) => {
    setChatHistory((previousHistory) => [
      ...previousHistory,
      [question, answer],
    ]);
  };

  // send message to API /api/chat endpoint
  const sendQuestion = async (question: string) => {
    setIsLoading(true);
    updateMessages({ role: "user", content: question });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          chatHistory,
        }),
      });
      if (!response.ok) {
        throw new Error("Something went wrong");
      }
      const res = await response.json();
      console.log(res)
      updateMessages({ role: "assistant", content: res.content, source: res.source });
      updateChatHistory(question, res.content);
    } catch (error) {
      updateMessages({ role: "assistant", content: "Somthing went wrong" });
    } finally {
      setIsLoading(false);
    }
  };

  let placeholder = "Type a message to start ...";

  return (
    <div className="rounded-2xl border h-full w-full flex flex-col justify-between">
      <div className="p-6 overflow-auto flex-1" ref={containerRef}>
        {messages.map(({ content, role, source }, index) => (
          <ChatLine
            key={index}
            role={role}
            content={content}
            source={source}
          />
        ))}
      </div>

      <InputMessage
        input={input}
        setInput={setInput}
        sendMessage={sendQuestion}
        placeholder={placeholder}
        isLoading={isLoading}
      />
    </div>
  );
}
