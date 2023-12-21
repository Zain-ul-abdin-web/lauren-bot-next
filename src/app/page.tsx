"use client"
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { Chat } from "@/components/chat";
import { useState } from "react";

export default function Home() {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1); // Start with first page

  function onDocumentLoadSuccess({ numPages }:any) {
    setNumPages(numPages);
  }
  return (
    <main className="relative container flex h-screen overflow-hidden flex-col">
      <div className=" p-4 flex h-14 items-center justify-between supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <span className="font-bold">Lauren Chat PDF</span>
        <DarkModeToggle />
      </div>
      <div className="flex justify-between flex-1 p-4 gap-4">
        <div className="flex-1">
          <div className="rounded-2xl h-full w-full border">
          <iframe src="https://utfs.io/f/5c2b50ca-c2af-4d5e-92a5-05d3b8ef92c4-oseqcj.pdf" 
          className="w-full h-full rounded-2xl"
          ></iframe>
          </div>
        </div>
        <div className="flex flex-1 max-h-[90vh]">
          <Chat />
        </div>
      </div>
    </main>
  );
}
