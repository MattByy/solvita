import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, TrendingUp, Target, XCircle, ArrowLeft, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { mistakeStorage, MistakeRecord } from "@/lib/mistakeStorage";

const Mistakes = () => {
  const navigate = useNavigate();
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
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl font-bold text-center">CorePus</h1>
            <div className="w-[88px]" />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Total Mistakes</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mistakes.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all topics
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Average Attempts</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mistakes.length > 0
                    ? (mistakes.reduce((sum, m) => sum + (m.attempts || 1), 0) / mistakes.length).toFixed(1)
                    : "0"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Before solving correctly
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Focus Area</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mostChallengingTopic ? mostChallengingTopic[0] : "None"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Most mistakes in this topic
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="p-6">
            {mistakes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No mistakes tracked yet!</p>
                <p className="text-sm">Keep practicing and you'll see your progress here.</p>
              </div>
            ) : (
              <Tabs defaultValue="all" className="w-full">
...
              </Tabs>
            )}
          </Card>
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
