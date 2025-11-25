import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Lightbulb, PartyPopper, BookOpen, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { toast } from "sonner";
import { useLearningPlan } from "@/hooks/useLearningPlan";
import { useTaskProgress } from "@/hooks/useTaskProgress";
import { SessionManager } from "@/lib/sessionManager";
import { supabase } from "@/integrations/supabase/client";
import { ExerciseSolutionQuestion } from "@/components/ExerciseSolutionQuestion";
import { mistakeStorage } from "@/lib/mistakeStorage";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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

// Topic-specific problem pools
const problemsByTopic: Record<string, Problem[]> = {
  "9-polynomials": [
    {
      id: "poly1",
      question: "Simplify by combining like terms: $5x^2 + 3x - 2x^2 + 7x - 4$",
      answer: "3x^2 + 10x - 4",
      hint: "Group terms with the same power of x together.",
      detailedSolution: [
        { step: "$5x^2 + 3x - 2x^2 + 7x - 4$", explanation: "Original expression with mixed terms" },
        { step: "$(5x^2 - 2x^2) + (3x + 7x) - 4$", explanation: "Group like terms: $x^2$ terms together, $x$ terms together" },
        { step: "$3x^2 + 10x - 4$", explanation: "Combine coefficients: $5-2=3$ for $x^2$, $3+7=10$ for $x$" },
      ],
    },
    {
      id: "poly2",
      question: "Expand: $(x + 4)(x + 3)$",
      answer: "x^2 + 7x + 12",
      hint: "Use FOIL: First, Outer, Inner, Last.",
      detailedSolution: [
        { step: "$(x + 4)(x + 3)$", explanation: "Two binomials to multiply together" },
        { step: "$x \\cdot x + x \\cdot 3 + 4 \\cdot x + 4 \\cdot 3$", explanation: "Apply FOIL method: multiply each term in first by each term in second" },
        { step: "$x^2 + 3x + 4x + 12$", explanation: "Perform each multiplication" },
        { step: "$x^2 + 7x + 12$", explanation: "Combine like terms: $3x + 4x = 7x$" },
      ],
    },
    {
      id: "poly3",
      question: "Calculate $(x - 2)^2$ using the special product formula",
      answer: "x^2 - 4x + 4",
      hint: "Use the pattern $(a - b)^2 = a^2 - 2ab + b^2$",
      detailedSolution: [
        { step: "$(x - 2)^2$", explanation: "Square of a binomial" },
        { step: "Apply: $(a - b)^2 = a^2 - 2ab + b^2$ where $a=x, b=2$", explanation: "Use the special product formula for square of difference" },
        { step: "$x^2 - 2(x)(2) + 2^2$", explanation: "Substitute values: $a^2 = x^2$, $2ab = 2(x)(2) = 4x$, $b^2 = 4$" },
        { step: "$x^2 - 4x + 4$", explanation: "Simplify to get final expanded form" },
      ],
    },
    {
      id: "poly4",
      question: "Add the polynomials: $(3x^2 - 2x + 1) + (x^2 + 5x - 3)$",
      answer: "4x^2 + 3x - 2",
      hint: "Combine terms with the same degree.",
      detailedSolution: [
        { step: "$(3x^2 - 2x + 1) + (x^2 + 5x - 3)$", explanation: "Two polynomials to add" },
        { step: "$3x^2 + x^2 - 2x + 5x + 1 - 3$", explanation: "Remove parentheses and rearrange to group like terms" },
        { step: "$(3x^2 + x^2) + (-2x + 5x) + (1 - 3)$", explanation: "Group terms by degree" },
        { step: "$4x^2 + 3x - 2$", explanation: "Add coefficients: $3+1=4$, $-2+5=3$, $1-3=-2$" },
      ],
    },
    {
      id: "poly5",
      question: "Multiply: $2x(3x^2 - x + 4)$",
      answer: "6x^3 - 2x^2 + 8x",
      hint: "Distribute 2x to each term inside the parentheses.",
      detailedSolution: [
        { step: "$2x(3x^2 - x + 4)$", explanation: "Monomial times polynomial - use distributive property" },
        { step: "$2x \\cdot 3x^2 + 2x \\cdot (-x) + 2x \\cdot 4$", explanation: "Distribute $2x$ to each term" },
        { step: "$6x^3 - 2x^2 + 8x$", explanation: "Multiply coefficients and add exponents: $2 \\cdot 3 = 6$, $x \\cdot x^2 = x^3$" },
      ],
    },
  ],
  "9-quadratics": [
    {
      id: "quad1",
      question: "Solve by factoring: $x^2 + 5x + 6 = 0$",
      answer: "-2,-3",
      hint: "Find two numbers that multiply to 6 and add to 5.",
      detailedSolution: [
        { step: "$x^2 + 5x + 6 = 0$", explanation: "Quadratic equation in standard form" },
        { step: "$(x + 2)(x + 3) = 0$", explanation: "Factor: need two numbers that multiply to 6 and add to 5, which are 2 and 3" },
        { step: "$x + 2 = 0$ or $x + 3 = 0$", explanation: "Use zero product property: if product equals zero, one factor must be zero" },
        { step: "$x = -2$ or $x = -3$", explanation: "Solve each equation: subtract 2 from first, subtract 3 from second" },
      ],
    },
    {
      id: "quad2",
      question: "Solve using the quadratic formula: $x^2 - 4x + 3 = 0$",
      answer: "1,3",
      hint: "Use $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$ with $a=1, b=-4, c=3$",
      detailedSolution: [
        { step: "Identify: $a=1, b=-4, c=3$", explanation: "Coefficients from standard form $ax^2 + bx + c = 0$" },
        { step: "$\\Delta = (-4)^2 - 4(1)(3) = 16 - 12 = 4$", explanation: "Calculate discriminant to check for real solutions" },
        { step: "$x = \\frac{-(-4) \\pm \\sqrt{4}}{2(1)} = \\frac{4 \\pm 2}{2}$", explanation: "Substitute into quadratic formula" },
        { step: "$x = \\frac{4 + 2}{2} = 3$ or $x = \\frac{4 - 2}{2} = 1$", explanation: "Evaluate both solutions from $\\pm$" },
      ],
    },
    {
      id: "quad3",
      question: "Factor completely: $2x^2 + 7x + 3$",
      answer: "(2x + 1)(x + 3)",
      hint: "Look for factors of $2 \\times 3 = 6$ that add to 7.",
      detailedSolution: [
        { step: "$2x^2 + 7x + 3$", explanation: "Quadratic with leading coefficient not equal to 1" },
        { step: "Find factors of $2 \\times 3 = 6$ that add to 7: 6 and 1", explanation: "Use AC method: multiply $a$ and $c$, find factors that add to $b$" },
        { step: "$2x^2 + 6x + x + 3$", explanation: "Split middle term: $7x = 6x + x$" },
        { step: "$2x(x + 3) + 1(x + 3) = (2x + 1)(x + 3)$", explanation: "Factor by grouping: factor out common terms from pairs" },
      ],
    },
    {
      id: "quad4",
      question: "Complete the square: $x^2 + 6x = 7$",
      answer: "1,-7",
      hint: "Add $(\\frac{6}{2})^2$ to both sides.",
      detailedSolution: [
        { step: "$x^2 + 6x = 7$", explanation: "Equation not in standard form, constant on right side" },
        { step: "$x^2 + 6x + 9 = 7 + 9$", explanation: "Complete the square: add $(\\frac{b}{2})^2 = (\\frac{6}{2})^2 = 9$ to both sides" },
        { step: "$(x + 3)^2 = 16$", explanation: "Left side is perfect square: $(x + 3)^2$. Right side: $7 + 9 = 16$" },
        { step: "$x + 3 = \\pm 4$", explanation: "Take square root of both sides (don't forget $\\pm$)" },
        { step: "$x = -3 + 4 = 1$ or $x = -3 - 4 = -7$", explanation: "Solve for $x$: subtract 3 from both cases" },
      ],
    },
  ],
};

const Exercise = () => {
  const navigate = useNavigate();
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [selectedIncorrectSteps, setSelectedIncorrectSteps] = useState<number[]>([]);
  const { tasks, markTaskComplete } = useLearningPlan();
  const { incrementExercise } = useTaskProgress();

  // Get current task to determine topic
  const currentTask = tasks.find(t => {
    const taskDate = new Date(t.scheduled_date);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString() && !t.is_completed;
  });

  // Determine which problem set to use based on task topic
  const topicId = currentTask?.title.toLowerCase().includes('polynomial') 
    ? '9-polynomials' 
    : '9-quadratics';
  
  const sampleProblems = problemsByTopic[topicId] || problemsByTopic['9-quadratics'];
  const currentProblem = sampleProblems[currentProblemIndex];
  const isAllComplete = completedCount >= 4;

  const getNextTask = () => {
    const incompleteTasks = tasks
      .filter(t => !t.is_completed)
      .sort((a, b) => a.day_number - b.day_number);
    return incompleteTasks[0] || null;
  };

  const handleKeepLearning = () => {
    const nextTask = getNextTask();
    if (nextTask) {
      localStorage.setItem('currentTaskId', nextTask.id);
      navigate('/learn');
    }
  };

  const goToNextQuestion = async () => {
    if (completedCount >= 4) {
      return; // Already completed all exercises
    }

    // Save mistake if any steps were marked incorrect
    if (selectedIncorrectSteps.length > 0) {
      const todayTask = tasks.find(t => {
        const taskDate = new Date(t.scheduled_date);
        const today = new Date();
        return taskDate.toDateString() === today.toDateString() && !t.is_completed;
      });

      mistakeStorage.add({
        type: 'exercise',
        problem: currentProblem.question,
        topic: todayTask?.title || topicId,
        incorrectSteps: selectedIncorrectSteps,
        stepDetails: currentProblem.detailedSolution,
      });
    }

    // Increment exercise count
    const newCount = completedCount + 1;
    setCompletedCount(newCount);

    // Save progress to database
    const sessionId = SessionManager.getSession();
    if (sessionId && tasks.length > 0) {
      const todayTask = tasks.find(t => {
        const taskDate = new Date(t.scheduled_date);
        const today = new Date();
        return taskDate.toDateString() === today.toDateString() && !t.is_completed;
      });

      if (todayTask) {
        try {
          await incrementExercise(todayTask.id);
          
          // If completed all 4 exercises, mark task as complete
          if (newCount >= 4) {
            setIsCompleting(true);
            await markTaskComplete(todayTask.id);
            toast.success("Task completed! Great work!");
            return;
          }
        } catch (error) {
          console.error('Error saving exercise progress:', error);
        }
      }
    }

    // Move to next problem
    if (currentProblemIndex < sampleProblems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
    } else {
      // Loop back if more exercises needed
      setCurrentProblemIndex(0);
    }
    
    setShowHint(false);
    setShowSolution(false);
    setSelectedIncorrectSteps([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex flex-col gap-6">
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/learn?review=true')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Back to Theory
            </Button>
          </div>

          <Card className="p-6">
            {isCompleting || isAllComplete ? (
              <div className="text-center py-12 space-y-6">
                <div className="flex justify-center">
                  <PartyPopper className="h-20 w-20 text-primary animate-bounce" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">Excellent Work!</h2>
                  <p className="text-muted-foreground text-lg">
                    You've completed all 4 exercises.
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {completedCount}/4 Exercises Completed ✓
                </Badge>
                <div className="flex flex-col gap-3 max-w-sm mx-auto pt-4">
                  {getNextTask() && (
                    <Button onClick={handleKeepLearning} size="lg" className="w-full">
                      Keep Learning
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                  <Button onClick={() => navigate('/')} variant="outline" size="lg" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">Practice Exercises</h2>
                  <p className="text-muted-foreground">
                    Solve these problems to reinforce your understanding
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant="secondary">
                      Problem {currentProblemIndex + 1} of {sampleProblems.length}
                    </Badge>
                    <Badge variant="outline">
                      Completed: {completedCount}/4
                    </Badge>
                  </div>
                </div>

                <Card className="p-6 bg-accent/5 border-accent mb-6">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {currentProblem.question}
                    </ReactMarkdown>
                  </div>
                </Card>

                <div className="flex gap-3 mb-4">
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
                  <Card className="p-4 bg-primary/5 border-primary/20 mb-4">
                    <p className="text-sm font-semibold text-primary mb-1">Hint:</p>
                    <p className="text-sm">{currentProblem.hint}</p>
                  </Card>
                )}

                {showSolution && (
                  <>
                    <Card className="p-4 bg-secondary/10 border-secondary/20 mb-4">
                      <p className="text-sm font-semibold mb-3">Detailed Solution:</p>
                      <p className="text-xs text-muted-foreground mb-4">Click any steps you got wrong to mark them as mistakes</p>
                      <div className="space-y-3">
                        {currentProblem.detailedSolution.map((step, idx) => {
                          const isSelected = selectedIncorrectSteps.includes(idx);
                          return (
                            <div 
                              key={idx} 
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedIncorrectSteps(selectedIncorrectSteps.filter(i => i !== idx));
                                } else {
                                  setSelectedIncorrectSteps([...selectedIncorrectSteps, idx]);
                                }
                              }}
                              className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                                isSelected 
                                  ? "border-destructive bg-destructive/5" 
                                  : "border-transparent hover:bg-accent/50"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1">
                                  {isSelected && (
                                    <XCircle className="h-4 w-4 text-destructive shrink-0 mt-1" />
                                  )}
                                  <div className="flex-1 prose prose-sm dark:prose-invert">
                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                      {step.step}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                                <ExerciseSolutionQuestion
                                  problemQuestion={currentProblem.question}
                                  stepContent={step.step}
                                  stepExplanation={step.explanation}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground italic ml-6">{step.explanation}</p>
                            </div>
                          );
                        })}
                      </div>
                    </Card>

                    <Button onClick={goToNextQuestion} className="w-full" size="lg">
                      Go to Next Question
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Exercise;
