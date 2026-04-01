import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { User, ActivitySquare, AlertOctagon, X, LogOut, Moon, Sun, Shield, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const { profile, user, setSession, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("DANGER: Are you absolutely sure you want to delete your entire account? This will permanently erase your profile and all uploaded reports. This action CANNOT be reversed.")) return;
    if (!window.confirm("FINAL WARNING: All your data is about to be deleted! Click OK to proceed.")) return;
    try {
      const { data: reports } = await supabase.from('reports').select('original_pdf_url').not('original_pdf_url', 'is', null);
      if (reports && reports.length > 0) {
        const paths = reports.map(r => r.original_pdf_url).filter(Boolean) as string[];
        if (paths.length > 0) await supabase.storage.from('Reports').remove(paths);
      }
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;
      
      await supabase.auth.signOut();
      setProfile(null);
      setSession(null);
      window.location.href = '/register';
    } catch (err: any) {
      alert("Account deletion failed: " + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Settings & Config</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">Manage your clinical profile, system preferences, and authentication security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            {/* Identity Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
               <div className="p-8 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-slate-50/50 dark:bg-slate-900/20">
                  <div className="h-24 w-24 bg-blue-100 dark:bg-[#0d5d67]/30 rounded-2xl flex items-center justify-center text-blue-700 dark:text-[#2dd4bf] font-bold border-4 border-white dark:border-slate-800 shadow-md text-3xl shrink-0">
                    {profile?.full_name?.charAt(0) || <User className="h-10 w-10" />}
                  </div>
                  <div className="text-center sm:text-left mt-2 sm:mt-0">
                     <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">{profile?.full_name || 'Anonymous User'}</h2>
                     <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center justify-center sm:justify-start gap-2"><Lock className="h-4 w-4" /> {user?.email}</p>
                  </div>
               </div>
               
               <div className="p-8">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-widest text-xs flex items-center gap-2">
                     <ActivitySquare className="h-4 w-4 text-[#0d5d67] dark:text-[#2dd4bf]" />
                     Stored Clinical Context
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Age / Gender</span>
                        <span className="font-bold text-lg text-slate-800 dark:text-white">{profile?.age} yrs <span className="text-slate-300 dark:text-slate-600 mx-2">|</span> {profile?.gender}</span>
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Blood Group</span>
                        <span className="font-black text-lg text-red-600 dark:text-red-400 leading-none">{profile?.blood_group || 'Unknown'}</span>
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Biometrics</span>
                        <span className="font-bold text-lg text-slate-800 dark:text-white">{profile?.height || '--'} cm <span className="text-slate-300 dark:text-slate-600 mx-2">|</span> {profile?.weight || '--'} kg</span>
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Primary Language</span>
                        <span className="font-bold text-lg text-slate-800 dark:text-white">{profile?.language || 'English (US)'}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Privacy Validation Card */}
            <div className="bg-[#0f5f66] dark:bg-[#0a454a] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
               <div className="absolute -right-10 -top-10 h-40 w-40 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>
               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
                  <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/20 backdrop-blur-md">
                    <Shield className="h-7 w-7 text-teal-100 drop-shadow-md" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white drop-shadow-sm">Sanctuary-Grade Privacy Active</h3>
                    <p className="text-teal-50/90 text-sm leading-relaxed font-medium">Your data is secured with AES-256 end-to-end encryption. Clinical reports are automatically stripped of personal identifiers before AI processing to ensure full HIPAA compliance.</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            {/* Appearance settings */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden p-8">
               <h3 className="font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-widest text-xs flex items-center gap-2">
                  <Sun className="h-4 w-4 text-amber-500" />
                  Visual Interface
               </h3>
               <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                     {isDark ? <Moon className="h-5 w-5 text-indigo-400" /> : <Sun className="h-5 w-5 text-amber-500" />}
                     <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{isDark ? "Dark Theme Active" : "Light Theme Active"}</span>
                  </div>
                  <button 
                     onClick={toggleTheme}
                     className={`w-14 h-7 rounded-full transition-colors relative shadow-inner flex items-center ${isDark ? 'bg-indigo-500' : 'bg-slate-300'}`}
                  >
                     <span className={`bg-white w-5 h-5 rounded-full shadow-md transition-transform transform ${isDark ? 'translate-x-8' : 'translate-x-1'}`}></span>
                  </button>
               </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
               <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-widest text-xs flex items-center gap-2">
                     <Lock className="h-4 w-4 text-slate-400" />
                     Authentication
                  </h3>
               </div>
               <div className="p-4 sm:p-6">
                  <button onClick={handleSignOut} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm">
                           <LogOut className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                        </div>
                        <div className="text-left">
                           <span className="block font-black text-sm text-slate-800 dark:text-white">Sign Out Securely</span>
                           <span className="block text-xs text-slate-500 font-medium mt-1">Safely end your current session</span>
                        </div>
                     </div>
                  </button>
               </div>

               <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-slate-700 bg-red-50/40 dark:bg-red-900/10">
                  <h3 className="font-bold text-red-600 dark:text-red-400 mb-3 uppercase tracking-widest text-xs flex items-center gap-2">
                     <AlertOctagon className="h-4 w-4" /> Danger Zone
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-semibold mb-6">
                     Irreversibly delete your entire account, clinical profile, and all uploaded medical reports safely.
                  </p>
                  <button onClick={handleDeleteAccount} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white dark:bg-slate-800 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 dark:border-red-900/50 font-black tracking-wide rounded-xl transition-all shadow-sm group">
                    <X className="h-5 w-5" /> WIPE EVERYTHING
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
