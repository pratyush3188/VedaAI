import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { PlayCircle, Download, Share2, ShoppingBag, AlertTriangle, FileText, ChevronDown, CheckCircle2, Ban } from 'lucide-react';
import clsx from 'clsx';

interface DietPlan {
  strategy: string;
  description: string;
  meals: {
    name: string;
    description: string;
    tag: string;
    macros: Record<string, string>;
  }[];
  optimal_categories: {
    name: string;
    items: string[];
  }[];
  restricted_categories: {
    name: string;
    items: string[];
  }[];
  strict_avoidance: {
    name: string;
    description: string;
  }[];
  physician_note: string;
  alignment_score: number;
}



const EMOJI_MAP: Record<string, string> = {
  "Guava (Amrood)": "🍈",
  "Papaya (Papeeta)": "🥭",
  "Jamun": "🫐",
  "Bitter Gourd (Karela)": "🥒",
  "Okra (Bhindi)": "🫛",
  "Bottle Gourd (Lauki)": "🫙",
  "Mango (Aam)": "🥭",
  "Sapota (Chikoo)": "🥔",
  "Potatoes (Aloo)": "🥔",
  "Taro Root (Arbi)": "🍠",
};

export function Diet() {
  const { user, profile } = useAuthStore();
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [dietPreference, setDietPreference] = useState<string>('Vegetarian');
  const [loadingReports, setLoadingReports] = useState(true);
  
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    setLoadingReports(true);
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (data && data.length > 0) {
      setReports(data);
      setSelectedReportId(data[0].id);
    }
    setLoadingReports(false);
  };

  useEffect(() => {
    if (selectedReportId) {
      const report = reports.find(r => r.id === selectedReportId);
      if (report) {
        generateDietProtocol(report, dietPreference);
      }
    }
  }, [selectedReportId, dietPreference]);

  const generateDietProtocol = async (report: any, pref: string) => {
    setGenerating(true);
    setError('');
    try {
      let baseUrl = import.meta.env.VITE_API_URL || 'https://vedaai-backend-nhad.onrender.com';
      if (window.location.hostname === 'localhost') {
        baseUrl = 'http://localhost:8000';
      }
      const response = await axios.post(`${baseUrl}/api/generate-diet`, {
        report_analysis: report.simplified_text || "Patient has elevated inflammation and requires insulin sensitivity protocol.",
        patient_name: profile?.full_name || "User",
        age: 30, // Using default if not in profile
        gender: "Male",
        diet_preference: pref
      });
      setDietPlan(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred during analysis.');
    } finally {
      setGenerating(false);
    }
  };

  if (loadingReports) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading reports...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Top Selector Layout (like the original UI) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <label className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm hover:border-[#0d5d67] transition-colors cursor-pointer w-full sm:w-auto">
          <FileText className="h-5 w-5 text-slate-400" />
          <select 
            value={selectedReportId} 
            onChange={e => setSelectedReportId(e.target.value)}
            className="bg-transparent border-none outline-none font-bold text-sm text-slate-700 dark:text-slate-200 cursor-pointer appearance-none pr-8"
          >
            {reports.length === 0 && <option value="">No reports found</option>}
            {reports.map(r => (
              <option key={r.id} value={r.id}>
                {r.file_name} - {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </option>
            ))}
          </select>
          <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 pointer-events-none" />
        </label>

        <label className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm hover:border-[#0d5d67] transition-colors cursor-pointer w-full sm:w-auto">
          <div className="h-5 w-5 rounded-full flex items-center justify-center border-2 border-slate-400">
            <div className={clsx("h-2.5 w-2.5 rounded-full", dietPreference === 'Vegetarian' ? 'bg-green-500' : 'bg-red-500')} />
          </div>
          <select 
            value={dietPreference} 
            onChange={e => setDietPreference(e.target.value)}
            className="bg-transparent border-none outline-none font-bold text-sm text-slate-700 dark:text-slate-200 cursor-pointer appearance-none pr-8"
          >
            <option value="Vegetarian">Vegetarian Diet</option>
            <option value="Non-Vegetarian">Non-Vegetarian Diet</option>
          </select>
          <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 pointer-events-none" />
        </label>
      </div>

      {reports.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 font-medium">
          Select or upload a report in the Analyzer first to view diet recommendations.
        </div>
      ) : generating ? (
        <div className="p-16 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-3xl animate-pulse">
          <div className="w-12 h-12 border-4 border-[#0d5d67]/20 border-t-[#0d5d67] dark:border-[#2dd4bf]/20 dark:border-t-[#2dd4bf] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold">Protocol AI is analyzing your metabolic markers...</p>
          <p className="text-sm mt-2 opacity-70">Synthesizing specialized diet protocols based on your clinical data.</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-600 rounded-xl font-bold border border-red-200">
          Failed to generate diet: {error}
        </div>
      ) : dietPlan ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Hero Section */}
            <div className="bg-[#0f5f66] dark:bg-[#0a454a] rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
              <div className="absolute -right-20 -bottom-20 opacity-10">
                <svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M12 12c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/></svg>
              </div>
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest mb-6">Current Strategy</span>
                <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight max-w-2xl">{dietPlan.strategy}</h1>
                <p className="text-teal-50/80 text-lg md:text-xl max-w-2xl leading-relaxed mb-8 font-medium">
                  {dietPlan.description}
                </p>
                <div className="flex items-center gap-4">
                  <button className="bg-white text-[#0f5f66] hover:bg-slate-100 flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-lg">
                    <PlayCircle className="h-5 w-5" /> Listen to Summary
                  </button>
                  <span className="text-teal-50/60 text-sm font-medium tracking-wide">2 min audio briefing</span>
                </div>
              </div>
            </div>

            {/* Optimal Meal Prototypes */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-[#0d5d67] dark:text-[#2dd4bf]">Optimal Meal Prototypes</h2>
                <button className="text-slate-500 hover:text-[#0d5d67] dark:hover:text-[#2dd4bf] font-bold text-sm underline underline-offset-4 cursor-pointer">
                  View All Recipes
                </button>
              </div>

              {/* Meals List Mode Without Images */}
              <div className="flex flex-col gap-4 mb-8">
                {dietPlan.meals.map((meal, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col relative group">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white group-hover:text-[#0d5d67] dark:group-hover:text-[#2dd4bf] transition-colors pr-10">
                        {meal.name}
                      </h3>
                      <span className="shrink-0 bg-teal-50 dark:bg-teal-900/30 text-[#0d5d67] dark:text-[#2dd4bf] border border-teal-100 dark:border-teal-800 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide">
                        {meal.tag}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-5 leading-relaxed">
                      {meal.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
                      {Object.entries(meal.macros).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{key}:</span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fruits & Vegetables Protocol */}
            <div>
              <h2 className="text-2xl font-black text-[#0d5d67] dark:text-[#2dd4bf] mb-6">Fruits & Vegetables Protocol</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                
                {/* Left Column (Optimal) */}
                <div className="bg-white dark:bg-slate-800 p-8 flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center border border-teal-100 dark:border-teal-800">
                      <CheckCircle2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Optimal (Allowed)</h3>
                      <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">High Nutrient Density</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {dietPlan.optimal_categories.map((cat, i) => (
                      <div key={i}>
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">{cat.name}</h4>
                        <div className="flex flex-wrap gap-3">
                          {cat.items.map((item, j) => (
                            <div key={j} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                              <span>{EMOJI_MAP[item] || '🥗'}</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column (Restricted) */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-8 flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-100 dark:border-red-900/50">
                      <Ban className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Restricted (Avoid)</h3>
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Inflammatory / Glycemic Risks</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {dietPlan.restricted_categories.map((cat, i) => (
                      <div key={i}>
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">{cat.name}</h4>
                        <div className="flex flex-wrap gap-3">
                          {cat.items.map((item, j) => (
                            <div key={j} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 opacity-80 shadow-sm">
                              <span className="grayscale">{EMOJI_MAP[item] || '🍽️'}</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Strict Avoidance Card */}
            <div className="bg-slate-100 dark:bg-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Strict Avoidance</h2>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-8">Prohibited Compounds</p>
              
              <ul className="space-y-6 flex-1">
                {dietPlan.strict_avoidance.map((item, idx) => (
                  <li key={idx} className="relative pl-6">
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-red-500"></div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{item.name}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.description}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-8 bg-[#eadede] dark:bg-red-900/10 border border-[#e6d0d0] dark:border-red-900/30 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-500" strokeWidth={2.5} />
                  <span className="text-[10px] font-black text-red-600 dark:text-red-400 tracking-widest uppercase">Physician's Note</span>
                </div>
                <p className="text-xs text-[#8c6767] dark:text-red-300/80 font-medium leading-relaxed italic">
                  "{dietPlan.physician_note}"
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button className="w-full flex items-center justify-between bg-[#0f5f66] hover:bg-[#0a454a] text-white px-6 py-4 rounded-2xl font-bold transition-transform hover:-translate-y-1 shadow-md">
                <span className="flex items-center gap-3"><ShoppingBag className="h-5 w-5" /> Add to Grocery List</span>
                <span className="text-xl leading-none">→</span>
              </button>
              
              <button className="w-full flex items-center justify-between bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 text-slate-800 dark:text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-sm">
                <span className="flex items-center gap-3"><FileText className="h-5 w-5 text-slate-400" /> Download Full PDF Protocol</span>
                <Download className="h-5 w-5 text-slate-400" />
              </button>
              
              <button className="w-full flex items-center justify-between bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 text-slate-800 dark:text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-sm">
                <span className="flex items-center gap-3"><Share2 className="h-5 w-5 text-slate-400" /> Share with Dietitian</span>
                <span className="text-slate-400 opacity-60">▷</span>
              </button>
            </div>

            {/* Protocol Alignment */}
            <div className="bg-[#e9eff0] dark:bg-teal-900/20 rounded-2xl p-6 flex items-center justify-between border border-transparent dark:border-teal-900/50">
              <div>
                <p className="text-[10px] font-black text-[#0f5f66] dark:text-teal-400 uppercase tracking-widest mb-1">Protocol Alignment</p>
                <div className="text-3xl font-black text-[#0f5f66] dark:text-teal-400">{dietPlan.alignment_score}%</div>
              </div>
              <div className="h-12 w-12 border-[3px] border-[#0f5f66] dark:border-teal-400 rounded-xl flex items-center justify-center relative">
                 <div className="w-8 h-1 absolute -right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-900"></div>
                 <div className="text-[#0f5f66] dark:text-teal-400 font-bold text-xl">★</div>
              </div>
            </div>

          </div>
          
        </div>
      ) : null}

    </div>
  );
}
