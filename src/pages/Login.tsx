import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BookOpen, Users } from 'lucide-react';

export default function Login() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'parent' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

  const { user, profile, loading: authLoading, signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle error messages and tab selection from redirects
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const tabParam = searchParams.get('tab');

    if (errorParam === 'no_account') {
      setError('No account found. Please register first before signing in with Google.');
      setActiveTab('register');
    } else if (errorParam === 'auth_failed') {
      setError('Authentication failed. Please try again.');
    }

    if (tabParam === 'register') {
      setActiveTab('register');
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && profile) {
      if (profile.role === 'parent') {
        navigate('/parent/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    }
  }, [user, profile, authLoading, navigate]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select whether you are a student or parent');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { needsEmailConfirmation } = await signUp(email, password, selectedRole);
      if (needsEmailConfirmation) {
        setShowEmailConfirmation(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    if (!selectedRole) {
      setError('Please select whether you are a student or parent before continuing with Google');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await signInWithGoogle(selectedRole);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setLoading(true);
    try {
      // For sign-in, we don't pass a role - this is for existing users only
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  // Show email confirmation message
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-8 relative overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full -top-52 -left-52 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full -bottom-36 -right-36 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
            animationDelay: '2s'
          }}
        />

        <div className="w-full max-w-md relative z-10">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-white/70 mb-6">
                We've sent a confirmation link to <span className="text-purple-400 font-medium">{email}</span>.
                Please check your inbox and click the link to activate your account.
              </p>
              <Button
                onClick={() => {
                  setShowEmailConfirmation(false);
                  setActiveTab('login');
                }}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Back to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full -top-52 -left-52 animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full -bottom-36 -right-36 animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
          animationDelay: '2s'
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo/logocorepus (1).svg" alt="CorePus Logo" className="h-14 w-14" />
            <img src="/name/solvesasdasd (1).svg" alt="CorePus" className="h-12" />
          </div>
          <p className="text-white/60 mt-2">Your personal AI math tutor</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
              <TabsList className="grid w-full grid-cols-2 bg-white/10">
                <TabsTrigger value="login" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                  Register
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-white/90">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-white/90">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Enter your password"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-red-500/20 border-red-500/50">
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white h-11"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-white/50">Or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 border-0 h-11"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </Button>

                <p className="text-center text-white/50 text-sm mt-4">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    Register here
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label className="text-white/90">I am a...</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('student')}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-center
                        ${selectedRole === 'student'
                          ? 'border-purple-500 bg-purple-500/20 text-white'
                          : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'
                        }
                      `}
                    >
                      <BookOpen className="w-8 h-8 mx-auto mb-2" />
                      <span className="font-medium">Student</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('parent')}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-center
                        ${selectedRole === 'parent'
                          ? 'border-pink-500 bg-pink-500/20 text-white'
                          : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'
                        }
                      `}
                    >
                      <Users className="w-8 h-8 mx-auto mb-2" />
                      <span className="font-medium">Parent</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-white/90">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-white/90">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Create a password (min 6 characters)"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-red-500/20 border-red-500/50">
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={loading || !selectedRole}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white h-11"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-white/50">Or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleRegister}
                  disabled={loading || !selectedRole}
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 border-0 h-11 disabled:opacity-50"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Register with Google
                </Button>

                <p className="text-center text-white/50 text-sm mt-4">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    Sign in here
                  </button>
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 text-center text-white/60 text-sm">
          <p className="mb-2">What you get:</p>
          <div className="flex justify-center gap-6">
            <span>AI Tutoring</span>
            <span>Progress Tracking</span>
            <span>Parent Reports</span>
          </div>
        </div>
      </div>
    </div>
  );
}
