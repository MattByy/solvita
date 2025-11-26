import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AddStudentForm from '@/components/Parent/AddStudentForm';
import ScheduleSessionForm from '@/components/Parent/ScheduleSessionForm';
import SessionReports from '@/components/Parent/SessionReports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Plus,
  Calendar,
  LogOut,
  GraduationCap,
  Clock,
  CalendarDays,
  Link,
  User
} from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  grade_level: number;
  parent_id: string;
  linked_profile_id: string | null;
  created_at: string;
}

interface ScheduledSession {
  id: string;
  student_id: string;
  parent_id: string;
  topic: string | null;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
  created_at: string;
}

export default function ParentDashboard() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const profile = auth?.profile;
  const signOut = auth?.signOut;

  const [students, setStudents] = useState<Student[]>([]);
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([]);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showScheduleSession, setShowScheduleSession] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    loadStudents();
    loadScheduledSessions();
  }, []);

  // Handle info messages from redirects (e.g., already_registered)
  useEffect(() => {
    const info = searchParams.get('info');
    if (info === 'already_registered') {
      toast.info('You already have an account! You have been signed in.');
      // Remove the query param to avoid showing the toast again on refresh
      searchParams.delete('info');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  async function loadStudents() {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading students:', error);
    } else {
      setStudents(data || []);
    }
  }

  async function loadScheduledSessions() {
    const { data, error } = await supabase
      .from('scheduled_sessions')
      .select('*')
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('Error loading sessions:', error);
    } else {
      setScheduledSessions(data || []);
    }
  }

  function handleStudentAdded() {
    setShowAddStudent(false);
    loadStudents();
  }

  function handleSessionScheduled() {
    setShowScheduleSession(false);
    setSelectedStudentId(null);
    loadScheduledSessions();
  }

  async function handleSignOut() {
    if (signOut) {
      await signOut();
      navigate('/');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-purple-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Math Mastery AI
            </span>
            <Badge variant="secondary" className="ml-2">Parent Portal</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{profile?.full_name}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* My Students Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                My Students
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setShowAddStudent(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Student
              </Button>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No students yet.</p>
                  <p className="text-sm mt-1">Add your first student to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{student.name}</span>
                            {student.linked_profile_id && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                <Link className="w-3 h-3 mr-1" />
                                Linked
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">Grade {student.grade_level}</div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStudentId(student.id);
                          setShowScheduleSession(true);
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Schedule
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Sessions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-500" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scheduledSessions.filter(s => s.status === 'pending').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarDays className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No upcoming sessions scheduled.</p>
                  <p className="text-sm mt-1">Schedule a session for your student.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduledSessions
                    .filter(s => s.status === 'pending')
                    .slice(0, 5)
                    .map((session) => {
                      const student = students.find(s => s.id === session.student_id);
                      return (
                        <div
                          key={session.id}
                          className="p-4 bg-blue-50 rounded-lg border border-blue-100"
                        >
                          <div className="font-semibold">{student?.name}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {session.topic || 'Practice Session'}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              {new Date(session.scheduled_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {session.scheduled_time}
                            </span>
                            <Badge variant="secondary">
                              {session.duration_minutes} min
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Session Reports */}
        <SessionReports students={students} />
      </div>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
          </DialogHeader>
          <AddStudentForm
            onSuccess={handleStudentAdded}
            onCancel={() => setShowAddStudent(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Schedule Session Dialog */}
      <Dialog open={showScheduleSession} onOpenChange={setShowScheduleSession}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Practice Session</DialogTitle>
          </DialogHeader>
          <ScheduleSessionForm
            students={students}
            selectedStudentId={selectedStudentId}
            onSuccess={handleSessionScheduled}
            onCancel={() => {
              setShowScheduleSession(false);
              setSelectedStudentId(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
