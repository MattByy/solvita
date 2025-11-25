import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Lightbulb, PartyPopper, BookOpen } from "lucide-react";
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
  {
    id: "ex4",
    question: "Simplify: $3(2x - 4) + 5x$",
    answer: "11x - 12",
    hint: "First distribute the 3, then combine like terms.",
    detailedSolution: [
      { step: "$3(2x - 4) + 5x$", explanation: "Original expression" },
      { step: "$6x - 12 + 5x$", explanation: "Distribute 3 to both terms" },
      { step: "$11x - 12$", explanation: "Combine like terms (6x + 5x)" },
    ],
  },
];

const Exercise = () => {
  const navigate = useNavigate();
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const { tasks, markTaskComplete } = useLearningPlan();
  const { incrementExercise } = useTaskProgress();

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
              onClick={() => navigate('/learn')}
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
                      <div className="space-y-3">
                        {currentProblem.detailedSolution.map((step, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 prose prose-sm dark:prose-invert">
                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                  {step.step}
                                </ReactMarkdown>
                              </div>
                              <ExerciseSolutionQuestion
                                problemQuestion={currentProblem.question}
                                stepContent={step.step}
                                stepExplanation={step.explanation}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground italic">{step.explanation}</p>
                          </div>
                        ))}
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
