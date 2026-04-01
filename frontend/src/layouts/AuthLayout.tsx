import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function AuthLayout() {
  const { session, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [authTrapLoading, setAuthTrapLoading] = useState(false);

  useEffect(() => {
     if (session) {
        const flow = sessionStorage.getItem('authFlow');
        if (flow) {
           const createdStr = session.user.created_at;
           // Fallback to safe time checking, 15 seconds window
           const isNew = createdStr ? (Date.now() - new Date(createdStr).getTime() < 15000) : false;
           
           if (flow === 'login' && isNew) {
              setAuthTrapLoading(true);
              sessionStorage.removeItem('authFlow');
              supabase.rpc('delete_user_account').then(() => {
                 supabase.auth.signOut().then(() => {
                    useAuthStore.setState({ session: null, user: null, profile: null });
                    navigate('/register', { state: { error: 'Account not found! Please register first to create an account.' }});
                    setAuthTrapLoading(false);
                 });
              });
              return;
           }
           
           if (flow === 'register' && !isNew) {
              setAuthTrapLoading(true);
              sessionStorage.removeItem('authFlow');
              supabase.auth.signOut().then(() => {
                 useAuthStore.setState({ session: null, user: null, profile: null });
                 navigate('/login', { state: { error: 'ID has already been created! Please use Sign In instead.' }});
                 setAuthTrapLoading(false);
              });
              return;
           }

           sessionStorage.removeItem('authFlow');
        }
     }
  }, [session, navigate]);

  if (isLoading || authTrapLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center">
        <Activity className="h-12 w-12 text-blue-500 animate-pulse mb-4" />
        <p className="text-slate-500 font-medium">Authenticating...</p>
      </div>
    );
  }

  if (session && !authTrapLoading && !sessionStorage.getItem('authFlow')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        <Outlet />
      </div>
    </div>
  );
}
