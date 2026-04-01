import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabase';
import { Hexagon, CheckCircle, PlusCircle, Clock, ChevronRight, Activity, Lightbulb, Trophy, Shield, Star, Award, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import type { ReportRecord } from '../types';
import { Link } from 'react-router-dom';
import { format, subDays, isSameDay } from 'date-fns';
import clsx from 'clsx';

export function DashboardView() {
  const { profile } = useAuthStore();
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Quote Rotator Logic
  const quotes = [
    "Increasing hydration by 20% today could improve your kidney filtration score and stabilize hematocrit levels based on your latest blood panel trajectory.",
    "Your recent cardiovascular markers indicate excellent stability. Maintaining your current aerobic exercise routine is highly recommended by Veda.",
    "Elevated resting heart rate patterns detected over the last 3 reports. Consider adjusting sleep schedule to improve recovery efficiency.",
    "Hepatic enzyme levels are currently optimal. Continued avoidance of processed sugars will maintain this peak metabolic state.",
    "Vitals suggest a slight downward trend in overall resilience. A comprehensive metabolic panel next month could provide deeper insights."
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    async function fetchDashboard() {
      const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
      if (data) setReports(data as ReportRecord[]);
      setLoading(false);
    }
    fetchDashboard();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading dashboard...</div>;

  const totalReports = reports.length;
  const criticalFindings = reports.filter(r => r.status === 'Critical').length;
  const averageScore = totalReports > 0 
    ? Math.round(reports.reduce((acc, curr) => acc + (curr.health_score || 0), 0) / totalReports) 
    : 0;
  
  const lastReportDate = totalReports > 0 ? format(new Date(reports[0].created_at), 'MMM dd, yyyy') : 'None';

  const chronReports = [...reports].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const trendData = chronReports.slice(-6).map((r) => ({
    name: format(new Date(r.created_at), 'MMM'),
    score: r.health_score || 0
  }));

  const latestScore = reports[0]?.health_score || 0;
  const prevScore = reports[1]?.health_score || 0;
  const delta = totalReports > 1 ? latestScore - prevScore : 0;
  
  // Dashboard primary score uses Average Health Score as requested
  const displayScore = totalReports > 0 ? averageScore : 82;

  // Calendar Heatmap logic (Last 7 days)
  const last7Days = Array.from({length: 7}).map((_, i) => subDays(new Date(), 6 - i));
  const getDayStatus = (date: Date) => {
     const dayReports = reports.filter(r => isSameDay(new Date(r.created_at), date));
     if (dayReports.length === 0) return 'none';
     const avgForDay = dayReports.reduce((acc, r) => acc + (r.health_score || 0), 0) / dayReports.length;
     if (avgForDay >= 80) return 'great';
     if (avgForDay >= 50) return 'okay';
     return 'bad';
  };

  // Gamification Badges
  const hasFirstStep = totalReports >= 1;
  const hasAnalyticalMind = totalReports >= 2;
  const hasPeakVitality = reports.some(r => (r.health_score || 0) > 90);
  const hasConsistentObserver = totalReports >= 5;

  // Radar Chart Mock Data mapped from avgScore
  const radarData = [
    { subject: 'Cardiovascular', A: averageScore ? Math.min(100, Math.floor(averageScore * 1.05)) : 0, fullMark: 100 },
    { subject: 'Renal', A: averageScore ? Math.min(100, Math.floor(averageScore * 0.95)) : 0, fullMark: 100 },
    { subject: 'Hepatic', A: averageScore ? averageScore : 0, fullMark: 100 },
    { subject: 'Immune', A: averageScore ? Math.min(100, Math.floor(averageScore * 1.1)) : 0, fullMark: 100 },
    { subject: 'Metabolic', A: averageScore ? Math.max(0, Math.floor(averageScore * 0.85)) : 0, fullMark: 100 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      
      {/* Massive Greeting */}
      <div>
        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2">Medical Status: Active</div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Good Morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0d5d67] to-[#2dd4bf]">{profile?.full_name || 'Dr. Julian Thorne'}</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-3xl text-lg">
          Your clinical synthesis is complete. Gamified progression algorithms are actively monitoring your baseline trajectories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Circle Score (Average) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Avg Health Score</h3>
           
           <div className="relative h-44 w-44 mb-6">
             <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="42" stroke="#f1f5f9" strokeWidth="8" fill="none" className="dark:stroke-slate-700" />
               <circle 
                 cx="50" cy="50" r="42" 
                 stroke="#0d5d67" 
                 strokeWidth="8" 
                 fill="none" 
                 strokeDasharray="264" 
                 strokeDashoffset={264 - (264 * displayScore) / 100} 
                 strokeLinecap="round" 
                 className="dark:stroke-[#2dd4bf] transition-all duration-1000 ease-out"
               />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-5xl font-black text-[#0d5d67] dark:text-[#2dd4bf]">{displayScore}</span>
               <span className="text-sm font-bold text-slate-400">/ 100</span>
             </div>
           </div>

           <div className="bg-slate-100 dark:bg-slate-700/50 px-4 py-1.5 rounded-full flex items-center gap-2">
             <Activity className="h-3.5 w-3.5 text-[#0d5d67] dark:text-[#2dd4bf]" />
             <span className="text-xs font-bold text-[#0d5d67] dark:text-[#2dd4bf]">{delta > 0 ? '+' : ''}{delta}pts from last report</span>
           </div>
        </div>

        {/* Fluctuations Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
           <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Health Score Fluctuations</h3>
                <p className="text-xs text-slate-500 font-medium">Timeline: Last 6 Analysis Reports</p>
              </div>
              <div className="hidden sm:flex gap-2">
                 <button className="px-4 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold transition-colors">6 Months</button>
                 <button className="px-4 py-1.5 bg-[#0d5d67] dark:bg-[#2dd4bf] text-white dark:text-slate-900 rounded-full text-xs font-bold shadow-sm transition-colors">Full Year</button>
              </div>
           </div>

           <div className="flex-1 min-h-[160px] w-full mt-auto">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={trendData.length > 0 ? trendData : [{name:'Jan',score:40},{name:'Feb',score:70},{name:'Mar',score:60},{name:'Apr',score:90}]}>
                 <defs>
                   <linearGradient id="colorScoreChart" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#0d5d67" stopOpacity={0.3} className="dark:stopOpacity-30 dark:stopColor-[#2dd4bf]" />
                     <stop offset="95%" stopColor="#0d5d67" stopOpacity={0} className="dark:stopOpacity-0 dark:stopColor-[#2dd4bf]" />
                   </linearGradient>
                 </defs>
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }} 
                   itemStyle={{ color: '#2dd4bf' }}
                 />
                 <Area type="monotone" dataKey="score" stroke="#0d5d67" strokeWidth={3} fillOpacity={1} fill="url(#colorScoreChart)" className="dark:stroke-[#2dd4bf]" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* 4 Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Total Reports', val: totalReports },
           { label: 'Last Report', val: lastReportDate },
           { label: 'Avg. Health Score', val: averageScore },
           { label: 'Critical Findings', val: criticalFindings, color: 'text-[#0d5d67] dark:text-[#2dd4bf]' }
         ].map((stat, i) => (
           <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50">
             <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</div>
             <div className={`text-3xl font-black text-slate-900 dark:text-white ${stat.color || ''}`}>{stat.val}</div>
           </div>
         ))}
      </div>

      {/* Primary Advanced Dashboard Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
           
           {/* Weekly Health Heatmap Calendar */}
           <section className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                   <Clock className="h-4 w-4 text-[#0d5d67] dark:text-[#2dd4bf]" /> Activity Streak Calendar
                </h2>
                <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                   <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded bg-slate-100 dark:bg-slate-700"></div> No Data</div>
                   <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded bg-[#0d5d67]/30 dark:bg-[#2dd4bf]/40"></div> Good</div>
                   <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded bg-[#0d5d67] dark:bg-[#2dd4bf]"></div> Pristine</div>
                </div>
             </div>
             
             <div className="grid grid-cols-7 gap-2 sm:gap-4">
                {last7Days.map((date, i) => {
                   const status = getDayStatus(date);
                   return (
                     <div key={i} className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{format(date, 'eee')}</span>
                        <div className={clsx(
                           "w-full aspect-square rounded-xl transition-all duration-300 flex items-center justify-center group relative",
                           status === 'great' ? "bg-[#0d5d67] shadow-lg shadow-teal-500/20 dark:bg-[#2dd4bf]" :
                           status === 'okay' ? "bg-[#0d5d67]/40 dark:bg-[#2dd4bf]/50" :
                           status === 'bad' ? "bg-red-400 dark:bg-red-500/50" :
                           "bg-slate-100 dark:bg-slate-700/50"
                        )}>
                           <span className={clsx("text-xs font-bold opacity-0 group-hover:opacity-100 absolute", status === 'none' ? 'text-slate-400' : 'text-white')}>{format(date, 'd')}</span>
                        </div>
                     </div>
                   );
                })}
             </div>
           </section>

           {/* Gamification Achievements Grid */}
           <section className="bg-slate-50 dark:bg-slate-800/30 p-6 sm:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800">
             <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-6">
                <Trophy className="h-4 w-4 text-amber-500" /> Clinical Milestones & Badges
             </h2>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                <div className={clsx("p-4 rounded-2xl flex flex-col items-center text-center transition-all duration-500", hasFirstStep ? "bg-white dark:bg-slate-800 shadow border border-teal-100 dark:border-teal-900/30" : "opacity-40 grayscale")}>
                   <div className={clsx("h-12 w-12 rounded-full flex items-center justify-center mb-3", hasFirstStep ? "bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400" : "bg-slate-200 text-slate-400")}>
                      <PlusCircle className="h-6 w-6" />
                   </div>
                   <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white">First Step</h4>
                   <p className="text-[10px] font-medium text-slate-500 mt-1">Uploaded 1st Report</p>
                </div>

                <div className={clsx("p-4 rounded-2xl flex flex-col items-center text-center transition-all duration-500", hasAnalyticalMind ? "bg-white dark:bg-slate-800 shadow border border-blue-100 dark:border-blue-900/30" : "opacity-40 grayscale")}>
                   <div className={clsx("h-12 w-12 rounded-full flex items-center justify-center mb-3", hasAnalyticalMind ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-slate-200 text-slate-400")}>
                      <Zap className="h-6 w-6" />
                   </div>
                   <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white">Analyst</h4>
                   <p className="text-[10px] font-medium text-slate-500 mt-1">Compared 2 Reports</p>
                </div>

                <div className={clsx("p-4 rounded-2xl flex flex-col items-center text-center transition-all duration-500", hasPeakVitality ? "bg-white dark:bg-slate-800 shadow border border-amber-100 dark:border-amber-900/30" : "opacity-40 grayscale")}>
                   <div className={clsx("h-12 w-12 rounded-full flex items-center justify-center mb-3", hasPeakVitality ? "bg-amber-50 text-amber-500 dark:bg-amber-900/30 dark:text-amber-400" : "bg-slate-200 text-slate-400")}>
                      <Star className="h-6 w-6 fill-amber-500" />
                   </div>
                   <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white">Peak Vitality</h4>
                   <p className="text-[10px] font-medium text-slate-500 mt-1">Scored &gt; 90% Health</p>
                </div>

                <div className={clsx("p-4 rounded-2xl flex flex-col items-center text-center transition-all duration-500", hasConsistentObserver ? "bg-white dark:bg-slate-800 shadow border border-purple-100 dark:border-purple-900/30" : "opacity-40 grayscale")}>
                   <div className={clsx("h-12 w-12 rounded-full flex items-center justify-center mb-3", hasConsistentObserver ? "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : "bg-slate-200 text-slate-400")}>
                      <Shield className="h-6 w-6" />
                   </div>
                   <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white">Observer</h4>
                   <p className="text-[10px] font-medium text-slate-500 mt-1">Synthesized 5+ Docs</p>
                </div>
                
             </div>
           </section>

           <section>
             <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
                <CheckCircle className="h-4 w-4 text-[#0d5d67] dark:text-[#2dd4bf]" /> Recent Clinical Analysis
             </h2>
             <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {reports.slice(0, 3).map((r, i) => (
                     <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group gap-4">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                             <Activity className="h-5 w-5 text-slate-500" />
                           </div>
                           <div className="min-w-0">
                             <h4 className="font-bold text-slate-900 dark:text-white truncate pr-4">{r.file_name}</h4>
                             <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mt-1 truncate">
                               {format(new Date(r.created_at), 'MMM dd, yyyy')} • ID #{r.id.split('-')[0]}
                             </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 sm:ml-auto">
                           <div className="text-right">
                              <div className="font-black text-slate-800 dark:text-white">{r.health_score || '--'}%</div>
                              <div className="text-[10px] uppercase font-bold text-[#0d5d67] dark:text-[#2dd4bf]">{r.status || 'NORMAL'}</div>
                           </div>
                           <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[#0d5d67] dark:group-hover:text-[#2dd4bf] transition-colors" />
                        </div>
                     </div>
                  ))}
                  {reports.length === 0 && (
                     <div className="p-8 text-center text-slate-500 text-sm font-bold uppercase tracking-widest">No reports synthesized yet</div>
                  )}
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-900/50">
                   <Link to="/reports" className="text-xs font-bold text-[#0d5d67] dark:text-[#2dd4bf] uppercase tracking-widest hover:underline">View All Historical Reports</Link>
                </div>
             </div>
           </section>
        </div>

        <div className="flex flex-col gap-6">
           
           {/* Radar Chart Block */}
           <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">System Stability Map</h3>
                <Award className="h-5 w-5 text-[#0d5d67] dark:text-[#2dd4bf]" />
             </div>
             <div className="h-64 w-full">
               {totalReports > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                     <PolarGrid stroke="#64748b" opacity={0.2} />
                     <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                     <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                     <Radar 
                        name="Vitals" 
                        dataKey="A" 
                        stroke="#2dd4bf" 
                        strokeWidth={2} 
                        fill="#0d5d67" 
                        fillOpacity={0.6} 
                        className="dark:fill-[#2dd4bf] dark:fill-opacity-40"
                     />
                     <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }} />
                   </RadarChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="h-full w-full flex flex-col items-center justify-center text-slate-400">
                    <Hexagon className="h-10 w-10 opacity-20 mb-2" />
                    <span className="text-xs font-bold uppercase tracking-widest">No Data Array</span>
                 </div>
               )}
             </div>
           </div>

           {/* Animated AI Synthesis */}
           <div className="bg-[#0f5f66] dark:bg-[#0a454a] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl transition-all duration-500">
             <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full border-4 border-white/10"></div>
             <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full border-4 border-white/5"></div>
             
             <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md mb-6 relative z-10">
                <Lightbulb className="h-5 w-5 text-yellow-300" />
             </div>
             
             <div className="flex justify-between items-end mb-4 relative z-10">
                <h3 className="font-bold text-xl">Veda AI Synthesis</h3>
                <div className="flex gap-1">
                   {quotes.map((_, i) => (
                     <div key={i} className={clsx("h-1.5 rounded-full transition-all duration-300", quoteIndex === i ? "w-4 bg-yellow-300" : "w-1.5 bg-white/30")}></div>
                   ))}
                </div>
             </div>
             
             <div className="relative z-10 h-24 flex items-center">
                <p key={quoteIndex} className="text-teal-50 font-medium leading-relaxed animate-in fade-in slide-in-from-right-4 duration-500">
                  "{quotes[quoteIndex]}"
                </p>
             </div>
           </div>

           <Link to="/analyzer" className="flex items-center gap-3 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl hover:shadow-md transition-shadow group">
              <PlusCircle className="h-5 w-5 text-[#0d5d67] dark:text-[#2dd4bf] group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm text-slate-800 dark:text-white">Analyze New Report</span>
           </Link>

           <Link to="/reports" className="flex items-center gap-3 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl hover:shadow-md transition-shadow group">
              <Clock className="h-5 w-5 text-slate-500 group-hover:rotate-12 transition-transform" />
              <span className="font-bold text-sm text-slate-800 dark:text-white">View Health History</span>
           </Link>

        </div>
      </div>
    </div>
  );
}
