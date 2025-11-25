import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Navigation } from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, BookOpen } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  // Mock data - in the future this could come from a database or local storage
  const passedTopics = [
    { id: 1, name: "Linear Equations", grade: "Algebra I", completedDate: "2024-01-15", score: 85 },
    { id: 2, name: "Quadratic Functions", grade: "Algebra II", completedDate: "2024-01-20", score: 92 },
  ];

  const upcomingTopics = [
    { id: 3, name: "Polynomial Functions", grade: "Algebra II", dueDate: "2024-02-10" },
    { id: 4, name: "Exponential Functions", grade: "Algebra II", dueDate: "2024-02-20" },
    { id: 5, name: "Logarithmic Functions", grade: "Algebra II", dueDate: "2024-03-01" },
  ];

  const totalTopics = passedTopics.length + upcomingTopics.length;
  const progressPercentage = (passedTopics.length / totalTopics) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex flex-col gap-6">
          <Navigation />

          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Welcome to Your Math Journey
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Track your progress, review completed topics, and continue learning with personalized step-by-step guidance.
            </p>
          </div>

          {/* Progress Overview */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Your Progress
              </CardTitle>
              <CardDescription>
                You've completed {passedTopics.length} out of {totalTopics} topics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{passedTopics.length} completed</span>
                <span>{upcomingTopics.length} remaining</span>
              </div>
            </CardContent>
          </Card>

          {/* Start Studying CTA */}
          <Card className="bg-primary text-primary-foreground border-primary">
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 py-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Ready to Learn?</h3>
                <p className="text-primary-foreground/90">
                  Start studying now with personalized step-by-step guidance
                </p>
              </div>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/learn")}
                className="text-lg px-8"
              >
                Start Studying Now
              </Button>
            </CardContent>
          </Card>

          {/* Passed Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Passed Topics
              </CardTitle>
              <CardDescription>
                Topics you've successfully completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {passedTopics.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No topics completed yet. Start studying to see your progress!
                </p>
              ) : (
                <div className="space-y-3">
                  {passedTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">{topic.name}</p>
                          <p className="text-sm text-muted-foreground">{topic.grade}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          {topic.score}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(topic.completedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Upcoming Topics
              </CardTitle>
              <CardDescription>
                Topics to study next
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingTopics.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No upcoming topics scheduled.
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">{topic.name}</p>
                          <p className="text-sm text-muted-foreground">{topic.grade}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground">
                          Due: {new Date(topic.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
