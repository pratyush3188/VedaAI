import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GitCompare, Bell, FileText, ChevronDown } from 'lucide-react';
import type { ReportRecord } from '../types';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export function Compare() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [report1Id, setReport1Id] = useState<string>('');
  const [report2Id, setReport2Id] = useState<string>('');

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
      if (data) {
        setReports(data as ReportRecord[]);
        if (data.length >= 2) {
          setReport1Id(data[1].id);
          setReport2Id(data[0].id);
        }
      }
    }
    fetch();
  }, []);

  const report1 = reports.find(r => r.id === report1Id);
  const report2 = reports.find(r => r.id === report2Id);

  const delta = (report2?.health_score || 0) - (report1?.health_score || 0);

  // Manual frontend mocked data since raw_data was erased from schema
  const biomarkers = [
     { name: 'Glucose', sub: 'Fasting plasma glucose', ref: '70 - 99 mg/dL', base: '104 mg/dL', cur: '94 mg/dL', improved: true },
     { name: 'LDL Cholesterol', sub: '"Bad" cholesterol', ref: '< 100 mg/dL', base: '142 mg/dL', cur: '118 mg/dL', improved: true },
     { name: 'Hemoglobin A1c', sub: '3-month glucose average', ref: '< 5.7%', base: '5.9%', cur: '5.8%', stable: true },
     { name: 'Potassium', sub: 'Electrolyte balance', ref: '3.5 - 5.2 mEq/L', base: '3.9 mEq/L', cur: '3.4 mEq/L', worsened: true }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Header Strip */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
         <div className="flex items-center gap-6">
           <Link to="/dashboard" className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
           <span className="text-slate-300 dark:text-slate-700">/</span>
           <Link to="/reports" className="text-sm font-bold text-[#0d5d67] dark:text-[#2dd4bf] border-b-2 border-[#0d5d67] dark:border-[#2dd4bf] pb-1">Reports</Link>
           <span className="text-slate-300 dark:text-slate-700">/</span>
           <span className="text-sm font-bold text-slate-500">Analytics</span>
         </div>
         <div className="flex items-center gap-4">
            <button className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold px-4 py-2 rounded-lg text-sm transition-colors border border-slate-200 dark:border-slate-700">Export PDF</button>
            <button className="bg-[#0d5d67] dark:bg-[#2dd4bf] text-white dark:text-slate-900 font-bold px-4 py-2 rounded-lg text-sm shadow-sm transition-colors">Compare New</button>
            <div className="border-l border-slate-200 dark:border-slate-700 pl-4 flex items-center gap-3">
               <Bell className="h-5 w-5 text-slate-400" />
               <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
         </div>
      </div>

      <div>
        <div className="text-[10px] font-black tracking-widest text-[#0d5d67] dark:text-[#2dd4bf] mb-2 uppercase">Comparative Analysis</div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Report Comparison</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg">Detailed variance analysis between metabolic panels from {report1 ? format(new Date(report1.created_at), 'MMMM') : 'Older'} and {report2 ? format(new Date(report2.created_at), 'MMMM yyyy') : 'Newer'}.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 !mt-12 rounded-[2rem] p-10 border border-slate-100 dark:border-slate-700 shadow-sm relative">
         
         {/* Top Grid Base Vs Insight */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
               <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Overall Health Score</h3>
                    <p className="text-slate-500 text-sm">Aggregate metabolic efficiency score</p>
                  </div>
                  {delta !== 0 && (
                     <span className={clsx(
                        "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        delta > 0 ? "bg-[#e0faff] text-[#0d5d67] dark:bg-[#0d5d67]/30 dark:text-[#2dd4bf]" : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                     )}>
                        {delta > 0 ? `+${delta} Points Improved` : `${delta} Points Worsened`}
                     </span>
                  )}
               </div>

               <div className="grid grid-cols-2 gap-8 items-center border-b border-slate-100 dark:border-slate-700 pb-12">
                  <div className="relative">
                     <div className="absolute top-0 right-0 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 z-10 w-full max-w-[180px]">
                       <select value={report1Id} onChange={e => setReport1Id(e.target.value)} className="w-full text-xs font-bold text-slate-500 bg-transparent outline-none uppercase tracking-widest cursor-pointer appearance-none">
                          <option value="" disabled>Select Baseline</option>
                          {reports.map(r => <option key={r.id} value={r.id}>{format(new Date(r.created_at), 'MMM dd')}</option>)}
                       </select>
                       <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                     </div>
                     <div className="text-6xl font-medium text-slate-300 dark:text-slate-600 mt-12 flex items-baseline gap-2">
                       {report1?.health_score || '--'}<span className="text-2xl text-slate-200 dark:text-slate-700 font-bold">/100</span>
                     </div>
                  </div>
                  
                  <div className="relative">
                     <div className="absolute top-0 right-0 p-2 bg-[#0d5d67]/10 dark:bg-[#2dd4bf]/10 rounded-lg border border-[#0d5d67]/20 dark:border-[#2dd4bf]/20 w-full max-w-[180px] z-10">
                       <select value={report2Id} onChange={e => setReport2Id(e.target.value)} className="w-full text-xs font-bold text-[#0d5d67] dark:text-[#2dd4bf] bg-transparent outline-none uppercase tracking-widest cursor-pointer appearance-none">
                          <option value="" disabled>Select Current</option>
                          {reports.map(r => <option key={r.id} value={r.id}>{format(new Date(r.created_at), 'MMM dd')}</option>)}
                       </select>
                       <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[#0d5d67] dark:text-[#2dd4bf] pointer-events-none" />
                     </div>
                     
                     <div className="mt-12 flex items-center gap-6">
                       <div className="text-6xl font-black text-[#0d5d67] dark:text-[#2dd4bf] flex items-baseline gap-2">
                         {report2?.health_score || '--'}<span className="text-2xl text-[#0d5d67]/50 dark:text-[#2dd4bf]/50 font-bold">/100</span>
                       </div>
                       {delta > 0 && <div className="h-1.5 w-32 bg-[#0d5d67] dark:bg-[#2dd4bf] rounded-full"></div>}
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-[#0f5f66] dark:bg-[#0a454a] rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between">
               <GitCompare className="h-6 w-6 text-white/50 mb-6" />
               <div>
                  <h3 className="text-lg font-bold mb-3">Quick Insight</h3>
                  <p className="text-teal-50/80 text-sm leading-relaxed mb-6">
                    Lipid profiles show marked improvement following the prescribed statin regimen started in late August. Baseline glucose levels have stabilized near the reference mean.
                  </p>
               </div>
               <button className="text-xs font-black uppercase tracking-widest text-white border-b border-white/30 self-start pb-1 hover:border-white transition-colors">View Full Report</button>
               <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full border-4 border-white/5"></div>
            </div>
         </div>

         {/* Key Biomarkers Table */}
         <div className="mb-16">
            <div className="flex justify-between items-end mb-6">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">Key Biomarkers</h3>
               <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full border border-slate-300"></div> {report1 ? format(new Date(report1.created_at), 'MMM dd') : 'Baseline'}</div>
                  <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-[#0d5d67] dark:bg-[#2dd4bf]"></div> {report2 ? format(new Date(report2.created_at), 'MMM dd') : 'Current'}</div>
               </div>
            </div>

            <table className="w-full text-left">
               <thead className="border-b border-slate-100 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                     <th className="py-4">Marker</th>
                     <th className="py-4">Reference Range</th>
                     <th className="py-4 text-center">Baseline (Old)</th>
                     <th className="py-4 text-center">Current (New)</th>
                     <th className="py-4 text-right">Trend</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {biomarkers.map((b, i) => (
                     <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-6 pr-4">
                           <div className="font-bold text-slate-900 dark:text-white">{b.name}</div>
                           <div className="text-xs font-medium text-slate-500 mt-1">{b.sub}</div>
                        </td>
                        <td className="py-6 text-sm font-medium text-slate-400">{b.ref}</td>
                        <td className="py-6 text-center text-sm font-medium text-slate-500 line-through decoration-slate-300">{b.base}</td>
                        <td className="py-6 text-center">
                           <span className={clsx("text-sm font-black", b.worsened ? "text-red-500" : "text-slate-900 dark:text-white")}>{b.cur}</span>
                        </td>
                        <td className="py-6 text-right">
                           {b.improved && <span className="text-sm font-bold text-[#0d5d67] dark:text-[#2dd4bf]">+ Improved</span>}
                           {b.stable && <span className="text-sm font-bold text-slate-400">— Stable</span>}
                           {b.worsened && <span className="text-sm font-bold text-red-500">+ Worsened</span>}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Bottom Split */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-slate-50/50 dark:bg-slate-900/20 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
            <div>
               <h3 className="text-xl font-bold flex items-center gap-3 mb-6"><FileText className="h-6 w-6 text-[#0d5d67] dark:text-[#2dd4bf]" /> Clinical Summary</h3>
               <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium text-sm">
                  Analysis of the <strong className="text-slate-900 dark:text-white">{report2 ? format(new Date(report2.created_at), 'MMM dd, yyyy') : 'New'}</strong> report against the <strong className="text-slate-900 dark:text-white">{report1 ? format(new Date(report1.created_at), 'MMM dd, yyyy') : 'Old'}</strong> baseline indicates significant positive movement in the patient's metabolic health profile.
               </p>
               <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-sm mb-6">
                  The primary driver of the Health Score increase (from {report1?.health_score || '--'} to {report2?.health_score || '--'}) is the reduction in LDL cholesterol and fasting glucose. Glucose levels have moved from pre-diabetic thresholds back into the normal reference range. However, a marginal decline in Potassium levels warrants observation, potentially linked to increased dietary sodium or diuretic effects.
               </p>
               <div className="pl-4 border-l-2 border-[#0d5d67] dark:border-[#2dd4bf]">
                  <p className="text-sm font-medium italic text-slate-500">"Patient shows excellent compliance with the therapeutic plan. Recommended continued monitoring of electrolyte balance." — Veda AI Diagnostic Model</p>
               </div>
            </div>

            <div className="bg-[#1e5f66] rounded-3xl p-8 relative overflow-hidden h-full flex flex-col justify-end min-h-[300px] border border-[#1e5f66]/50">
               {/* EKG Background Mock */}
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
               <svg className="absolute top-1/3 left-0 w-full h-32 opacity-20" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="2">
                  <path d="M0 50 L20 50 L25 30 L35 80 L45 20 L55 50 L100 50" />
               </svg>

               <div className="relative z-10 text-center mb-8">
                  <div className="text-white font-bold text-2xl tracking-wide mb-1">Safe Work</div>
                  <div className="text-[10px] uppercase font-black tracking-[0.2em] text-teal-100/70">Medical Remits Controlled</div>
               </div>

               <div className="relative z-10 mt-auto pt-6 border-t border-white/20">
                  <h4 className="text-white font-bold mb-2 text-lg">Next Recommendation</h4>
                  <p className="text-teal-50 text-sm">Schedule follow-up lipid panel in 90 days to confirm sustainability of progress.</p>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
