import { useState, useEffect } from "react";
import { AlertCircle, TrendingUp, Target, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { mistakeStorage, MistakeRecord } from "@/lib/mistakeStorage";

const Mistakes = () => {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [topicStats, setTopicStats] = useState<Record<string, number>>({});

  const loadMistakes = () => {
    const loadedMistakes = mistakeStorage.getAll();
    setMistakes(loadedMistakes);

    // Calculate topic statistics
    const stats: Record<string, number> = {};
    loadedMistakes.forEach((mistake) => {
      stats[mistake.topic] = (stats[mistake.topic] || 0) + 1;
    });
    setTopicStats(stats);
  };

  useEffect(() => {
    loadMistakes();
  }, []);

  const handleDeleteMistake = (id: string) => {
    mistakeStorage.delete(id);
    loadMistakes();
  };

  const mostChallengingTopic = Object.entries(topicStats).sort((a, b) => b[1] - a[1])[0];
  
  const quizMistakes = mistakes.filter(m => m.type === 'quiz');
  const exerciseMistakes = mistakes.filter(m => m.type === 'exercise');
  const practiceMistakes = mistakes.filter(m => m.type === 'practice');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex flex-col gap-6">
          <Navigation />
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Mistake Tracker</h1>
            <p className="text-muted-foreground">Learn from your errors and improve</p>
          </div>

        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4 bg-accent/5 border-accent">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <AlertCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Mistakes</p>
                  <p className="text-2xl font-bold">{mistakes.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-accent/5 border-accent">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Attempts</p>
                  <p className="text-2xl font-bold">
                    {mistakes.length > 0
                      ? (mistakes.reduce((sum, m) => sum + m.attempts, 0) / mistakes.length).toFixed(1)
                      : "0"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-accent/5 border-accent">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Focus Area</p>
                  <p className="text-lg font-bold">
                    {mostChallengingTopic ? mostChallengingTopic[0] : "None yet"}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Common Patterns */}
          {mistakes.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Common Mistake Patterns</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <p className="font-semibold">Sign Errors</p>
                    <p className="text-sm text-muted-foreground">
                      Watch out for negative signs when distributing or combining terms
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <p className="font-semibold">Formula Application</p>
                    <p className="text-sm text-muted-foreground">
                      Double-check which formula to use and verify all coefficients
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <p className="font-semibold">Order of Operations</p>
                    <p className="text-sm text-muted-foreground">Remember PEMDAS when solving complex expressions</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Mistake History with Tabs */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Your Mistakes</h2>
            {mistakes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No mistakes tracked yet!</p>
                <p className="text-sm">Keep practicing and you'll see your progress here.</p>
              </div>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All ({mistakes.length})</TabsTrigger>
                  <TabsTrigger value="quiz">Quiz ({quizMistakes.length})</TabsTrigger>
                  <TabsTrigger value="exercise">Exercise ({exerciseMistakes.length})</TabsTrigger>
                  <TabsTrigger value="practice">Practice ({practiceMistakes.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-3 mt-4">
                  {mistakes.slice().reverse().map((mistake) => (
                    <MistakeCard key={mistake.id} mistake={mistake} onDelete={handleDeleteMistake} />
                  ))}
                </TabsContent>
                
                <TabsContent value="quiz" className="space-y-3 mt-4">
                  {quizMistakes.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No quiz mistakes yet</p>
                  ) : (
                    quizMistakes.slice().reverse().map((mistake) => (
                      <MistakeCard key={mistake.id} mistake={mistake} onDelete={handleDeleteMistake} />
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="exercise" className="space-y-3 mt-4">
                  {exerciseMistakes.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No exercise mistakes yet</p>
                  ) : (
                    exerciseMistakes.slice().reverse().map((mistake) => (
                      <MistakeCard key={mistake.id} mistake={mistake} onDelete={handleDeleteMistake} />
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="practice" className="space-y-3 mt-4">
                  {practiceMistakes.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No practice mistakes yet</p>
                  ) : (
                    practiceMistakes.slice().reverse().map((mistake) => (
                      <MistakeCard key={mistake.id} mistake={mistake} onDelete={handleDeleteMistake} />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            )}
          </Card>

          {/* Learning Tips */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h2 className="text-xl font-bold mb-4">Tips for Improvement</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Review the step-by-step explanations for problems you struggled with</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Practice similar problems until you can solve them without hints</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Write out each step clearly - this helps identify where errors occur</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Always verify your answer by substituting it back into the original problem</span>
              </li>
            </ul>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
};

const MistakeCard = ({ mistake, onDelete }: { mistake: MistakeRecord; onDelete: (id: string) => void }) => {
  const getBadgeVariant = (type: MistakeRecord['type']) => {
    switch (type) {
      case 'quiz': return 'destructive';
      case 'exercise': return 'default';
      case 'practice': return 'secondary';
    }
  };

  return (
    <Card className="p-4 bg-accent/5 border-accent">
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2">
          <Badge variant={getBadgeVariant(mistake.type)}>{mistake.type}</Badge>
          <Badge variant="outline">{mistake.topic}</Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onDelete(mistake.id)}
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="prose prose-sm dark:prose-invert mb-2">
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
          {mistake.problem}
        </ReactMarkdown>
      </div>

      {mistake.type === 'quiz' && (
        <div className="text-sm space-y-1 mt-2 p-2 bg-muted rounded">
          <p><span className="font-medium">Your answer:</span> {mistake.userAnswer}</p>
          <p><span className="font-medium text-green-600">Correct:</span> {mistake.correctAnswer}</p>
        </div>
      )}

      {mistake.type === 'exercise' && mistake.incorrectSteps && mistake.incorrectSteps.length > 0 && (
        <div className="text-sm mt-2 p-2 bg-muted rounded">
          <p className="font-medium mb-1">Struggled with steps:</p>
          <div className="space-y-1">
            {mistake.incorrectSteps.map((stepIdx) => (
              <div key={stepIdx} className="text-xs">
                Step {stepIdx + 1}: {mistake.stepDetails?.[stepIdx]?.explanation}
              </div>
            ))}
          </div>
        </div>
      )}

      {mistake.type === 'practice' && mistake.attempts && (
        <Badge variant="outline" className="mt-2">{mistake.attempts} attempts</Badge>
      )}

      <p className="text-xs text-muted-foreground mt-2">
        {new Date(mistake.date).toLocaleDateString()}
      </p>
    </Card>
  );
};

export default Mistakes;
