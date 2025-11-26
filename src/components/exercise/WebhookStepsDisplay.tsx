import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Loader2, CheckCircle, XCircle, Trash2 } from "lucide-react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { WebhookStep } from "@/types/exerciseTypes";
import { toast } from "sonner";

interface IncorrectStep {
  stepNumber: number;
  correctAnswer?: string | null;
  explanation?: string | null;
}

interface CorrectSolutionStep {
  stepNumber: number;
  latex: string;
}

interface ValidationResponse {
  isCorrect: boolean;
  incorrectSteps: IncorrectStep[];
  correctSteps: number[];
  correctSolution?: CorrectSolutionStep[] | null;
  feedback: string;
}

interface WebhookStepsDisplayProps {
  steps: WebhookStep[];
  onStepsChange: (steps: WebhookStep[]) => void;
  onDismiss: () => void;
  problemQuestion?: string;
  onWebhookResponse?: (response: string) => void;
}

export const WebhookStepsDisplay = ({
  steps,
  onStepsChange,
  onDismiss,
  problemQuestion,
  onWebhookResponse,
}: WebhookStepsDisplayProps) => {
  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  const [editingLatex, setEditingLatex] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);

  const handleStepClick = (step: WebhookStep) => {
    setEditingStepId(step.id);
    setEditingLatex(step.latex);
  };

  const handleStepSave = () => {
    if (editingStepId !== null) {
      onStepsChange(steps.map(step =>
        step.id === editingStepId
          ? { ...step, latex: editingLatex }
          : step
      ));
      setEditingStepId(null);
      setEditingLatex('');
    }
  };

  const handleStepCancel = () => {
    setEditingStepId(null);
    setEditingLatex('');
  };

  const handleDeleteStep = (stepId: number) => {
    const updatedSteps = steps
      .filter(step => step.id !== stepId)
      .map((step, index) => ({ ...step, id: index + 1 })); // Re-number steps
    onStepsChange(updatedSteps);
  };

  const handleSubmitSteps = async () => {
    setIsSubmitting(true);
    setValidationResult(null);
    try {
      const payload = {
        problem: problemQuestion || '',
        steps: steps.map(step => ({
          stepNumber: step.id,
          latex: step.latex,
        })),
        timestamp: new Date().toISOString(),
      };

      const response = await fetch('https://oopsautomation.app.n8n.cloud/webhook/matkestestai2324', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const responseText = await response.text();
        try {
          const data = JSON.parse(responseText);
          // Check if it's the validation response format
          if ('isCorrect' in data && 'feedback' in data) {
            setValidationResult(data as ValidationResponse);
            if (onWebhookResponse) {
              onWebhookResponse(data.feedback);
            }
          } else {
            // Fallback for other response formats
            const feedback = data.message || data.response || data.text || data.output || responseText;
            setValidationResult({
              isCorrect: true,
              incorrectSteps: [],
              correctSteps: steps.map(s => s.id),
              feedback: feedback
            });
            if (onWebhookResponse) {
              onWebhookResponse(feedback);
            }
          }
        } catch {
          setValidationResult({
            isCorrect: true,
            incorrectSteps: [],
            correctSteps: steps.map(s => s.id),
            feedback: responseText
          });
          if (onWebhookResponse) {
            onWebhookResponse(responseText);
          }
        }
        setIsSubmitted(true);
        toast.success('Solution checked!');
      } else {
        toast.error('Failed to submit. Please try again.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function - only mark as incorrect if it has an explanation
  const getIncorrectStepInfo = (stepId: number): IncorrectStep | undefined => {
    if (!validationResult) return undefined;
    const step = validationResult.incorrectSteps.find(s => s.stepNumber === stepId);
    // Only return if it has an explanation
    return step?.explanation ? step : undefined;
  };

  // Check if step has an error (only if it has explanation)
  const hasError = (stepId: number): boolean => {
    return !!getIncorrectStepInfo(stepId);
  };

  return (
    <Card className="p-6 bg-blue-500/10 border-blue-500/30 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <span className="text-lg font-bold">Solution Steps</span>
        </div>
        <span className="text-xs text-muted-foreground">
          Click any step to edit
        </span>
      </div>
      {/* Correct Solution - shows ABOVE user steps when incorrect */}
      {validationResult && !validationResult.isCorrect && validationResult.correctSolution && validationResult.correctSolution.length > 0 && !isSubmitting && (
        <Card className="p-4 bg-green-500/5 border-green-500/20 mb-4">
          <p className="text-sm font-medium text-green-500 mb-3">Correct Solution</p>
          <div className="space-y-1">
            {validationResult.correctSolution.map((step) => (
              <div key={step.stepNumber} className="flex items-center gap-2">
                <span className="text-xs text-green-500/70 w-4">{step.stepNumber}.</span>
                <div
                  dangerouslySetInnerHTML={{
                    __html: katex.renderToString(step.latex, {
                      displayMode: false,
                      throwOnError: false
                    })
                  }}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Feedback - shows between correct solution and user steps */}
      {validationResult && !validationResult.isCorrect && !isSubmitting && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">{validationResult.feedback}</p>
        </div>
      )}

      {/* User's Steps label */}
      {isSubmitted && !validationResult?.isCorrect && !isSubmitting && (
        <p className="text-xs font-medium text-muted-foreground mb-2">Your steps:</p>
      )}
      <div className={isSubmitted && !validationResult?.isCorrect ? "space-y-2" : "space-y-4"}>
        {steps.map((step) => {
          const incorrectInfo = getIncorrectStepInfo(step.id);
          const stepHasError = hasError(step.id);

          // Compact view after submission with errors
          if (isSubmitted && !validationResult?.isCorrect) {
            return (
              <div
                key={step.id}
                className={`flex items-start gap-2 p-2 rounded ${stepHasError ? 'bg-red-500/5' : ''}`}
              >
                <span className={`text-xs w-4 ${stepHasError ? 'text-red-400' : 'text-muted-foreground'}`}>
                  {step.id}.
                </span>
                <div className="flex-1">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: katex.renderToString(step.latex, {
                        displayMode: false,
                        throwOnError: false
                      })
                    }}
                  />
                  {stepHasError && incorrectInfo && (
                    <p className="text-sm font-medium text-red-500 mt-2">↳ {incorrectInfo.explanation}</p>
                  )}
                </div>
              </div>
            );
          }

          // Full edit view before submission
          return (
            <Card
              key={step.id}
              className={`p-4 ${editingStepId === step.id ? 'bg-primary/10 border-primary/50' : 'bg-background/50 hover:bg-accent/50'} transition-all`}
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-medium flex-shrink-0 text-sm">
                  {step.id}
                </div>
                <div className="flex-1">
                  {editingStepId === step.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editingLatex}
                        onChange={(e) => setEditingLatex(e.target.value)}
                        className="font-mono"
                        autoFocus
                      />
                      <Card className="p-3 bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                        <div
                          className="text-xl"
                          dangerouslySetInnerHTML={{
                            __html: katex.renderToString(editingLatex, {
                              displayMode: true,
                              throwOnError: false
                            })
                          }}
                        />
                      </Card>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleStepSave}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleStepCancel}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <div
                        onClick={() => handleStepClick(step)}
                        className="flex-1 p-2 rounded-lg transition-all cursor-pointer hover:bg-accent/30"
                      >
                        <div
                          className="text-xl"
                          dangerouslySetInnerHTML={{
                            __html: katex.renderToString(step.latex, {
                              displayMode: true,
                              throwOnError: false
                            })
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Click to edit
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStep(step.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {/* Loading State */}
      {isSubmitting && (
        <Card className="p-6 bg-purple-500/10 border-purple-500/30 mt-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            <span className="text-lg font-medium">Checking your solution...</span>
          </div>
        </Card>
      )}

      {/* Success message - only when all correct */}
      {validationResult && validationResult.isCorrect && !isSubmitting && (
        <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
          <p className="text-sm text-green-400">✓ {validationResult.feedback}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        {!isSubmitted ? (
          <>
            <Button
              onClick={handleSubmitSteps}
              disabled={isSubmitting || editingStepId !== null}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Solution
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onDismiss}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            onClick={onDismiss}
          >
            Done
          </Button>
        )}
      </div>
    </Card>
  );
};
