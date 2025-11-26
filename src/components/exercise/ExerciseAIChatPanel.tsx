import { useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Problem, ChatMessage } from "@/types/exerciseTypes";
import { SessionManager } from "@/lib/sessionManager";

interface ExerciseAIChatPanelProps {
  selectedProblem: Problem | null;
  topic: string;
  onClose: () => void;
}

export const ExerciseAIChatPanel = ({
  selectedProblem,
  topic,
  onClose,
}: ExerciseAIChatPanelProps) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);

  const sendChatMessage = async (message: string) => {
    if (!message.trim() || isSendingChat) return;

    // Add user message immediately
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setChatInput("");
    setIsSendingChat(true);

    try {
      // Get session ID
      const sessionId = SessionManager.getSession();

      const response = await fetch('https://oopsautomation.app.n8n.cloud/webhook-test/chatassuAItheory1421', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Session tracking
          sessionId: sessionId, // Main user session ID
          // User message
          message: message,
          // Problem data - all math expressions are in LaTeX format (use $...$ for inline, $$...$$ for display)
          problem: selectedProblem ? {
            question: selectedProblem.question, // LaTeX format
            hint: selectedProblem.hint, // LaTeX format
            difficulty: selectedProblem.difficulty,
            detailedSolution: selectedProblem.detailedSolution.map(step => ({
              step: step.step, // LaTeX format
              explanation: step.explanation
            })),
            answer: selectedProblem.answer, // LaTeX format
          } : null,
          // Context
          topic: topic,
          chatHistory: chatMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          // Metadata
          timestamp: new Date().toISOString(),
          contentFormat: "latex", // Indicates math expressions are in LaTeX format
        }),
      });

      if (response.ok) {
        const responseText = await response.text();
        try {
          const data = JSON.parse(responseText);
          const aiMessage = data.message || data.response || data.text || data.output || responseText;
          setChatMessages(prev => [...prev, { role: 'ai', content: aiMessage }]);
        } catch {
          setChatMessages(prev => [...prev, { role: 'ai', content: responseText }]);
        }
      } else {
        setChatMessages(prev => [...prev, {
          role: 'ai',
          content: "Sorry, I couldn't process your request. Please try again."
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        role: 'ai',
        content: "Sorry, there was an error connecting to the AI. Please try again."
      }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-[400px] bg-background border-l border-border shadow-xl flex flex-col z-50">
      {/* Chat Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Tutor</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Problem Context */}
      {selectedProblem && (
        <div className="p-3 bg-accent/10 border-b border-border">
          <p className="text-xs text-muted-foreground mb-1">Current Problem:</p>
          <div className="prose prose-sm max-w-none dark:prose-invert text-sm">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {selectedProblem.question}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Ask me anything about this problem!</p>
            <p className="text-xs mt-2">I'll help guide you without giving away the answer.</p>
          </div>
        )}
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent'
              }`}
            >
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isSendingChat && (
          <div className="flex justify-start">
            <div className="bg-accent p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isSendingChat}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && chatInput.trim() && !isSendingChat) {
                sendChatMessage(chatInput);
              }
            }}
          />
          <Button
            onClick={() => sendChatMessage(chatInput)}
            disabled={!chatInput.trim() || isSendingChat}
          >
            {isSendingChat ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
