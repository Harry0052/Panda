import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  getProfile,
  getSession,
  getSessionMessages,
  addMessage,
  updateSession,
} from "@/db/queries";
import { checkForAchievements } from "@/lib/adaptive-engine";
import {
  assembleTutorContext,
  buildDeepSystemPrompt,
  processInteraction,
} from "@/lib/learner-brain";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileId, sessionId, message, subject, subtopic } = body as {
      profileId: string;
      sessionId: string;
      message: string;
      subject?: string;
      subtopic?: string;
    };

    if (!profileId || !sessionId || !message) {
      return NextResponse.json(
        { error: "profileId, sessionId, and message are required" },
        { status: 400 }
      );
    }

    const profile = getProfile(profileId);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // ── Assemble deep learner context ──
    const tutorContext = assembleTutorContext(
      profile,
      sessionId,
      subject || session.subject || undefined,
      subtopic,
    );

    // ── Build the deep system prompt ──
    const systemPrompt = buildDeepSystemPrompt(tutorContext);

    // Record the user's message as an interaction event
    processInteraction({
      profileId,
      sessionId,
      eventType: "message",
      subject: subject || session.subject || undefined,
      subtopic,
      responseLatencyMs: 0,
    });

    // Get conversation history
    const previousMessages = getSessionMessages(sessionId);
    const conversationHistory: OpenAI.ChatCompletionMessageParam[] = previousMessages.map(
      (msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })
    );

    // Save user message to DB
    addMessage(sessionId, profileId, "user", message, "text", {
      subject: subject || session.subject || undefined,
      adaptation: {
        level: tutorContext.adaptation.difficultyLevel,
        format: tutorContext.adaptation.format,
        tone: tutorContext.adaptation.tone,
      },
    });

    // Build messages array for OpenAI
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    // Calibrate temperature based on adaptation
    const temperature = tutorContext.adaptation.challengeMode ? 0.9
      : tutorContext.adaptation.reviewMode ? 0.6
      : 0.8;

    // Stream the response
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      stream: true,
      temperature,
      max_tokens: 1024,
      presence_penalty: 0.3,
      frequency_penalty: 0.2,
    });

    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              fullResponse += delta;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "content", content: delta })}\n\n`)
              );
            }

            if (chunk.choices[0]?.finish_reason) {
              // Save assistant message with adaptation metadata
              addMessage(sessionId, profileId, "assistant", fullResponse, "text", {
                subject: subject || session.subject || undefined,
                model: "gpt-4o-mini",
                adaptation: {
                  level: tutorContext.adaptation.difficultyLevel,
                  format: tutorContext.adaptation.format,
                  tone: tutorContext.adaptation.tone,
                  scaffolding: tutorContext.adaptation.scaffoldingLevel,
                  misconceptionTarget: tutorContext.adaptation.misconceptionRemediation,
                },
                explainability: {
                  reasonDifficulty: tutorContext.explainability.reasonDifficulty,
                  reasonFormat: tutorContext.explainability.reasonFormat,
                  keySignals: tutorContext.explainability.keySignals,
                },
              });

              // Update session metadata
              const currentSubject = subject || session.subject;
              if (currentSubject) {
                const topicsCovered = [...new Set([...session.topics_covered, currentSubject])];
                updateSession(sessionId, { topics_covered: topicsCovered });
              }

              // Record the assistant response as a productive interaction
              if (currentSubject) {
                try {
                  processInteraction({
                    profileId,
                    sessionId,
                    eventType: "answer",
                    subject: currentSubject,
                    subtopic: subtopic || currentSubject,
                    wasCorrect: true, // productive interaction
                    difficulty: tutorContext.adaptation.complexityLevel,
                    formatUsed: tutorContext.adaptation.format,
                    engagementSignals: ["completed_exchange"],
                  });
                } catch {
                  // Non-critical
                }
              }

              // Check achievements
              try {
                await checkForAchievements(profileId);
              } catch {
                // Non-critical
              }

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "done",
                    sessionId,
                    messageCount: session.messages_count + 2,
                    adaptation: {
                      level: tutorContext.adaptation.difficultyLevel,
                      tone: tutorContext.adaptation.tone,
                    },
                  })}\n\n`
                )
              );
            }
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", error: errorMessage })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
