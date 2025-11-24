import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Send, Lightbulb, Target } from "lucide-react";
import { MathMessage } from "@/components/MathMessage";
import { DifficultySelector } from "@/components/DifficultySelector";
import { PracticeProblems } from "@/components/PracticeProblems";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hello! I'm your AI Math Tutor. I'm here to help you understand mathematics through clear explanations and practice.\n\nYou can:\n- Ask me to explain any math concept\n- Request practice problems on any topic\n- Get step-by-step solutions\n- Receive hints before full answers\n\nWhat would you like to learn today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [showPractice, setShowPractice] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (in production, this would call an actual AI service)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMathResponse(input, difficulty),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const generateMathResponse = (question: string, level: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    // Detect if asking for practice problems
    if (lowerQuestion.includes("practice") || lowerQuestion.includes("problems")) {
      return `Great! I'll generate some **${level}** practice problems for you.\n\nClick the "Generate Practice" button below to get started with problems tailored to your level.`;
    }
    
    // Example responses for different topics
    if (lowerQuestion.includes("quadratic") || lowerQuestion.includes("x²") || lowerQuestion.includes("x^2")) {
      return `**Understanding Quadratic Equations**\n\nA quadratic equation has the form:\n\n$$ax^2 + bx + c = 0$$\n\nWhere $a \\neq 0$\n\n**Step-by-step solution using the quadratic formula:**\n\n1. **Identify** the coefficients $a$, $b$, and $c$\n2. **Apply** the quadratic formula:\n\n$$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$\n\n3. **Calculate** the discriminant: $\\Delta = b^2 - 4ac$\n   - If $\\Delta > 0$: Two real solutions\n   - If $\\Delta = 0$: One real solution\n   - If $\\Delta < 0$: No real solutions\n\n**Example:** Solve $2x^2 + 5x - 3 = 0$\n\n1. $a = 2$, $b = 5$, $c = -3$\n2. $\\Delta = 5^2 - 4(2)(-3) = 25 + 24 = 49$\n3. $x = \\frac{-5 \\pm \\sqrt{49}}{4} = \\frac{-5 \\pm 7}{4}$\n\nSolutions: $x = \\frac{1}{2}$ or $x = -3$\n\n**Try this:** Solve $x^2 - 4x + 4 = 0$ on your own!`;
    }
    
    if (lowerQuestion.includes("derivative") || lowerQuestion.includes("calculus")) {
      return `**Understanding Derivatives**\n\nThe derivative measures the **rate of change** of a function.\n\n**Basic Rules:**\n\n1. **Power Rule**: $\\frac{d}{dx}[x^n] = nx^{n-1}$\n2. **Constant Rule**: $\\frac{d}{dx}[c] = 0$\n3. **Sum Rule**: $\\frac{d}{dx}[f(x) + g(x)] = f'(x) + g'(x)$\n\n**Example:** Find $\\frac{d}{dx}[3x^4 + 2x^2 - 5x + 1]$\n\n**Step-by-step:**\n\n1. Apply power rule to each term:\n   - $\\frac{d}{dx}[3x^4] = 12x^3$\n   - $\\frac{d}{dx}[2x^2] = 4x$\n   - $\\frac{d}{dx}[-5x] = -5$\n   - $\\frac{d}{dx}[1] = 0$\n\n2. **Combine:** $f'(x) = 12x^3 + 4x - 5$\n\n**Practice:** Try finding the derivative of $f(x) = 5x^3 - 2x + 7$`;
    }
    
    // Generic helpful response
    return `I understand you're asking about: "${question}"\n\n**Let me help you with that!**\n\nI can provide:\n\n1. 📚 **Detailed explanations** with examples\n2. 📝 **Step-by-step solutions** showing all work\n3. 💡 **Helpful hints** before giving answers\n4. 🎯 **Practice problems** at your difficulty level\n\nCould you please provide more details or a specific problem? For example:\n- "Explain how to solve quadratic equations"\n- "Help me with $2x + 5 = 13$"\n- "Give me practice problems on fractions"\n\nI'm here to help you understand, not just give answers!`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">MathTutor AI</h1>
                <p className="text-sm text-muted-foreground">Your personal math learning companion</p>
              </div>
            </div>
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid gap-6">
          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4 border-accent bg-accent/5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Step-by-Step</h3>
                  <p className="text-sm text-muted-foreground">Clear explanations for every problem</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 border-accent bg-accent/5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Practice Mode</h3>
                  <p className="text-sm text-muted-foreground">Custom problems at your level</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 border-accent bg-accent/5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Mistake Tracking</h3>
                  <p className="text-sm text-muted-foreground">Learn from your errors</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Chat Area */}
          <Card className="flex flex-col h-[500px]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <MathMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask a math question or request practice problems..."
                  className="min-h-[60px] resize-none"
                />
                <div className="flex flex-col gap-2">
                  <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon" className="h-[60px] w-[60px]">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => setShowPractice(!showPractice)}
                variant="outline"
                className="w-full mt-2"
              >
                {showPractice ? "Hide" : "Generate"} Practice Problems
              </Button>
            </div>
          </Card>

          {/* Practice Problems Section */}
          {showPractice && <PracticeProblems difficulty={difficulty} />}
        </div>
      </div>
    </div>
  );
};

export default Index;
