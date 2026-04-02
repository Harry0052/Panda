"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Sparkles,
  Lightbulb,
  Palette,
  Zap,
  ArrowDown,
  RotateCcw,
  BookOpen,
} from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type SuggestedPrompt = {
  text: string;
  icon: string;
};

export function ChatInterface({
  profileId,
  sessionId,
  profileName,
  suggestedPrompts,
  onSessionUpdate,
}: {
  profileId: string;
  sessionId: string;
  profileName: string;
  suggestedPrompts: SuggestedPrompt[];
  onSessionUpdate?: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          sessionId,
          message: text.trim(),
        }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId ? { ...m, content: fullContent } : m
                    )
                  );
                }
              } catch {
                // Skip malformed chunks
              }
            }
          }
        }
      }

      onSessionUpdate?.();
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Oops! Panda had a little hiccup. Let's try again!" }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const quickActions = [
    { label: "Make it easier", icon: <ArrowDown size={16} />, prompt: "Can you explain that in a simpler way?" },
    { label: "Make it harder", icon: <Zap size={16} />, prompt: "That was easy! Can you give me something harder?" },
    { label: "Draw it", icon: <Palette size={16} />, prompt: "Can you draw a diagram to help me understand?" },
    { label: "Quiz me", icon: <BookOpen size={16} />, prompt: "Quiz me on what we just learned!" },
    { label: "Fun example", icon: <Sparkles size={16} />, prompt: "Can you give me a fun example?" },
    { label: "Show another way", icon: <RotateCcw size={16} />, prompt: "Can you explain this another way?" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F7F5EF]">
      {/* Messages area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="text-7xl mb-6"
            >
              🐼
            </motion.div>
            <h2 className="text-2xl font-bold text-[#2F2F2F] mb-2">
              Hi {profileName}! Ready to learn?
            </h2>
            <p className="text-[#6B7280] mb-8 max-w-md">
              Ask me anything! I can help with math, reading, science, writing, and lots more.
            </p>

            {/* Suggested prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {suggestedPrompts.map((prompt, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => sendMessage(prompt.text)}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white border-2 border-[#E5E2DA] hover:border-[#A8D08D] text-left transition-all shadow-sm"
                >
                  <span className="text-xl">{prompt.icon}</span>
                  <span className="text-sm text-[#2F2F2F]">{prompt.text}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message, i) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-10 h-10 rounded-full bg-[#4F7C57] flex items-center justify-center text-white text-lg flex-shrink-0 shadow-sm">
                    🐼
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-5 py-3 shadow-sm",
                    message.role === "user"
                      ? "bg-[#4F7C57] text-white rounded-br-sm"
                      : "bg-white text-[#2F2F2F] border border-[#E5E2DA] rounded-bl-sm"
                  )}
                >
                  <div className="whitespace-pre-wrap text-base leading-relaxed">
                    {message.content}
                    {message.role === "assistant" && isStreaming && i === messages.length - 1 && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-2 h-5 bg-[#4F7C57] ml-0.5 align-middle rounded-sm"
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Quick actions after assistant message */}
            {messages.length > 0 &&
              messages[messages.length - 1].role === "assistant" &&
              !isStreaming && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-2 flex-wrap pl-13"
                >
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => sendMessage(action.prompt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DDEED5] text-[#4F7C57] text-xs font-medium hover:bg-[#A8D08D] transition-colors"
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </motion.div>
              )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-32 right-6 w-10 h-10 rounded-full bg-white shadow-lg border border-[#E5E2DA] flex items-center justify-center"
          >
            <ArrowDown size={18} className="text-[#6B7280]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="border-t border-[#E5E2DA] bg-white/80 backdrop-blur-sm px-4 md:px-8 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask Panda anything..."
                rows={1}
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-[#E5E2DA] focus:border-[#4F7C57] bg-white text-base outline-none resize-none"
                disabled={isStreaming}
              />
            </div>
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="bg-[#4F7C57] hover:bg-[#3d6345] text-white rounded-2xl h-12 w-12 p-0 shadow-md"
            >
              <Send size={18} />
            </Button>
          </div>
          <p className="text-xs text-[#6B7280] mt-2 text-center">
            Panda is here to help you learn! Ask questions about any subject.
          </p>
        </div>
      </div>
    </div>
  );
}
