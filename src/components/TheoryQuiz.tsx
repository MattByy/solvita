import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface TheoryQuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

export const TheoryQuiz = ({ questions, onComplete }: TheoryQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      toast.error("Please select an answer");
      return;
    }

    setIsAnswered(true);
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      toast.success("Correct!");
    } else {
      toast.error("Incorrect");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      onComplete(score + (selectedAnswer === questions[currentQuestion].correctAnswer ? 1 : 0));
    }
  };

  const currentQ = questions[currentQuestion];
  const isCorrect = selectedAnswer === currentQ.correctAnswer;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Theory Quiz</span>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-lg font-medium">{currentQ.question}</div>
        
        <RadioGroup
          value={selectedAnswer?.toString()}
          onValueChange={(value) => setSelectedAnswer(parseInt(value))}
          disabled={isAnswered}
        >
          {currentQ.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label
                htmlFor={`option-${index}`}
                className={`flex-1 cursor-pointer ${
                  isAnswered
                    ? index === currentQ.correctAnswer
                      ? "text-green-600"
                      : index === selectedAnswer
                      ? "text-destructive"
                      : ""
                    : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {option}
                  {isAnswered && index === currentQ.correctAnswer && (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                  {isAnswered && index === selectedAnswer && index !== currentQ.correctAnswer && (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        {isAnswered && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium mb-2">
              {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
            </p>
            <p className="text-sm text-muted-foreground">{currentQ.explanation}</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-muted-foreground">
            Score: {score}/{questions.length}
          </div>
          <Button
            onClick={isAnswered ? handleNextQuestion : handleSubmitAnswer}
            disabled={!isAnswered && selectedAnswer === null}
          >
            {isAnswered
              ? currentQuestion < questions.length - 1
                ? "Next Question"
                : "Finish Quiz"
              : "Submit Answer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
