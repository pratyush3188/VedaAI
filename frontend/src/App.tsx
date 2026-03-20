import { useState, useEffect } from 'react';
import axios from 'axios';
import { UploadForm } from './components/UploadForm';
import { Dashboard } from './components/Dashboard';
import type { Patient } from './types';
import { Plus, Moon, Sun, AlertTriangle, CheckCircle, Search, Users, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';

const MOCK_PATIENTS: Patient[] = [
  { id: '1', name: 'John Doe', age: 45, gender: 'Male', status: 'Attention Required', dangerPercentage: 40, dateStr: '2026-03-21' },
  { id: '2', name: 'Jane Smith', age: 62, gender: 'Female', status: 'Critical', dangerPercentage: 85, dateStr: '2026-03-20' },
  { id: '3', name: 'Sam Johnson', age: 29, gender: 'Male', status: 'Fine', dangerPercentage: 10, dateStr: '2026-03-19' },
];

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleAnalyze = async (formData: FormData, type: 'file' | 'text') => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = type === 'file' ? '/api/analyze-file' : '/api/analyze-text';
      const baseUrl = import.meta.env.VITE_API_URL || 'https://vedaai-backend-nhad.onrender.com';
      const response = await axios.post(`${baseUrl}${endpoint}`, formData, {
        headers: type === 'file' ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
      });
      
      const newPatient: Patient = {
        id: Math.random().toString(36).substr(2, 9),
        name: type === 'file' ? formData.get('patient_name') as string : (formData as any).patient_name,
        age: parseInt(type === 'file' ? formData.get('age') as string : (formData as any).age),
        gender: type === 'file' ? formData.get('gender') as string : (formData as any).gender,
        status: response.data.data?.critical_alert ? 'Critical' : (response.data.data?.health_score < 70 ? 'Attention Required' : 'Fine'),
        dangerPercentage: response.data.data?.critical_alert ? 90 : (100 - (response.data.data?.health_score || 100)),
        reportData: response.data,
        dateStr: new Date().toISOString().split('T')[0]
      };
      
      setPatients([newPatient, ...patients]);
      setShowUpload(false);
      setViewingPatient(newPatient); // Open patient automatically
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Critical') return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (status === 'Attention Required') return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPatients = patients.length;
  const criticalCases = patients.filter(p => p.status === 'Critical').length;

  return (
    <div className="min-h-screen font-sans bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-800 shadow border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">VedaAi</h1>
            <p className="text-base text-slate-500 dark:text-slate-400 mt-1">Intelligent Medical Report Simplification</p>
          </div>
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
            title="Toggle Dark Mode"
          >
            {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {!showUpload && !viewingPatient && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-3xl font-bold tracking-tight">Patient Dashboard</h2>
              <button 
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all hover:shadow-lg text-base font-medium w-full sm:w-auto justify-center"
              >
                <Plus className="h-5 w-5" /> Add Patient Report
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">Total Patients</h3>
                </div>
                <div className="text-5xl font-bold text-slate-800 dark:text-white">
                  {totalPatients}
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                    <ShieldAlert className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">Critical Cases</h3>
                </div>
                <div className="text-5xl font-bold text-red-600 dark:text-red-400">
                  {criticalCases}
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
              
              {/* Search Bar */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patients by name..."
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Responsive Table Wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base text-slate-600 dark:text-slate-300 whitespace-nowrap min-w-[800px]">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-400 uppercase text-sm font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-5">Name</th>
                      <th className="px-6 py-5">Age / Gender</th>
                      <th className="px-6 py-5">Status</th>
                      <th className="px-6 py-5 w-1/4">Danger Level</th>
                      <th className="px-6 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                        <td className="px-6 py-5 font-semibold text-slate-900 dark:text-white text-lg">
                          {patient.name}
                        </td>
                        <td className="px-6 py-5 text-base">
                          {patient.age} / {patient.gender}
                        </td>
                        <td className="px-6 py-5 text-base">
                          <div className="flex items-center gap-2.5">
                            {getStatusIcon(patient.status)}
                            <span className={clsx(
                               "font-semibold",
                               patient.status === 'Critical' ? "text-red-600 dark:text-red-400" :
                               patient.status === 'Attention Required' ? "text-orange-600 dark:text-orange-400" :
                               "text-green-600 dark:text-green-400"
                            )}>
                               {patient.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 min-w-[100px]">
                              <div 
                                className={clsx("h-2.5 rounded-full", patient.dangerPercentage > 70 ? "bg-red-500" : patient.dangerPercentage > 30 ? "bg-orange-500" : "bg-green-500")}
                                style={{ width: `${patient.dangerPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold w-10">{patient.dangerPercentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right border-l-0">
                          <button 
                            onClick={() => setViewingPatient(patient)}
                            className="px-5 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-900 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:border-blue-300 dark:hover:border-blue-800 transition-all shadow-sm"
                          >
                            View More
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredPatients.length === 0 && (
                       <tr>
                         <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-lg">
                           No patients found matching your search.
                         </td>
                       </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {showUpload && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Upload Data</h2>
              <button 
                onClick={() => setShowUpload(false)}
                className="text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white py-2 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
            <div className="max-w-4xl mx-auto">
              <UploadForm onAnalyze={handleAnalyze} loading={loading} />
              {error && (
                <div className="mt-6 p-6 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400 flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-lg mb-1">Analysis Failed</p>
                    <p className="text-base">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {viewingPatient && (
          <Dashboard 
            patient={viewingPatient} 
            onClose={() => setViewingPatient(null)} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
