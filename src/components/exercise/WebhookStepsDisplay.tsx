import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import katex from "katex";
import "katex/dist/katex.min.css";
import { WebhookStep } from "@/types/exerciseTypes";

interface WebhookStepsDisplayProps {
  steps: WebhookStep[];
  onStepsChange: (steps: WebhookStep[]) => void;
  onDismiss: () => void;
}

export const WebhookStepsDisplay = ({
  steps,
  onStepsChange,
  onDismiss,
}: WebhookStepsDisplayProps) => {
  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  const [editingLatex, setEditingLatex] = useState<string>('');

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
      <div className="space-y-4">
        {steps.map((step) => (
          <Card
            key={step.id}
            className={`p-4 ${
              editingStepId === step.id
                ? 'bg-primary/10 border-primary/50'
                : 'bg-background/50 hover:bg-accent/50'
            } transition-all`}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
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
                  <div
                    onClick={() => handleStepClick(step)}
                    className="cursor-pointer p-2 rounded-lg hover:bg-accent/30 transition-all"
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
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={onDismiss}
      >
        Dismiss
      </Button>
    </Card>
  );
};
