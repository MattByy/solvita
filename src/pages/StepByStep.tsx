import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { GradeTopicSelector, curriculumTopics } from "@/components/GradeTopicSelector";
import { StepQuestionDialog } from "@/components/StepQuestionDialog";
import { TheoryQuiz } from "@/components/TheoryQuiz";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface LessonStep {
  title: string;
  explanation: string;
  example?: string;
  tip?: string;
  quizQuestion: QuizQuestion;
}

interface Lesson {
  topicId: string;
  title: string;
  introduction: string;
  steps: LessonStep[];
}

const lessons: Record<string, Lesson> = {
  "9-quadratics": {
    topicId: "9-quadratics",
    title: "Quadratic Equations",
    introduction: "A quadratic equation is a polynomial equation of degree 2. Let's learn how to solve them step by step.",
    steps: [
      {
        title: "Understanding the Standard Form",
        explanation: "Every quadratic equation can be written as $ax^2 + bx + c = 0$. Here, we identify three important parts: the coefficient of $x^2$ (called $a$), the coefficient of $x$ (called $b$), and the constant term (called $c$). It's crucial that $a$ is not zero, because if it were, we wouldn't have an $x^2$ term and it wouldn't be quadratic anymore.",
        example: "In the equation $3x^2 + 7x - 2 = 0$, we identify: $a = 3$, $b = 7$, and $c = -2$",
        tip: "Always write the equation in standard form before solving!",
        quizQuestion: {
          question: "In the quadratic equation $2x^2 - 5x + 3 = 0$, what is the value of the coefficient $b$?",
          options: ["2", "-5", "3", "0"],
          correctAnswer: 1,
          explanation: "The coefficient $b$ is the number in front of $x$. In this equation, it's $-5$."
        }
      },
      {
        title: "The Quadratic Formula",
        explanation: "The quadratic formula is our main tool for solving these equations. The formula is: $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$ This formula works for any quadratic equation. The $\\pm$ symbol means we'll get two solutions - one using addition and one using subtraction.",
        example: "We'll use this formula with the values $a$, $b$, and $c$ that we identified in step 1.",
        quizQuestion: {
          question: "What does the $\\pm$ symbol in the quadratic formula mean?",
          options: [
            "We multiply by positive and negative values",
            "We get two solutions by using both addition and subtraction",
            "The answer can be positive or negative",
            "We need to check both possibilities"
          ],
          correctAnswer: 1,
          explanation: "The $\\pm$ symbol means we perform the calculation twice: once with addition $(+)$ and once with subtraction $(-)$, giving us two different solutions."
        }
      },
      {
        title: "Calculate the Discriminant",
        explanation: "Before we solve, we calculate something called the discriminant: $\\Delta = b^2 - 4ac$. This special number tells us important information about our solutions. If the discriminant is positive, we get two different real solutions. If it equals zero, we get exactly one solution. If it's negative, we don't have any real number solutions.",
        example: "For $3x^2 + 7x - 2 = 0$: $\\Delta = 7^2 - 4(3)(-2) = 49 + 24 = 73$. Since 73 is positive, we'll have two real solutions.",
        tip: "Always check the discriminant first - it saves time!",
        quizQuestion: {
          question: "If the discriminant $\\Delta = 0$, how many real solutions does the quadratic equation have?",
          options: [
            "No real solutions",
            "Exactly one solution",
            "Two different solutions",
            "Infinitely many solutions"
          ],
          correctAnswer: 1,
          explanation: "When the discriminant equals zero, the quadratic equation has exactly one real solution (also called a repeated or double root)."
        }
      },
      {
        title: "Apply the Formula",
        explanation: "Now we substitute our values into the quadratic formula. We take $b$ and change its sign for the numerator, then add and subtract the square root of our discriminant, and finally divide everything by $2a$. Let's work through this carefully.",
        example: "$$x = \\frac{-7 \\pm \\sqrt{73}}{6}$$. This gives us $x_1 = \\frac{-7 + \\sqrt{73}}{6} \\approx 0.26$ and $x_2 = \\frac{-7 - \\sqrt{73}}{6} \\approx -2.59$",
        quizQuestion: {
          question: "In the quadratic formula, what do we divide by at the end?",
          options: ["$a$", "$2a$", "$b$", "$2b$"],
          correctAnswer: 1,
          explanation: "The entire numerator $-b \\pm \\sqrt{b^2-4ac}$ is divided by $2a$ to get the final solutions."
        }
      },
      {
        title: "Verify Your Solutions",
        explanation: "The final step is to check our work by substituting our solutions back into the original equation. This confirms we didn't make any calculation errors. Each solution should make the equation equal to zero.",
        example: "Let's verify with $x \\approx 0.26$: $3(0.26)^2 + 7(0.26) - 2 \\approx 0$ ✓",
        tip: "Always verify! It's the mark of a careful mathematician.",
        quizQuestion: {
          question: "Why is it important to verify your solutions by substituting them back into the original equation?",
          options: [
            "It's not necessary if you used the formula correctly",
            "To confirm there were no calculation errors",
            "To find additional solutions",
            "To simplify the answer"
          ],
          correctAnswer: 1,
          explanation: "Verification helps catch any arithmetic mistakes made during the solving process. Each solution should make the original equation equal to zero."
        }
      },
    ],
  },
  "12-derivatives": {
    topicId: "12-derivatives",
    title: "Derivatives",
    introduction: "Derivatives measure how functions change. They're fundamental to calculus and have countless real-world applications.",
    steps: [
      {
        title: "Understanding Rate of Change",
        explanation: "A derivative tells us how fast something is changing at a specific moment. Imagine driving a car - your speedometer shows your derivative (speed is the derivative of position). The derivative of a function $f(x)$ is written as $f'(x)$ or $\\frac{df}{dx}$. It represents the slope of the tangent line to the function at any point.",
        example: "If $f(x) = x^2$ represents the position of a car, then $f'(x) = 2x$ tells us the car's velocity at any time $x$.",
        quizQuestion: {
          question: "What does a derivative measure?",
          options: [
            "The total distance traveled",
            "The rate of change at a specific moment",
            "The average value of a function",
            "The area under a curve"
          ],
          correctAnswer: 1,
          explanation: "A derivative measures the instantaneous rate of change - how fast something is changing at a specific moment, like your speedometer showing your current speed."
        }
      },
      {
        title: "The Power Rule",
        explanation: "The power rule is the most fundamental differentiation rule. When we have $x$ raised to any power $n$, we bring that power down as a coefficient and reduce the power by 1. Mathematically: $\\frac{d}{dx}[x^n] = nx^{n-1}$. This rule makes finding derivatives straightforward for polynomial terms.",
        example: "$\\frac{d}{dx}[x^5] = 5x^4$. We brought down the 5 and reduced the power from 5 to 4.",
        tip: "This works for any real number n, even fractions and negatives!",
        quizQuestion: {
          question: "Using the power rule, what is $\\frac{d}{dx}[x^3]$?",
          options: ["$x^2$", "$3x^3$", "$3x^2$", "$x^4$"],
          correctAnswer: 2,
          explanation: "Using the power rule $\\frac{d}{dx}[x^n] = nx^{n-1}$, we bring down the 3 and reduce the power by 1: $\\frac{d}{dx}[x^3] = 3x^2$."
        }
      },
      {
        title: "The Constant Rule",
        explanation: "Constants don't change, so their rate of change is zero. This makes sense intuitively - if something never changes, its derivative should be zero. Mathematically: $\\frac{d}{dx}[c] = 0$ where $c$ is any constant number.",
        example: "$\\frac{d}{dx}[7] = 0$ and $\\frac{d}{dx}[-42] = 0$. Both are constant numbers that don't change.",
        quizQuestion: {
          question: "What is $\\frac{d}{dx}[15]$?",
          options: ["15", "1", "0", "$x$"],
          correctAnswer: 2,
          explanation: "The derivative of any constant is 0, because constants don't change. Since 15 is a constant, $\\frac{d}{dx}[15] = 0$."
        }
      },
      {
        title: "The Sum Rule",
        explanation: "When we have multiple terms added or subtracted, we can find the derivative of each term separately and then combine them. This is called the sum rule: $\\frac{d}{dx}[f(x) + g(x)] = f'(x) + g'(x)$. It makes complex functions easier to handle by breaking them into simpler parts.",
        example: "$\\frac{d}{dx}[x^3 + x^2] = \\frac{d}{dx}[x^3] + \\frac{d}{dx}[x^2] = 3x^2 + 2x$",
        quizQuestion: {
          question: "What does the sum rule allow us to do?",
          options: [
            "Add the exponents of terms",
            "Find the derivative of each term separately then combine",
            "Multiply derivatives together",
            "Skip certain terms when differentiating"
          ],
          correctAnswer: 1,
          explanation: "The sum rule lets us break down complex functions and find the derivative of each term separately, then add or subtract them together: $\\frac{d}{dx}[f(x) + g(x)] = f'(x) + g'(x)$."
        }
      },
      {
        title: "Putting It All Together",
        explanation: "Now we combine all our rules to find derivatives of more complex polynomials. We apply the power rule to each term, use the constant rule for any standalone numbers, and use the sum rule to combine everything. Let's work through a complete example to see how all these pieces fit together.",
        example: "Find $\\frac{d}{dx}[4x^3 - 2x^2 + 5x - 8]$: First term: $4(3)x^2 = 12x^2$. Second term: $-2(2)x = -4x$. Third term: $5(1)x^0 = 5$. Fourth term: $0$. Combined result: $12x^2 - 4x + 5$",
        tip: "Work term by term and double-check each step!",
        quizQuestion: {
          question: "What is $\\frac{d}{dx}[2x^2 + 3x - 7]$?",
          options: ["$4x + 3$", "$2x + 3$", "$4x^2 + 3x$", "$4x + 3 - 7$"],
          correctAnswer: 0,
          explanation: "Using the power rule on each term: $\\frac{d}{dx}[2x^2] = 4x$, $\\frac{d}{dx}[3x] = 3$, and $\\frac{d}{dx}[-7] = 0$. Combined: $4x + 3$."
        }
      },
    ],
  },
};

const StepByStep = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState("9");
  const [selectedTopic, setSelectedTopic] = useState("9-quadratics");
  const [currentStep, setCurrentStep] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const currentLesson = lessons[selectedTopic] || lessons["9-quadratics"];
  const totalSteps = currentLesson.steps.length;
  const isLastStep = currentStep === totalSteps - 1;

  const startQuiz = () => {
    // Collect pregenerated quiz questions from all steps
    const questions = currentLesson.steps.map(step => step.quizQuestion);
    setQuizQuestions(questions);
    setShowQuiz(true);
    toast.success("Quiz ready! Test your understanding.");
  };

  const handleQuizComplete = (score: number) => {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    toast.success(`Quiz complete! You scored ${score}/${quizQuestions.length} (${percentage}%)`);
  };

  const handleReadTheory = () => {
    setShowQuiz(false);
    setQuizQuestions([]);
    setCurrentStep(0);
  };

  const handleRetryQuiz = () => {
    setShowQuiz(false);
    // Small delay to allow reset
    setTimeout(() => {
      const questions = currentLesson.steps.map(step => step.quizQuestion);
      setQuizQuestions(questions);
      setShowQuiz(true);
    }, 100);
  };

  const handleStartPractice = () => {
    navigate('/practice');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex flex-col gap-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">{currentLesson.title}</h2>
              <p className="text-muted-foreground">{currentLesson.introduction}</p>
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="secondary">
                  Step {currentStep + 1} of {totalSteps}
                </Badge>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {!showQuiz ? (
              <>
                <Card className="p-6 bg-accent/5 border-accent mb-6 min-h-[400px] flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <ChevronRight className="h-5 w-5 text-primary" />
                      {currentLesson.steps[currentStep].title}
                    </h3>
                  </div>

                  <div className="prose prose-sm max-w-none dark:prose-invert mb-4 flex-1">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {currentLesson.steps[currentStep].explanation}
                    </ReactMarkdown>
                  </div>

                  {currentLesson.steps[currentStep].example && (
                    <Card className="p-4 bg-primary/5 border-primary/20 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-primary">Example:</p>
                        <StepQuestionDialog
                          stepContent={currentLesson.steps[currentStep].title}
                          stepExplanation={currentLesson.steps[currentStep].explanation}
                          stepExample={currentLesson.steps[currentStep].example}
                          topic={selectedTopic}
                          gradeLevel={selectedGrade}
                        />
                      </div>
                      <div className="prose prose-sm dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {currentLesson.steps[currentStep].example}
                        </ReactMarkdown>
                      </div>
                    </Card>
                  )}

                  {currentLesson.steps[currentStep].tip && (
                    <Card className="p-4 bg-secondary/10 border-secondary/20">
                      <p className="text-sm font-semibold mb-1">Pro Tip</p>
                      <p className="text-sm">{currentLesson.steps[currentStep].tip}</p>
                    </Card>
                  )}
                </Card>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                  >
                    Previous Step
                  </Button>
                  {isLastStep ? (
                    <Button onClick={startQuiz}>
                      Start Quiz
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))}
                    >
                      Next Step
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <TheoryQuiz
                questions={quizQuestions}
                onComplete={handleQuizComplete}
                onReadTheory={handleReadTheory}
                onRetry={handleRetryQuiz}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StepByStep;
