import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { GradeTopicSelector, curriculumTopics } from "@/components/GradeTopicSelector";
import { Loader2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export const OnboardingModal = ({ open, onComplete }: OnboardingModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [testDate, setTestDate] = useState<Date>();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGeneratePlan = async () => {
    if (!selectedGrade || !selectedTopicId || !testDate) {
      toast({
        title: "Missing information",
        description: "Please complete all steps before generating your plan.",
        variant: "destructive",
      });
      return;
    }

    // Get topic name from ID
    const topic = curriculumTopics[selectedGrade]?.find(t => t.id === selectedTopicId);
    if (!topic) {
      toast({
        title: "Error",
        description: "Invalid topic selected.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Get or create session ID
      let sessionId = localStorage.getItem('mathTutorSessionId');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('mathTutorSessionId', sessionId);
      }

      const { data, error } = await supabase.functions.invoke('generate-learning-plan', {
        body: {
          grade: selectedGrade,
          topicId: topic.id,
          topicName: topic.name,
          testDate: format(testDate, 'yyyy-MM-dd'),
          sessionId
        }
      });

      if (error) throw error;

      toast({
        title: "Learning plan created!",
        description: `Your personalized ${data.taskCount}-day study plan is ready.`,
      });

      onComplete();
    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        title: "Error creating plan",
        description: "Please try again. If the problem persists, contact support.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Welcome to Your Math Journey
          </DialogTitle>
          <DialogDescription>
            Let's create a personalized learning plan to help you succeed on your upcoming test.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center space-y-2 py-4">
                <h3 className="text-lg font-semibold">Step 1: Choose Your Topic</h3>
                <p className="text-sm text-muted-foreground">
                  Select the grade level and curriculum topic you need to study.
                </p>
              </div>
              
              <GradeTopicSelector
                selectedGrade={selectedGrade}
                selectedTopic={selectedTopicId}
                onGradeChange={setSelectedGrade}
                onTopicChange={setSelectedTopicId}
              />

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedGrade || !selectedTopicId}
                  size="lg"
                >
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center space-y-2 py-4">
                <h3 className="text-lg font-semibold">Step 2: Set Your Test Date</h3>
                <p className="text-sm text-muted-foreground">
                  When is your exam? We'll create a study plan that gets you ready in time.
                </p>
              </div>

              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={testDate}
                  onSelect={setTestDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border pointer-events-auto"
                />
              </div>

              {testDate && (
                <div className="text-center text-sm text-muted-foreground">
                  Test date: {format(testDate, 'MMMM d, yyyy')}
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!testDate}
                  size="lg"
                >
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center space-y-2 py-4">
                <h3 className="text-lg font-semibold">Step 3: Generate Your Plan</h3>
                <p className="text-sm text-muted-foreground">
                  Review your selections and let AI create your personalized study schedule.
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-6 space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Grade & Topic:</span>
                  <p className="text-lg font-semibold">
                    {selectedGrade} - {curriculumTopics[selectedGrade]?.find(t => t.id === selectedTopicId)?.name}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Test Date:</span>
                  <p className="text-lg font-semibold">{testDate ? format(testDate, 'MMMM d, yyyy') : ''}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Days to prepare:</span>
                  <p className="text-lg font-semibold">
                    {testDate ? Math.ceil((testDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} days
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} disabled={isGenerating}>
                  Back
                </Button>
                <Button
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  size="lg"
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate My Plan
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
