/**
 * AI Summarization API Endpoint
 * Generates concise AI summaries of search results
 *
 * POST /api/search/summarize
 * Body: { title: string, content: string, type: string }
 * Returns: { summary: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { AnthropicProvider } from "@/lib/ai/anthropic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, type } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Initialize Anthropic provider
    const anthropic = new AnthropicProvider();

    // Generate summary using Claude
    const response = await anthropic.generate({
      model: "claude-sonnet-4-20250514",
      messages: [
        {
          role: "user",
          content: `Please provide a concise 2-3 sentence summary of the following ${type || "content"}:

Title: ${title}

Content: ${content || "No additional content available."}

Requirements:
- Keep the summary under 100 words
- Focus on the key points and main takeaways
- Use clear, professional language
- Make it actionable for someone searching for information`,
        },
      ],
      systemPrompt:
        "You are an AI assistant that creates concise, informative summaries of enterprise content. Your summaries help employees quickly understand the relevance and key points of search results.",
      maxTokens: 256,
      temperature: 0.3,
    });

    return NextResponse.json({
      summary: response.content,
      model: response.model,
      usage: response.usage,
    });
  } catch (error) {
    console.error("Summarization error:", error);

    // Return a fallback summary on error
    return NextResponse.json(
      {
        error: "Summarization failed",
        fallback: true,
      },
      { status: 500 }
    );
  }
}
