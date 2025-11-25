import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Navigation } from "@/components/Navigation";
import { ArrowLeft, ChevronRight, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DetailedStep {
  step: string;
  explanation: string;
}

interface Problem {
  id: string;
  question: string;
  answer: string;
  hint: string;
  detailedSolution: DetailedStep[];
}

// Sample problems - in production, these would come from an AI service
const sampleProblems: Problem[] = [
  {
    id: "ex1",
    question: "Solve for $x$: $2x + 5 = 15$",
    answer: "5",
    hint: "Start by subtracting 5 from both sides to isolate the term with x.",
    detailedSolution: [
      { step: "$2x + 5 = 15$", explanation: "Original equation" },
      { step: "$2x = 10$", explanation: "Subtract 5 from both sides" },
      { step: "$x = 5$", explanation: "Divide both sides by 2" },
    ],
  },
  {
    id: "ex2",
    question: "Expand: $(x + 3)(x - 2)$",
    answer: "x^2 + x - 6",
    hint: "Use the FOIL method: multiply First, Outer, Inner, Last terms.",
    detailedSolution: [
      { step: "$(x + 3)(x - 2)$", explanation: "Original expression" },
      { step: "$x \\cdot x + x \\cdot (-2) + 3 \\cdot x + 3 \\cdot (-2)$", explanation: "Apply FOIL method" },
      { step: "$x^2 - 2x + 3x - 6$", explanation: "Multiply each term" },
      { step: "$x^2 + x - 6$", explanation: "Combine like terms" },
    ],
  },
  {
    id: "ex3",
    question: "Factor: $x^2 + 7x + 12$",
    answer: "(x + 3)(x + 4)",
    hint: "Look for two numbers that multiply to 12 and add to 7.",
    detailedSolution: [
      { step: "$x^2 + 7x + 12$", explanation: "Original expression" },
      { step: "Find factors of 12 that add to 7: 3 and 4", explanation: "3 × 4 = 12 and 3 + 4 = 7" },
      { step: "$(x + 3)(x + 4)$", explanation: "Write as product of binomials" },
    ],
  },
];

const Exercise = () => {
  const [currentProblem, setCurrentProblem] = useState<Problem>(sampleProblems[0]);
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [problemIndex, setProblemIndex] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkAnswer = () => {
    const normalizedUserAnswer = userAnswer.trim().toLowerCase().replace(/\s+/g, "");
    const normalizedCorrectAnswer = currentProblem.answer.toLowerCase().replace(/\s+/g, "");

    if (normalizedUserAnswer === normalizedCorrectAnswer) {
      setIsCorrect(true);
      toast({
        title: "Correct!",
        description: "Great job! You got it right.",
      });
    } else {
      setIsCorrect(false);
      toast({
        title: "Not quite right",
        description: "Try again or view the hint/solution.",
        variant: "destructive",
      });
    }
  };

  const nextProblem = () => {
    const nextIndex = (problemIndex + 1) % sampleProblems.length;
    setProblemIndex(nextIndex);
    setCurrentProblem(sampleProblems[nextIndex]);
    setUserAnswer("");
    setShowHint(false);
    setShowSolution(false);
    setIsCorrect(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Practice Exercises</h1>
          <p className="text-muted-foreground">Apply what you've learned</p>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Problem {problemIndex + 1} of {sampleProblems.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {currentProblem.question}
              </ReactMarkdown>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Enter your answer..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                  className="flex-1"
                  disabled={isCorrect === true}
                />
                <Button onClick={checkAnswer} disabled={isCorrect === true || !userAnswer}>
                  Check Answer
                </Button>
              </div>

              {isCorrect !== null && (
                <div className={`p-4 rounded-lg ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                  <p className={`font-medium ${isCorrect ? "text-green-800" : "text-red-800"}`}>
                    {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  {showHint ? "Hide Hint" : "Show Hint"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSolution(!showSolution)}
                >
                  {showSolution ? "Hide Solution" : "Show Solution"}
                </Button>
              </div>

              {showHint && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <p className="text-sm text-blue-900">{currentProblem.hint}</p>
                  </CardContent>
                </Card>
              )}

              {showSolution && (
                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-6 space-y-4">
                    <h4 className="font-semibold text-purple-900">Detailed Solution:</h4>
                    {currentProblem.detailedSolution.map((step, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {step.step}
                          </ReactMarkdown>
                        </div>
                        <p className="text-sm text-purple-800 italic">{step.explanation}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {isCorrect && (
                <Button onClick={nextProblem} className="w-full gap-2" size="lg">
                  Next Problem
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Exercise;
