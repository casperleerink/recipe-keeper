"use server";

import { openai } from "@ai-sdk/openai";

import { z } from "zod";
import { generateId, generateObject } from "ai";

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
            name: z.string().describe("The ingredient name"),
            amountMetric: z.string().describe("The amount in metric units"),
          })
          .describe(
            "The ingredients when first used in this step, do not include same ingredients used in subsequent steps"
          )
      ),
    })
  ),
});

type RecipeSchema = z.infer<typeof recipeSchema>;

export interface MessageType {
  id: string;
  role: "user" | "assistant";
  content: RecipeSchema | string;
}

export async function continueConversation(
  history: MessageType[]
): Promise<MessageType[]> {
  "use server";
  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    system: "You are a recipe writer.",
    messages: history.map((message) => ({
      role: message.role,
      content:
        typeof message.content === "string"
          ? message.content
          : JSON.stringify(message.content),
    })),
    schema: recipeSchema,
  });
  return [
    ...history,
    { id: generateId(), role: "assistant", content: result.object },
  ];
}
