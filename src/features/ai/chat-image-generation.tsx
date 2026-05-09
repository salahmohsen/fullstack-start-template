import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowUpIcon, StopCircleIcon } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Suggestion card component
function ChatWelcome({ onSelectSuggestion }: { onSelectSuggestion: (suggestion: string) => void }) {
  const suggestions = [
    {
      title: "App Features",
      description: "Learn how to use the AI features",
      prompt: "How do I use the AI features in this app?",
    },
    {
      title: "Generate Images",
      description: "Create AI-generated artwork",
      prompt: "Can you generate an image of a mountain landscape?",
    },
    {
      title: "Creative Writing",
      description: "Get help with writing tasks",
      prompt: "Write me a short poem about technology",
    },
    {
      title: "AI Trends",
      description: "Explore current AI developments",
      prompt: "What are the latest AI trends in 2024?",
    },
  ];

  return (
    <div className="mt-12 flex flex-col items-center justify-center space-y-6">
      <h3 className="text-xl font-medium">How can I help you today?</h3>
      <div className="grid w-full max-w-lg grid-cols-2 gap-3">
        {suggestions.map((suggestion) => (
          <button
            className="cursor-pointer rounded-lg border p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
            key={suggestion.title}
            onClick={() => onSelectSuggestion(suggestion.prompt)}
            type="button"
          >
            <p className="font-medium">{suggestion.title}</p>
            <p className="text-sm text-gray-500">{suggestion.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat/image/generation",
    }),
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSelectSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll when status changes
  useEffect(() => {
    if (status === "streaming") {
      scrollToBottom();
    }
  }, [status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="relative flex w-full flex-col items-center justify-center gap-4">
      <div className="mx-auto mb-20 w-full max-w-2xl space-y-4 overflow-y-auto">
        {messages.length > 0 ? (
          messages.map((m) => (
            <div className="whitespace-pre-wrap" key={m.id}>
              <div key={m.id}>
                <div className="font-bold">{m.role}</div>
                <div>
                  {m.parts.map((part, index) => {
                    console.log("🔑 Part", part);

                    if (part.type === "text") {
                      return <p key={index}>{part.text}</p>;
                    }

                    // Handle new v5 tool pattern - tools are prefixed with 'tool-'
                    if (part.type === "tool-generateImage") {
                      const toolPart = part as any; // Type assertion for tool part
                      const { toolCallId, state } = toolPart;

                      // Tool is completed and has output
                      if (state === "output-available" && toolPart.output) {
                        const output = toolPart.output as { image: string; prompt?: string };
                        const input = toolPart.input as { prompt?: string };

                        return (
                          <img
                            alt={input?.prompt || "Generated image"}
                            className="rounded-lg shadow-lg"
                            height={400}
                            key={toolCallId}
                            onLoad={scrollToBottom}
                            src={`data:image/png;base64,${output.image}`}
                            width={400}
                          />
                        );
                      }

                      // Tool is still processing (input streaming, input available, etc.)
                      return (
                        <div className="animate-pulse rounded-lg bg-gray-100 p-4" key={toolCallId}>
                          <div className="flex items-center space-x-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-500" />
                            <span className="text-gray-600">
                              {state === "input-streaming" && "Preparing image generation..."}
                              {state === "input-available" && "Starting image generation..."}
                              {state === "output-available" && "Generating image..."}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    // Handle step indicators
                    if (part.type === "step-start") {
                      return null; // Don't render step indicators for cleaner UI
                    }

                    return null;
                  })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <ChatWelcome onSelectSuggestion={handleSelectSuggestion} />
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        className="relative flex w-full max-w-xl flex-col items-center justify-center"
        onSubmit={handleSubmit}
      >
        <div className="fixed bottom-0 z-10 mb-8 w-full max-w-lg bg-background">
          <div className="relative flex flex-row items-center justify-between">
            <Textarea
              autoFocus
              className="w-full rounded border border-gray-300 p-2 pr-10 shadow-xl"
              data-testid="multimodal-input"
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) {
                    handleSubmit(e);
                  }
                }
              }}
              placeholder="Send a message..."
              ref={textareaRef}
              rows={1}
              value={input}
            />
            <div className="absolute right-2">
              {status === "streaming" ? (
                <StopButton stop={stop} />
              ) : (
                <SendButton input={input} submitForm={handleSubmit} uploadQueue={[]} />
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function PureStopButton({ stop }: { stop: () => void }) {
  return (
    <Button
      className="h-fit rounded-full border p-1.5 dark:border-zinc-600"
      data-testid="stop-button"
      onClick={(event) => {
        event.preventDefault();
        stop();
      }}
    >
      <StopCircleIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: (e: React.FormEvent) => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  return (
    <Button
      className="h-fit rounded-full border p-1.5 dark:border-zinc-600"
      data-testid="send-button"
      disabled={!input || input.length === 0 || uploadQueue.length > 0}
      onClick={(event) => {
        event.preventDefault();
        submitForm(event as React.FormEvent);
      }}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length) return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});
