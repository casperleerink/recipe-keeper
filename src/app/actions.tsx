"use server";

import { getMutableAIState, streamUI } from "ai/rsc";

import { openai } from "@ai-sdk/openai";

import { z } from "zod";
import type { ReactNode } from "react";
import { generateId } from "ai";

const recipeSchema = z.object({
  ingredients: z.array(
    z
      .object({
        id: z.string().describe("A unique identifier of this ingredient"),
        name: z.string().describe("The name of the ingredient."),
        amountMetric: z.string().describe("The amount in metric units"),
      })
      .describe("All the ingredients in the recipe")
  ),
  steps: z.array(
    z.object({
      content: z.string().describe("The step content"),
      ingredients: z.array(
        z
          .object({
            id: z.string().describe("A unique identifier of this ingredient"),
          })
          .describe("The ingredients used in this step")
      ),
    })
  ),
});

export interface ServerMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}

export async function continueConversation(
  input: string
): Promise<ClientMessage> {
  "use server";

  const history = getMutableAIState();

  const result = await streamUI({
    model: openai("gpt-4o-mini"),
    system: "You are a recipe writer.",
    messages: [...history.get(), { role: "user", content: input }],

    text: ({ content, done }) => {
      if (done) {
        history.done((messages: ServerMessage[]) => [
          ...messages,
          { role: "assistant", content },
        ]);
      }
      return <div>{content}</div>;
    },
    tools: {
      recipe: {
        description: "The recipe schema",
        parameters: recipeSchema,
        generate: async function* ({ ingredients, steps }) {
          yield <div>Generating recipe...</div>;
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return (
            <div className="flex flex-col gap-8 px-4 py-5 rounded-xl bg-white shadow-md">
              <div className="flex flex-col gap-4">
                <h2 className="font-medium text-xl">Ingredients</h2>
                <ul className="list-disc list-inside flex flex-col gap-2">
                  {ingredients.map((ingredient) => (
                    <li key={ingredient.id} className="text-gray-800">
                      {ingredient.name} -{" "}
                      <span className="text-gray-400">
                        {ingredient.amountMetric}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-4">
                <h2 className="font-medium text-xl">Steps</h2>
                <ul className="list-disc list-inside flex flex-col gap-2">
                  {steps.map((step) => (
                    <li key={step.content} className="text-gray-800">
                      {step.content}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        },
      },
    },
  });
  return {
    id: generateId(),
    role: "assistant",
    display: result.value,
  };
}
