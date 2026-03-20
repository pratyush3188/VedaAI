import React, { useRef } from 'react';
import type { Patient } from '../types';
import { AlertTriangle, Download, FileText, ArrowLeft, Activity, User, Stethoscope, HeartPulse, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';

interface DashboardProps {
  patient: Patient;
  onClose: () => void;
}

const COLORS = {
  Normal: '#22c55e', // green-500
  'Attention Required': '#eab308', // yellow-500
  Critical: '#ef4444', // red-500
};

export function Dashboard({ patient, onClose }: DashboardProps) {
  const result = patient.reportData;
  const data = result?.data;
  const contentRef = useRef<HTMLDivElement>(null);
  
  const handleDownloadPdf = () => {
    window.print();
  };

  const pieData = data?.class_distribution ? Object.entries(data.class_distribution).map(([name, value]) => ({ name, value })) : [];

  const barData = data?.lab_values?.map((l) => {
    let numericVal = 0;
    try { numericVal = parseFloat(String(l.value).replace(/[^0-9.]/g, '')); } catch (e) {}
    return {
      name: l.name,
      value: numericVal,
      display: `${l.value} ${l.unit || ''}`,
      range: l.range,
      severity: l.severity
    }
  }) || [];

  // Mock health trend data for line chart
  const currentScore = data?.health_score ?? (100 - patient.dangerPercentage);
  const trendData = [
    { month: 'Jan', score: Math.max(0, currentScore - 15) },
    { month: 'Feb', score: Math.max(0, currentScore - 5) },
    { month: 'Mar', score: currentScore },
  ];

  // Conditional styling based on patient status
  const isCritical = patient.status === 'Critical';
  const isAttention = patient.status === 'Attention Required';
  const isFine = patient.status === 'Fine';

  const wrapperClass = clsx(
    "fixed inset-0 z-50 overflow-y-auto bg-slate-50 dark:bg-slate-900 flex justify-center p-0 sm:p-4 lg:p-6",
    "transition-colors duration-300",
    "print:static print:inset-auto print:overflow-visible print:bg-white print:p-0",
    isCritical ? "shadow-[inset_0_0_100px_rgba(239,68,68,0.2)] dark:shadow-[inset_0_0_100px_rgba(239,68,68,0.15)]" :
    isFine     ? "shadow-[inset_0_0_100px_rgba(34,197,94,0.1)] dark:shadow-[inset_0_0_100px_rgba(34,197,94,0.05)]" :
                 "shadow-[inset_0_0_100px_rgba(234,179,8,0.1)] dark:shadow-[inset_0_0_100px_rgba(234,179,8,0.05)]"
  );

  const containerClass = clsx(
    "w-full max-w-7xl mx-auto sm:rounded-2xl shadow-2xl flex flex-col border",
    "bg-white dark:bg-slate-800 transition-colors duration-300",
    "print:shadow-none print:border-none print:rounded-none print:max-w-none print:block",
    isCritical ? "border-red-400 dark:border-red-900/50" :
    isAttention ? "border-orange-300 dark:border-orange-900/50" :
                  "border-green-300 dark:border-green-900/50"
  );

  return (
    <div className={wrapperClass}>
      <div className={containerClass}>
        {/* Header - Blue Navbar specifically requested */}
        <div className="sticky top-0 z-10 px-6 py-4 sm:rounded-t-2xl bg-blue-600 dark:bg-blue-700 text-white shadow-md flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-blue-50"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                {patient.name}
                <span className={clsx(
                  "text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold shadow-sm",
                  isCritical && "bg-red-500 text-white animate-pulse",
                  isAttention && "bg-orange-400 text-white",
                  isFine && "bg-green-500 text-white"
                )}>
                  {patient.status}
                </span>
              </h2>
            </div>
          </div>
          {result?.markdown && (
            <button onClick={handleDownloadPdf} className="flex items-center gap-2 px-5 py-2.5 text-sm bg-white text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-bold shadow-sm">
              <Download className="h-5 w-5" /> Download PDF
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto print:overflow-visible" ref={contentRef}>
          <div className="p-6 md:p-8 space-y-8">
            {/* Critical Alert Banner */}
            {data?.critical_alert && (
              <div className="bg-red-600 text-white p-5 rounded-2xl shadow-lg flex items-center gap-4">
                <AlertTriangle className="h-10 w-10 shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-wide">Critical Values Detected</h3>
                  <p className="text-red-100 text-lg">Immediate medical attention is strongly advised based on these findings.</p>
                </div>
              </div>
            )}

            {/* Structured Info Cards at the Top */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl"><User className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Patient Details</p>
                  <p className="font-bold text-slate-800 dark:text-white text-lg">{patient.name}</p>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mt-0.5">{patient.age} yrs • {patient.gender}</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl"><HeartPulse className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Presumed Condition</p>
                  <p className="font-bold text-slate-800 dark:text-white text-lg capitalize line-clamp-2" title={data?.disease_prediction}>{data?.disease_prediction || "Evaluating..."}</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl"><Stethoscope className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Attending Doctor</p>
                  <p className="font-bold text-slate-800 dark:text-white text-lg line-clamp-2" title={data?.doctor_name}>{data?.doctor_name || "Unspecified"}</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-xl"><Building2 className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Hospital/Clinic</p>
                  <p className="font-bold text-slate-800 dark:text-white text-lg line-clamp-2" title={data?.hospital_name}>{data?.hospital_name || "Unspecified"}</p>
                </div>
              </div>
            </div>

            {data?.symptoms_found && (
              <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border-l-4 border-orange-400 shadow-sm">
                <p className="text-sm font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider mb-1">Reported Symptoms</p>
                <p className="text-slate-800 dark:text-slate-200 text-lg">{data.symptoms_found}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Markdown Output or Placeholder */}
              <div className="lg:col-span-8 flex flex-col gap-8">
                <div className="bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">
                    <FileText className="h-7 w-7 text-blue-600 dark:text-blue-400" /> Clinical Report Summary
                  </h3>
                  {result?.markdown ? (
                    <div className="prose prose-slate prose-lg dark:prose-invert prose-blue max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl md:prose-headings:text-3xl">
                      <ReactMarkdown>{result.markdown}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                      <Activity className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">No detailed AI report available for this patient.</p>
                      <p className="text-base mt-2">Upload a document to generate a full analysis.</p>
                    </div>
                  )}
                </div>
                
                {result?.raw_text && (
                  <div className="bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-700 text-slate-300 print:hidden">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-700 pb-2">Extracted Raw Text</h4>
                    <div className="max-h-64 overflow-y-auto font-mono text-xs sm:text-sm whitespace-pre-wrap px-2">
                      {result.raw_text}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Visual Dashboard */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Health Score Custom Gauge */}
                {data?.health_score !== undefined && (
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center transition-colors shadow-sm">
                    <h4 className="text-slate-600 dark:text-slate-400 font-bold mb-6 text-lg tracking-wide uppercase">Health Index</h4>
                    <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-[8px]" 
                      style={{ 
                        borderColor: data.health_score > 80 ? COLORS.Normal : data.health_score > 50 ? COLORS['Attention Required'] : COLORS.Critical,
                        borderBottomColor: 'transparent', borderRightColor: 'transparent'
                      }}>
                      <div className="text-6xl font-black text-slate-800 dark:text-white">{data.health_score}</div>
                    </div>
                    <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 text-center font-medium">Index out of 100 based on lab vitals.</p>
                  </div>
                )}

                {/* Finding Distribution Pie */}
                {pieData.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 transition-colors shadow-sm">
                    <h4 className="text-slate-600 dark:text-slate-400 font-bold mb-4 text-base tracking-wide uppercase">Finding Distribution</h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#94a3b8'} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 text-sm mt-4 font-semibold text-slate-700 dark:text-slate-300">
                      {pieData.map(p => (
                         <span key={p.name} className="flex items-center gap-2">
                           <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[p.name as keyof typeof COLORS] }}></span>
                           {p.name} ({p.value})
                         </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Health Trend Line Chart */}
                <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 transition-colors shadow-sm print:hidden">
                  <h4 className="text-slate-600 dark:text-slate-400 font-bold mb-6 text-base tracking-wide uppercase">Health Trend</h4>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false} opacity={0.3} />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={14} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={14} tickLine={false} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                        <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={4} dot={{ r: 5, fill: '#3b82f6' }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Lab Values Bar Chart & Status Cards */}
                {data?.lab_values && data.lab_values.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 transition-colors shadow-sm">
                    <h4 className="text-slate-600 dark:text-slate-400 font-bold mb-6 text-base tracking-wide uppercase">Lab Breakdown</h4>
                    <div className="h-72 w-full mb-8 text-sm font-sans">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                          <XAxis type="number" stroke="#94a3b8" tickLine={false} />
                          <YAxis dataKey="name" type="category" width={90} stroke="#94a3b8" tickLine={false} fontSize={12} />
                          <Tooltip cursor={{fill: 'rgba(148, 163, 184, 0.1)'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                            {barData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[entry.severity as keyof typeof COLORS] || '#94a3b8'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                      {data.lab_values.map((lab, i) => (
                        <div key={i} className={clsx(
                          "p-4 rounded-xl shadow-sm border flex justify-between items-center transition-colors",
                          lab.severity === 'Normal' && "bg-green-50/80 dark:bg-green-900/10 border-green-200 dark:border-green-900/50 text-green-900 dark:text-green-300",
                          lab.severity === 'Attention Required' && "bg-yellow-50/80 dark:bg-orange-900/10 border-yellow-200 dark:border-orange-900/50 text-yellow-900 dark:text-orange-300",
                          lab.severity === 'Critical' && "bg-red-50/80 dark:bg-red-900/10 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-300"
                        )}>
                          <div>
                            <div className="font-bold text-base mb-1">{lab.name}</div>
                            <div className="text-xs font-medium opacity-80">Range: {lab.range}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-xl">{lab.value} <span className="text-sm font-bold opacity-80">{lab.unit}</span></div>
                            <div className="text-[11px] uppercase font-bold tracking-widest mt-1 opacity-90">{lab.severity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
