"use client";

import { useState } from "react";
import { type ClientMessage } from "./actions";
import { useActions, useUIState } from "ai/rsc";
import { generateId } from "ai";
import { BotMessageSquareIcon, MessageSquareTextIcon } from "lucide-react";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [conversation, setConversation] = useUIState();
  const { continueConversation } = useActions();

  return (
    <div className="w-full flex flex-col items-center text-gray-800 bg-gray-50 p-8">
      <div className="max-w-screen-lg mx-auto flex flex-col gap-12">
        {conversation.map((message: ClientMessage) => (
          <div key={message.id} className="grid grid-cols-[48px_1fr] gap-4">
            <div className="size-12 shrink-0 flex items-center justify-center bg-gray-100 rounded-lg">
              {message.role === "assistant" ? (
                <BotMessageSquareIcon size={24} />
              ) : (
                <MessageSquareTextIcon size={24} />
              )}
            </div>
            <div>{message.display}</div>
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 bg-white w-full max-w-md mx-auto mb-8 flex items-center border border-gray-300 rounded-md shadow-xl overflow-hidden px-1">
        <input
          className="bg-transparent border-0 w-full py-2 pl-1 focus-visible:outline-none"
          value={input}
          placeholder="Ask for a recipe..."
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={async () => {
            setConversation((currentConversation: ClientMessage[]) => [
              ...currentConversation,
              { id: generateId(), role: "user", display: input },
            ]);

            const message = await continueConversation(input);

            setConversation((currentConversation: ClientMessage[]) => [
              ...currentConversation,
              message,
            ]);
          }}
          className="shrink-0 py-1 px-2.5 bg-blue-500 text-white rounded"
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
