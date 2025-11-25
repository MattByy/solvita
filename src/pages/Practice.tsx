import { useState } from "react";
import { Target, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { GradeTopicSelector } from "@/components/GradeTopicSelector";
import { DifficultySelector } from "@/components/DifficultySelector";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

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

const Practice = () => {
  const [selectedGrade, setSelectedGrade] = useState("9");
  const [selectedTopic, setSelectedTopic] = useState("9-quadratics");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [currentProblem, setCurrentProblem] = useState<Problem>(generateProblem("9-quadratics", difficulty));
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  function generateProblem(topicId: string, level: string): Problem {
    const problems: Record<string, Problem[]> = {
      "9-quadratics": [
        {
          id: "q1",
          question: "Solve: $x^2 - 5x + 6 = 0$",
          answer: "2,3",
          hint: "Try factoring first! Look for two numbers that multiply to 6 and add to -5",
          detailedSolution: [
            {
              step: "$x^2 - 5x + 6 = 0$",
              explanation: "We start with our quadratic equation in standard form, where a=1, b=-5, and c=6.",
            },
            {
              step: "$(x - 2)(x - 3) = 0$",
              explanation: "We factor the quadratic by finding two numbers that multiply to give us 6 and add to give us -5. Those numbers are -2 and -3, so we write the factored form.",
            },
            {
              step: "$x - 2 = 0$ or $x - 3 = 0$",
              explanation: "Using the zero product property, if two things multiply to give zero, at least one of them must be zero. So we set each factor equal to zero.",
            },
            {
              step: "$x = 2$ or $x = 3$",
              explanation: "Solving each simple equation gives us our two solutions. We can verify by substituting back: when x=2, we get 4-10+6=0 ✓, and when x=3, we get 9-15+6=0 ✓",
            },
          ],
        },
        {
          id: "q2",
          question: "Solve using the quadratic formula: $2x^2 + 3x - 5 = 0$",
          answer: "1,-2.5",
          hint: "Use the formula: $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$ with a=2, b=3, c=-5",
          detailedSolution: [
            {
              step: "Identify: $a=2, b=3, c=-5$",
              explanation: "First, we identify the coefficients from our equation in standard form ax²+bx+c=0.",
            },
            {
              step: "$\\Delta = b^2 - 4ac = 3^2 - 4(2)(-5) = 9 + 40 = 49$",
              explanation: "We calculate the discriminant (Δ) to understand what kind of solutions we'll get. Since 49 is positive, we'll have two real solutions.",
            },
            {
              step: "$x = \\frac{-3 \\pm \\sqrt{49}}{2(2)} = \\frac{-3 \\pm 7}{4}$",
              explanation: "We substitute all our values into the quadratic formula. The square root of 49 is 7, which makes our calculation simpler.",
            },
            {
              step: "$x = \\frac{-3 + 7}{4} = 1$ or $x = \\frac{-3 - 7}{4} = -2.5$",
              explanation: "We solve for both cases: when we add 7 to -3, we get 4/4 = 1. When we subtract 7 from -3, we get -10/4 = -2.5. These are our two solutions.",
            },
          ],
        },
      ],
      "12-derivatives": [
        {
          id: "d1",
          question: "Find the derivative: $f(x) = 3x^4 - 2x^2 + 5$",
          answer: "12x^3-4x",
          hint: "Apply the power rule to each term separately",
          detailedSolution: [
            {
              step: "$f(x) = 3x^4 - 2x^2 + 5$",
              explanation: "We begin with our function. We'll differentiate each term one at a time using the power rule.",
            },
            {
              step: "$\\frac{d}{dx}[3x^4] = 3 \\cdot 4x^{4-1} = 12x^3$",
              explanation: "For the first term, we use the power rule: multiply by the exponent (4) and reduce the exponent by 1. The coefficient 3 stays in front.",
            },
            {
              step: "$\\frac{d}{dx}[-2x^2] = -2 \\cdot 2x^{2-1} = -4x$",
              explanation: "For the second term, we again use the power rule: multiply by 2 and reduce the exponent to 1. Don't forget to keep the negative sign!",
            },
            {
              step: "$\\frac{d}{dx}[5] = 0$",
              explanation: "Constants have a derivative of zero because they don't change - their rate of change is zero.",
            },
            {
              step: "$f'(x) = 12x^3 - 4x$",
              explanation: "We combine all our individual derivatives using the sum rule. This is our final answer - the derivative of the original function.",
            },
          ],
        },
      ],
    };

    const topicProblems = problems[topicId] || problems["9-quadratics"];
    return topicProblems[Math.floor(Math.random() * topicProblems.length)];
  }

  const checkAnswer = () => {
    const userAns = userAnswer.toLowerCase().replace(/\s/g, "");
    const correctAns = currentProblem.answer.toLowerCase().replace(/\s/g, "");

    setAttempts(attempts + 1);

    if (userAns === correctAns) {
      setIsCorrect(true);
      setCorrectCount(correctCount + 1);
      toast({
        title: "Correct!",
        description: "Excellent work! You got it right.",
      });

      // Save to mistakes tracking if there were attempts
      if (attempts > 0) {
        const mistakes = JSON.parse(localStorage.getItem("mathMistakes") || "[]");
        mistakes.push({
          problem: currentProblem.question,
          attempts: attempts + 1,
          date: new Date().toISOString(),
          topic: selectedTopic,
        });
        localStorage.setItem("mathMistakes", JSON.stringify(mistakes));
      }
    } else {
      setIsCorrect(false);
      toast({
        title: "Not quite right",
        description: "Try again or check the hint!",
        variant: "destructive",
      });
    }
  };

  const nextProblem = () => {
    setCurrentProblem(generateProblem(selectedTopic, difficulty));
    setUserAnswer("");
    setShowHint(false);
    setShowSolution(false);
    setIsCorrect(null);
    setAttempts(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex flex-col gap-6">
          <Navigation />
          
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Practice Mode</h1>
              <p className="text-muted-foreground">
                Score: {correctCount}/{correctCount + (isCorrect === false ? 1 : 0)}
              </p>
            </div>
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
          </div>

        <div className="space-y-6">
          <GradeTopicSelector
            selectedGrade={selectedGrade}
            selectedTopic={selectedTopic}
            onGradeChange={setSelectedGrade}
            onTopicChange={(topic) => {
              setSelectedTopic(topic);
              nextProblem();
            }}
          />

          <Card className="p-6">
            <div className="mb-6">
              <Badge variant="secondary" className="mb-4">
                Problem #{attempts + 1}
              </Badge>
              <div className="prose prose-lg dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {currentProblem.question}
                </ReactMarkdown>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your answer..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                  className="text-lg"
                  disabled={isCorrect === true}
                />
                <Button onClick={checkAnswer} disabled={isCorrect === true || !userAnswer}>
                  Check Answer
                </Button>
              </div>

              {isCorrect !== null && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    isCorrect ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {isCorrect ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">Correct! Well done.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5" />
                      <span className="font-semibold">Incorrect. Try again!</span>
                    </>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowHint(!showHint)} className="flex-1">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {showHint ? "Hide" : "Show"} Hint
                </Button>
                <Button variant="outline" onClick={() => setShowSolution(!showSolution)} className="flex-1">
                  {showSolution ? "Hide" : "Show"} Solution
                </Button>
              </div>

              {showHint && (
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold text-primary mb-1">Hint:</p>
                      <p className="text-sm">{currentProblem.hint}</p>
                    </div>
                  </div>
                </Card>
              )}

              {showSolution && (
                <Card className="p-4 bg-accent/5 border-accent">
                  <h3 className="font-semibold mb-4">Step-by-Step Solution:</h3>
                  <div className="space-y-4">
                    {currentProblem.detailedSolution.map((step, index) => (
                      <div key={index} className="border-l-2 border-primary pl-4">
                        <Badge variant="outline" className="mb-2">
                          Step {index + 1}
                        </Badge>
                        <div className="prose prose-sm dark:prose-invert mb-2">
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {step.step}
                          </ReactMarkdown>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.explanation}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {isCorrect && (
                <Button onClick={nextProblem} className="w-full" size="lg">
                  Next Problem
                </Button>
              )}
            </div>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
