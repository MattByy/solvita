import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { OnboardingModal } from "@/components/OnboardingModal";
import { useLearningPlan } from "@/hooks/useLearningPlan";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Circle, Calendar, BookOpen, Target, Loader2 } from "lucide-react";
import { format, differenceInDays, parseISO, isToday, isPast } from "date-fns";

const Home = () => {
  const navigate = useNavigate();
  const { plan, tasks, loading, markTaskComplete, refetch } = useLearningPlan();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding if no plan exists
    if (!loading && !plan) {
      setShowOnboarding(true);
    }
  }, [loading, plan]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    // Wait a moment for database consistency, then refetch
    await new Promise(resolve => setTimeout(resolve, 2000));
    await refetch();
  };

  if (loading) {
    console.log('Home: Loading state');
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  console.log('Home: Render state', { plan: !!plan, showOnboarding, tasksCount: tasks.length });

  if (!plan || showOnboarding) {
    return <OnboardingModal open={showOnboarding || !plan} onComplete={handleOnboardingComplete} />;
  }

  // Calculate progress
  const completedTasks = tasks.filter(t => t.is_completed);
  const progressPercentage = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  // Categorize tasks
  const today = new Date();
  const todayTasks = tasks.filter(t => isToday(parseISO(t.scheduled_date)) && !t.is_completed);
  const pastTasks = tasks.filter(t => isPast(parseISO(t.scheduled_date)) && !isToday(parseISO(t.scheduled_date)));
  const upcomingTasks = tasks.filter(t => !isPast(parseISO(t.scheduled_date)) && !isToday(parseISO(t.scheduled_date)));

  // Days until exam
  const daysUntilExam = differenceInDays(parseISO(plan.test_date), today);

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'theory': return '📚';
      case 'quiz': return '✍️';
      case 'practice': return '🎯'; // Changed to target to represent focused daily work
      case 'review': return '🔄';
      default: return '📝';
    }
  };

  const navigateToTask = (taskType: string) => {
    // Since all daily tasks now encompass theory + practice + quiz, 
    // we'll primarily navigate to the practice page which is most comprehensive
    switch (taskType) {
      case 'theory':
        navigate('/practice'); // Practice page has theory components
        break;
      case 'practice':
        navigate('/practice');
        break;
      case 'review':
        navigate('/mistakes');
        break;
      case 'quiz':
        navigate('/practice'); // Practice page includes quiz functionality
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex flex-col gap-6">
          <Navigation />

          {/* Header */}
          <div className="text-center space-y-4 py-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Your Learning Journey
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {plan.grade} - {plan.topic_name}
            </p>
          </div>

          {/* Exam Countdown */}
          <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-secondary/20">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-full">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">
                      {daysUntilExam === 0 ? 'Exam is Today!' : `${daysUntilExam} Days Until Exam`}
                    </h3>
                    <p className="text-muted-foreground">
                      {format(parseISO(plan.test_date), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                {daysUntilExam > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Keep going!</p>
                    <p className="text-lg font-semibold">{completedTasks.length}/{tasks.length} tasks completed</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Your Progress
              </CardTitle>
              <CardDescription>
                You've completed {completedTasks.length} out of {tasks.length} tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{completedTasks.length} completed</span>
                <span>{tasks.length - completedTasks.length} remaining</span>
              </div>
            </CardContent>
          </Card>

          {/* Today's Tasks */}
          {todayTasks.length > 0 && (
            <Card className="border-2 border-blue-500/50 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Calendar className="h-5 w-5" />
                  Today's Learning
                </CardTitle>
                <CardDescription>
                  {todayTasks.length === 1 
                    ? "Focus on this topic today" 
                    : `${todayTasks.length} topics to focus on today`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg bg-background/80 border-2 border-blue-500/30">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">🎯</span>
                    <div className="flex-1">
                      {todayTasks.length === 1 ? (
                        <>
                          <p className="font-semibold text-foreground">{todayTasks[0].title}</p>
                          <p className="text-sm text-muted-foreground">{todayTasks[0].description}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-foreground">Today's Topics</p>
                          <div className="text-sm text-muted-foreground">
                            {todayTasks.map((task, index) => (
                              <div key={task.id} className="mb-1">
                                <span className="font-medium">• {task.title}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => navigateToTask('practice')} size="lg">
                    Start Learning
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline: Past Tasks */}
          {pastTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {completedTasks.length === pastTasks.length ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  Past Tasks
                </CardTitle>
                <CardDescription>
                  {completedTasks.length} of {pastTasks.length} completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pastTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        task.is_completed
                          ? 'bg-green-500/10 border border-green-500/30'
                          : 'bg-red-500/10 border border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {task.is_completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        )}
                        <span className="text-xl">{getTaskTypeIcon(task.task_type)}</span>
                        <div>
                          <p className={`font-medium ${task.is_completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(task.scheduled_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      {task.is_completed ? (
                        <Badge variant="outline" className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50">
                          Missed
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Tasks */}
          {upcomingTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  Upcoming Tasks
                </CardTitle>
                <CardDescription>
                  What's coming next in your study plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-center gap-3">
                        <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-xl">{getTaskTypeIcon(task.task_type)}</span>
                        <div>
                          <p className="font-medium text-muted-foreground">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(task.scheduled_date), 'EEEE, MMM d')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
