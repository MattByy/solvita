import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Problem, getDifficultyColor } from "@/types/exerciseTypes";

interface ProblemSelectionScreenProps {
  problems: Problem[];
  completedCount: number;
  currentTaskTitle?: string;
  onProblemSelect: (problem: Problem) => void;
}

export const ProblemSelectionScreen = ({
  problems,
  completedCount,
  currentTaskTitle,
  onProblemSelect,
}: ProblemSelectionScreenProps) => {
  const navigate = useNavigate();

  const easyProblems = problems.filter(p => p.difficulty === 'easy');
  const mediumProblems = problems.filter(p => p.difficulty === 'medium');
  const hardProblems = problems.filter(p => p.difficulty === 'hard');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex flex-col gap-6">
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <Button variant="outline" onClick={() => navigate('/learn?review=true')}>
              <BookOpen className="h-4 w-4 mr-2" />
              Back to Theory
            </Button>
          </div>

          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">Choose a Problem</h2>
              <p className="text-muted-foreground">
                Select a problem based on difficulty level
              </p>
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="outline">
                  Completed: {completedCount}/4
                </Badge>
                <Badge variant="secondary">
                  {currentTaskTitle || 'Practice'}
                </Badge>
              </div>
            </div>

            {/* Easy Problems */}
            {easyProblems.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getDifficultyColor('easy').badge}>Easy</Badge>
                </div>
                <div className="space-y-2">
                  {easyProblems.map((problem) => (
                    <Card
                      key={problem.id}
                      className={`p-4 cursor-pointer transition-all hover:scale-[1.01] hover:${getDifficultyColor('easy').bg} hover:${getDifficultyColor('easy').border} border-2 border-transparent`}
                      onClick={() => onProblemSelect(problem)}
                    >
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {problem.question}
                        </ReactMarkdown>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Medium Problems */}
            {mediumProblems.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getDifficultyColor('medium').badge}>Medium</Badge>
                </div>
                <div className="space-y-2">
                  {mediumProblems.map((problem) => (
                    <Card
                      key={problem.id}
                      className={`p-4 cursor-pointer transition-all hover:scale-[1.01] hover:${getDifficultyColor('medium').bg} hover:${getDifficultyColor('medium').border} border-2 border-transparent`}
                      onClick={() => onProblemSelect(problem)}
                    >
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {problem.question}
                        </ReactMarkdown>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Hard Problems */}
            {hardProblems.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getDifficultyColor('hard').badge}>Hard</Badge>
                </div>
                <div className="space-y-2">
                  {hardProblems.map((problem) => (
                    <Card
                      key={problem.id}
                      className={`p-4 cursor-pointer transition-all hover:scale-[1.01] hover:${getDifficultyColor('hard').bg} hover:${getDifficultyColor('hard').border} border-2 border-transparent`}
                      onClick={() => onProblemSelect(problem)}
                    >
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {problem.question}
                        </ReactMarkdown>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
