"use client";

import { useState } from "react";
import { generateId } from "ai";
import { continueConversation } from "./actions";
import {
  BotMessageSquareIcon,
  Loader2Icon,
  MessageSquareTextIcon,
} from "lucide-react";
import type { MessageType } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState<string>("");
  const [conversation, setConversation] = useState<MessageType[]>([]);

  return (
    <div className="w-full flex flex-col items-center p-8 pb-24">
      <div className="max-w-screen-lg mx-auto w-full flex flex-col gap-12">
        {conversation.map((message: MessageType) => (
          <div key={message.id} className="grid grid-cols-[48px_1fr] gap-4">
            <div className="size-12 shrink-0 flex items-center justify-center bg-background rounded-lg">
              {message.role === "assistant" ? (
                <BotMessageSquareIcon size={24} />
              ) : (
                <MessageSquareTextIcon size={24} />
              )}
            </div>
            <div>
              {typeof message.content === "string" ? (
                <p className="">{message.content}</p>
              ) : (
                <div className="bg-card px-5 py-4 rounded-lg flex flex-col gap-4">
                  <h2 className="text-xl font-medium">Ingredients</h2>
                  <ul className="flex flex-col">
                    {message.content.ingredients.map((ingredient) => (
                      <li key={ingredient.id}>
                        {ingredient.name} -{" "}
                        <span className="text-gray-400">
                          {ingredient.amountMetric}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-4">
                    <h2 className="text-xl font-medium">Instructions</h2>
                    <ul className="flex flex-col gap-4">
                      {message.content.steps.map((step, idx) => (
                        <div key={step.content} className="flex flex-col">
                          <p>
                            {idx + 1}. {step.content}
                          </p>
                          {step.ingredients.length > 0 ? (
                            <div className="text-xs flex flex-col gap-1 bg-secondary   p-2 rounded-md">
                              {step.ingredients.map((ingredient) => {
                                return (
                                  <span key={ingredient.name} className="">
                                    {ingredient.name} -{" "}
                                    <span>{ingredient.amountMetric}</span>
                                  </span>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon size={24} className="animate-spin" />
          </div>
        ) : null}
      </div>
      <div className="fixed bottom-0 w-full max-w-md mx-auto mb-8 flex items-center gap-2">
        <Input
          className="w-full"
          value={input}
          placeholder="Ask for a recipe..."
          onChange={(e) => setInput(e.target.value)}
        />
        <Button
          onClick={async () => {
            setLoading(true);
            setConversation((currentConversation: MessageType[]) => [
              ...currentConversation,
              {
                id: generateId(),
                role: "user",
                content: input,
              },
            ]);
            try {
              const messages = await continueConversation([
                ...conversation,
                { id: generateId(), role: "user", content: input },
              ]);

              setConversation(messages);
              setInput("");
              setLoading(false);
            } catch (err) {
              console.error(err);
              setLoading(false);
            }
          }}
        >
          Send Message
        </Button>
      </div>
    </div>
  );
}
