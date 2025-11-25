import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LearningPlan {
  id: string;
  grade: string;
  topic_id: string;
  topic_name: string;
  test_date: string;
  created_at: string;
}

interface LearningTask {
  id: string;
  plan_id: string;
  day_number: number;
  scheduled_date: string;
  title: string;
  description: string;
  task_type: 'theory' | 'quiz' | 'practice' | 'review';
  is_completed: boolean;
  completed_at: string | null;
}

export const useLearningPlan = () => {
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [tasks, setTasks] = useState<LearningTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const sessionId = localStorage.getItem('mathTutorSessionId');
      if (!sessionId) {
        setLoading(false);
        return;
      }

      // Fetch the learning plan
      const { data: planData, error: planError } = await supabase
        .from('learning_plans')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planError) throw planError;

      if (!planData) {
        setLoading(false);
        return;
      }

      setPlan(planData);

      // Fetch tasks for this plan
      const { data: tasksData, error: tasksError } = await supabase
        .from('learning_tasks')
        .select('*')
        .eq('plan_id', planData.id)
        .order('day_number', { ascending: true });

      if (tasksError) throw tasksError;

      setTasks((tasksData || []) as LearningTask[]);
    } catch (error) {
      console.error('Error fetching learning plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const markTaskComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('learning_tasks')
        .update({ 
          is_completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, is_completed: true, completed_at: new Date().toISOString() }
            : task
        )
      );
    } catch (error) {
      console.error('Error marking task complete:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  return {
    plan,
    tasks,
    loading,
    refetch: fetchPlan,
    markTaskComplete
  };
};
