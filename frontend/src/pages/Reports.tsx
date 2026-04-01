import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Search, Download, Trash2, Link as LinkIcon, Bell, ChevronDown, Filter, ChevronRight, TrendingUp, ChevronLeft, Pin, Share2, ArrowUp, ArrowDown, FileDown } from 'lucide-react';
import type { ReportRecord } from '../types';
import clsx from 'clsx';
import { format, subDays, isAfter } from 'date-fns';
import { Link } from 'react-router-dom';

export function Reports() {
  const [reports, setReports] = useState<(ReportRecord & { trend?: 'up' | 'down' | 'flat' })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    if (data) {
       const chronological = [...data].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
       const withTrends = data.map(r => {
          const currentIndex = chronological.findIndex(cr => cr.id === r.id);
          const previousReport = currentIndex > 0 ? chronological[currentIndex - 1] : null;
          let trend: 'up' | 'down' | 'flat' = 'flat';
          if (previousReport) {
             if ((r.health_score || 0) > (previousReport.health_score || 0)) trend = 'up';
             else if ((r.health_score || 0) < (previousReport.health_score || 0)) trend = 'down';
          }
          return { ...r, trend };
       });

       const sorted = withTrends.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
       });
       
       setReports(sorted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (report: ReportRecord) => {
    if (window.confirm("Are you sure you want to completely delete this report?")) {
      if (report.original_pdf_url) {
        await supabase.storage.from('Reports').remove([report.original_pdf_url]);
      }
      await supabase.from('reports').delete().eq('id', report.id);
      fetchReports();
    }
  };

  const handleDownload = async (report: ReportRecord) => {
    if (!report.original_pdf_url) return alert("Original file not available in storage.");
    const { data, error } = await supabase.storage.from('Reports').createSignedUrl(report.original_pdf_url, 3600);
    if (error || !data) {
       alert("Failed to generate secure URL.");
    } else {
       window.open(data.signedUrl, '_blank');
    }
  };

  const downloadSimplified = (r: ReportRecord) => {
     if (!r.simplified_text) return alert('Simplified report is not available for this record.');
     const blob = new Blob([r.simplified_text], { type: 'text/plain' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `Veda-Simplified-${r.file_name || 'Report'}.txt`;
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     URL.revokeObjectURL(url);
  };

  const handlePin = async (r: ReportRecord) => {
     const newStatus = !r.pinned;
     await supabase.from('reports').update({ pinned: newStatus }).eq('id', r.id);
     fetchReports(); // Refresh sorting
  };

  const handleShare = (id: string) => {
     navigator.clipboard.writeText(`${window.location.origin}/analyzer?id=${id}`);
     setToast('Link copied to clipboard!');
     setTimeout(() => setToast(''), 3000);
  };

  // Derived Dynamic Data
  const thirtyDaysAgo = subDays(new Date(), 30);
  const monthlyVelocity = reports.filter(r => isAfter(new Date(r.created_at), thirtyDaysAgo)).length;
  const systemCapacity = reports.length > 0 ? Math.min(100, Math.round((monthlyVelocity / 200) * 100)) : 0; // Simulated capacity out of 200 target limit

  const lowestScoreReport = reports.length > 0 
     ? [...reports].sort((a, b) => (a.health_score || 0) - (b.health_score || 0))[0] 
     : null;

  const filtered = reports.filter(r => 
    r.file_name?.toLowerCase().includes(search.toLowerCase()) || 
    r.symptoms?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto relative pb-12">
      
      {/* Toast Notification */}
      {toast && (
         <div className="fixed top-6 right-6 z-50 bg-[#0d5d67] dark:bg-[#2dd4bf] text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold shadow-lg shadow-teal-500/20 animate-in fade-in slide-in-from-top-4">
            {toast}
         </div>
      )}

      {/* Search Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
         <div className="relative flex-1 max-w-2xl">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
           <input 
             type="text"
             value={search}
             onChange={e => setSearch(e.target.value)}
             placeholder="Search reports by date or finding..."
             className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-0 outline-none text-slate-900 dark:text-white"
           />
         </div>
         <div className="flex items-center gap-4 px-4 border-l border-slate-100 dark:border-slate-700">
           <button className="relative text-slate-400 hover:text-[#0d5d67] dark:hover:text-[#2dd4bf] transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
           </button>
           <div className="h-8 w-8 bg-[#0d5d67] text-white rounded-full flex items-center justify-center font-bold text-sm">AU</div>
         </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Medical Reports History</h1>
        <p className="text-slate-500 dark:text-slate-400">Review and manage clinical diagnostic findings from AI-assisted analyses.</p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-wrap gap-4 items-end">
         <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Date Range</label>
            <div className="relative">
              <select className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 outline-none">
                 <option>Last 30 Days</option>
                 <option>Last 6 Months</option>
                 <option>All Time</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
         </div>
         <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Status</label>
            <div className="relative">
              <select className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 outline-none">
                 <option>All Statuses</option>
                 <option>Critical</option>
                 <option>Normal</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
         </div>
         <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Organ System</label>
            <div className="relative">
              <select className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 outline-none">
                 <option>All Systems</option>
                 <option>Cardiovascular</option>
                 <option>Renal</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
         </div>
         <button className="bg-[#ccfbf1] dark:bg-[#0d5d67] text-[#0f766e] dark:text-[#2dd4bf] font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-teal-100 dark:hover:bg-[#0f766e] transition-colors">
            <Filter className="h-4 w-4" /> Apply Filters
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Dynamic Lowest Score Focus Card */}
         <div className="lg:col-span-2 bg-[#0d5d67] dark:bg-[#0a454a] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-lg">
             <div className="absolute top-0 right-0 h-64 w-64 rounded-full border-[16px] border-white/5 -translate-y-1/2 translate-x-1/3"></div>
             
             <div className="flex items-center gap-3 mb-6 relative z-10">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">High Priority Target</span>
                <div className="h-2 w-2 bg-red-400 rounded-full animate-pulse"></div>
             </div>
             
             <h2 className="text-2xl font-bold mb-3 relative z-10">{lowestScoreReport ? lowestScoreReport.file_name : 'No Reports Available'}</h2>
             <p className="text-teal-50/80 font-medium max-w-xl leading-relaxed mb-8 relative z-10 line-clamp-2">
               {lowestScoreReport?.symptoms || 'Awaiting clinical data upload to synthesize priority diagnostics. Metrics stable.'}
             </p>
             
             <div className="flex flex-wrap gap-4 relative z-10">
                {lowestScoreReport && (
                   <>
                     <Link to={`/analyzer?id=${lowestScoreReport.id}`} className="bg-white text-[#0d5d67] dark:text-[#0a454a] font-bold px-6 py-2.5 rounded-xl text-sm shadow-sm hover:bg-slate-50 transition-colors">Analyze Findings</Link>
                     <button onClick={() => downloadSimplified(lowestScoreReport)} className="bg-white/10 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-white/20 transition-colors border border-white/20 flex items-center gap-2">
                        <FileDown className="h-4 w-4" /> Download Simplified
                     </button>
                   </>
                )}
             </div>
         </div>

         {/* Dynamic Velocity Tracker */}
         <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Velocity</h3>
               <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            
            <div className="my-6">
               <div className="text-5xl font-black text-slate-900 dark:text-white mb-2">{monthlyVelocity}</div>
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Reports analyzed this month</p>
            </div>
            
            <div>
               <div className="flex justify-between items-end mb-2">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Capacity</span>
                 <span className="text-sm font-bold text-slate-900 dark:text-white">{systemCapacity}%</span>
               </div>
               <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0d5d67] dark:bg-[#2dd4bf] rounded-full transition-all duration-1000" style={{ width: `${systemCapacity}%` }}></div>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
         <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Patient Longitudinal Findings</h3>
            <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg"><Filter className="h-5 w-5 text-slate-400" /></button>
         </div>

         <div className="overflow-x-auto min-h-[300px]">
           {loading ? (
             <div className="p-12 text-center text-slate-500">Loading records...</div>
           ) : filtered.length === 0 ? (
             <div className="p-16 flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400">
                <FileText className="h-16 w-16 mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No records found</h3>
             </div>
           ) : (
             <table className="w-full text-left whitespace-nowrap">
               <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100 dark:border-slate-700">
                 <tr>
                   <th className="px-6 py-4">Date</th>
                   <th className="px-6 py-4">File Name</th>
                   <th className="px-6 py-4">Health Score</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                 {filtered.map(report => (
                   <tr key={report.id} className={clsx("hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors group", report.pinned && "bg-amber-50/30 dark:bg-amber-900/10")}>
                     <td className="px-6 py-5 text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                       {report.pinned && <Pin className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                       {format(new Date(report.created_at), 'MMM dd, yyyy')}
                     </td>
                     <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={clsx("h-8 w-8 rounded flex items-center justify-center", report.pinned ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" : "bg-[#f0fdfa] dark:bg-[#0f5f66]/30 text-[#0d5d67] dark:text-[#2dd4bf]")}>
                             <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white max-w-[200px] truncate block">{report.file_name}</span>
                            {report.symptoms && <p className="text-[11px] font-semibold text-slate-400 mt-1 truncate max-w-[200px]">{report.symptoms}</p>}
                          </div>
                        </div>
                     </td>
                     
                     <td className="px-6 py-5">
                       <div className="flex items-center gap-4 w-48">
                         <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                           <div 
                             className={clsx(
                               "h-full rounded-full",
                               (report.health_score || 0) > 80 ? 'bg-[#0d5d67] dark:bg-[#2dd4bf]' : 
                               (report.health_score || 0) > 50 ? 'bg-orange-400' : 'bg-red-500'
                             )}
                             style={{ width: `${report.health_score || 0}%` }}
                           ></div>
                         </div>
                         <div className="flex items-center gap-1.5 w-12">
                           <span className="font-bold text-slate-800 dark:text-white">{report.health_score || '--'}</span>
                           {report.trend === 'up' && <ArrowUp className="h-3 w-3 text-[#2dd4bf] stroke-[3]" />}
                           {report.trend === 'down' && <ArrowDown className="h-3 w-3 text-red-500 stroke-[3]" />}
                           {report.trend === 'flat' && <div className="h-3 w-3" />}
                         </div>
                       </div>
                     </td>
                     
                     <td className="px-6 py-5">
                        <span className={clsx(
                           "text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest",
                           report.status === 'Critical' ? "bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/30 dark:border-red-900" :
                           report.status === 'Fine' || !report.status ? "bg-[#ecfccb] text-[#4d7c0f] border border-[#d9f99d] dark:bg-[#0d5d67]/30 dark:text-[#2dd4bf] dark:border-[#0d5d67]" :
                           "bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-900/30 dark:border-orange-900"
                        )}>
                           {report.status || 'NORMAL'}
                        </span>
                     </td>
                     <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2 xl:opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handlePin(report)} className={clsx("p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors", report.pinned ? "text-amber-500 hover:text-amber-600" : "text-slate-400 hover:text-slate-600")} title={report.pinned ? "Unpin Note" : "Pin Note"}>
                            <Pin className={clsx("h-4 w-4", report.pinned && "fill-amber-500")} />
                         </button>
                         <button onClick={() => handleShare(report.id)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Copy Share Link">
                            <Share2 className="h-4 w-4" />
                         </button>
                         <button onClick={() => downloadSimplified(report)} className="p-2 text-slate-400 hover:text-[#0d5d67] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Download Simplified Plaintext">
                            <FileDown className="h-4 w-4" />
                         </button>
                         {report.original_pdf_url && (
                           <button onClick={() => handleDownload(report)} className="p-2 text-slate-400 hover:text-[#0d5d67] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Download Original">
                             <Download className="h-4 w-4" />
                           </button>
                         )}
                         <Link to={`/analyzer?id=${report.id}`} className="p-2 text-slate-400 hover:text-[#0d5d67] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Launch Analyzer">
                           <LinkIcon className="h-4 w-4" />
                         </Link>
                         <button onClick={() => handleDelete(report)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Permanently Delete">
                           <Trash2 className="h-4 w-4" />
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
         </div>

         <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing {filtered.length} reports</span>
            <div className="flex gap-2">
               <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                 <ChevronLeft className="h-4 w-4" />
               </button>
               <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-[#0d5d67] dark:bg-[#2dd4bf] text-white dark:text-slate-900 font-bold shadow-sm">
                 1
               </button>
               <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                 <ChevronRight className="h-4 w-4" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
