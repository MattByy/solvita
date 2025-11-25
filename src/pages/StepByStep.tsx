import { useState } from "react";
import { BookOpen, ChevronRight, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { GradeTopicSelector, curriculumTopics } from "@/components/GradeTopicSelector";
import { StepQuestionDialog } from "@/components/StepQuestionDialog";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface LessonStep {
  title: string;
  explanation: string;
  example?: string;
  tip?: string;
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
      },
      {
        title: "The Quadratic Formula",
        explanation: "The quadratic formula is our main tool for solving these equations. The formula is: $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$ This formula works for any quadratic equation. The $\\pm$ symbol means we'll get two solutions - one using addition and one using subtraction.",
        example: "We'll use this formula with the values $a$, $b$, and $c$ that we identified in step 1.",
      },
      {
        title: "Calculate the Discriminant",
        explanation: "Before we solve, we calculate something called the discriminant: $\\Delta = b^2 - 4ac$. This special number tells us important information about our solutions. If the discriminant is positive, we get two different real solutions. If it equals zero, we get exactly one solution. If it's negative, we don't have any real number solutions.",
        example: "For $3x^2 + 7x - 2 = 0$: $\\Delta = 7^2 - 4(3)(-2) = 49 + 24 = 73$. Since 73 is positive, we'll have two real solutions.",
        tip: "Always check the discriminant first - it saves time!",
      },
      {
        title: "Apply the Formula",
        explanation: "Now we substitute our values into the quadratic formula. We take $b$ and change its sign for the numerator, then add and subtract the square root of our discriminant, and finally divide everything by $2a$. Let's work through this carefully.",
        example: "$$x = \\frac{-7 \\pm \\sqrt{73}}{6}$$. This gives us $x_1 = \\frac{-7 + \\sqrt{73}}{6} \\approx 0.26$ and $x_2 = \\frac{-7 - \\sqrt{73}}{6} \\approx -2.59$",
      },
      {
        title: "Verify Your Solutions",
        explanation: "The final step is to check our work by substituting our solutions back into the original equation. This confirms we didn't make any calculation errors. Each solution should make the equation equal to zero.",
        example: "Let's verify with $x \\approx 0.26$: $3(0.26)^2 + 7(0.26) - 2 \\approx 0$ ✓",
        tip: "Always verify! It's the mark of a careful mathematician.",
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
      },
      {
        title: "The Power Rule",
        explanation: "The power rule is the most fundamental differentiation rule. When we have $x$ raised to any power $n$, we bring that power down as a coefficient and reduce the power by 1. Mathematically: $\\frac{d}{dx}[x^n] = nx^{n-1}$. This rule makes finding derivatives straightforward for polynomial terms.",
        example: "$\\frac{d}{dx}[x^5] = 5x^4$. We brought down the 5 and reduced the power from 5 to 4.",
        tip: "This works for any real number n, even fractions and negatives!",
      },
      {
        title: "The Constant Rule",
        explanation: "Constants don't change, so their rate of change is zero. This makes sense intuitively - if something never changes, its derivative should be zero. Mathematically: $\\frac{d}{dx}[c] = 0$ where $c$ is any constant number.",
        example: "$\\frac{d}{dx}[7] = 0$ and $\\frac{d}{dx}[-42] = 0$. Both are constant numbers that don't change.",
      },
      {
        title: "The Sum Rule",
        explanation: "When we have multiple terms added or subtracted, we can find the derivative of each term separately and then combine them. This is called the sum rule: $\\frac{d}{dx}[f(x) + g(x)] = f'(x) + g'(x)$. It makes complex functions easier to handle by breaking them into simpler parts.",
        example: "$\\frac{d}{dx}[x^3 + x^2] = \\frac{d}{dx}[x^3] + \\frac{d}{dx}[x^2] = 3x^2 + 2x$",
      },
      {
        title: "Putting It All Together",
        explanation: "Now we combine all our rules to find derivatives of more complex polynomials. We apply the power rule to each term, use the constant rule for any standalone numbers, and use the sum rule to combine everything. Let's work through a complete example to see how all these pieces fit together.",
        example: "Find $\\frac{d}{dx}[4x^3 - 2x^2 + 5x - 8]$: First term: $4(3)x^2 = 12x^2$. Second term: $-2(2)x = -4x$. Third term: $5(1)x^0 = 5$. Fourth term: $0$. Combined result: $12x^2 - 4x + 5$",
        tip: "Work term by term and double-check each step!",
      },
    ],
  },
};

const StepByStep = () => {
  const [selectedGrade, setSelectedGrade] = useState("9");
  const [selectedTopic, setSelectedTopic] = useState("9-quadratics");
  const [currentStep, setCurrentStep] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentLesson = lessons[selectedTopic] || lessons["9-quadratics"];
  const totalSteps = currentLesson.steps.length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">MathTutor AI</h1>
                <p className="text-sm text-muted-foreground">Step-by-step learning</p>
              </div>
            </div>
          </div>
          <Navigation />
        </div>
      </header>

      <div className="flex w-full">
        <div className={`container mx-auto px-4 py-6 transition-all ${sidebarOpen ? 'max-w-2xl' : 'max-w-4xl'}`}>
          <div className="space-y-6">
          <GradeTopicSelector
            selectedGrade={selectedGrade}
            selectedTopic={selectedTopic}
            onGradeChange={(grade) => {
              setSelectedGrade(grade);
              const topics = curriculumTopics[grade];
              if (topics && topics.length > 0) {
                setSelectedTopic(topics[0].id);
                setCurrentStep(0);
              }
            }}
            onTopicChange={(topic) => {
              setSelectedTopic(topic);
              setCurrentStep(0);
            }}
          />

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

            <Card className="p-6 bg-accent/5 border-accent mb-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-primary" />
                  {currentLesson.steps[currentStep].title}
                </h3>
              </div>

              <div className="prose prose-sm max-w-none dark:prose-invert mb-4">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {currentLesson.steps[currentStep].explanation}
                </ReactMarkdown>
              </div>

              {currentLesson.steps[currentStep].example && (
                <Card className="p-4 bg-primary/5 border-primary/20 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-primary">Example:</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSidebarOpen(true)}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Ask AI
                    </Button>
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
                  <p className="text-sm font-semibold mb-1">💡 Pro Tip:</p>
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
              <Button
                onClick={() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1))}
                disabled={currentStep === totalSteps - 1}
              >
                Next Step
              </Button>
            </div>
          </Card>
          </div>
        </div>

        {sidebarOpen && (
          <div className="w-96 border-l border-border bg-card p-6 overflow-y-auto">
            <StepQuestionDialog
              stepContent={currentLesson.steps[currentStep].title}
              stepExplanation={currentLesson.steps[currentStep].explanation}
              stepExample={currentLesson.steps[currentStep].example}
              topic={selectedTopic}
              open={sidebarOpen}
              onOpenChange={setSidebarOpen}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StepByStep;
