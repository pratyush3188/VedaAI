import { useState } from 'react';
import axios from 'axios';
import { UploadForm } from '../components/UploadForm';
import { Dashboard } from '../components/Dashboard';
import type { Patient } from '../types';
import { AlertTriangle, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

export function Analyzer() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);

  const handleAnalyze = async (formData: FormData, type: 'file' | 'text') => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = type === 'file' ? '/api/analyze-file' : '/api/analyze-text';
      let baseUrl = import.meta.env.VITE_API_URL || 'https://vedaai-backend-nhad.onrender.com';
      if (window.location.hostname === 'localhost') {
        baseUrl = 'http://localhost:8000';
      }
      const file = type === 'file' ? (formData.get('file') as File) : null;
      
      let storagePath = null;
      
      const fastApiPromise = axios.post(`${baseUrl}${endpoint}`, formData, {
        headers: type === 'file' ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
      });
      
      let storagePromise = Promise.resolve(null as any);
      if (type === 'file' && file && user) {
        storagePath = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        storagePromise = supabase.storage.from('Reports').upload(storagePath, file);
      }
      
      const [fastApiResponse, storageResponse] = await Promise.all([fastApiPromise, storagePromise]);
      
      if (storageResponse && storageResponse.error) {
        throw new Error(`Failed to secure original file: ${storageResponse.error.message}`);
      }
      
      const response = fastApiResponse;
      
      const pName = type === 'file' ? formData.get('patient_name') as string : (formData as any).patient_name;
      const pAge = parseInt(type === 'file' ? formData.get('age') as string : (formData as any).age);
      const pGender = type === 'file' ? formData.get('gender') as string : (formData as any).gender;
      const pSymptoms = type === 'file' ? formData.get('symptoms') as string : (formData as any).symptoms;
      const pReportType = type === 'file' ? formData.get('report_type') as string : (formData as any).report_type || 'Clinical Extracted';
      
      const newPatient: Patient = {
        id: Math.random().toString(36).substr(2, 9),
        name: pName,
        age: pAge,
        gender: pGender,
        status: response.data.data?.critical_alert ? 'Critical' : (response.data.data?.health_score < 70 ? 'Attention Required' : 'Fine'),
        dangerPercentage: response.data.data?.critical_alert ? 90 : (100 - (response.data.data?.health_score || 100)),
        reportData: response.data,
        dateStr: new Date().toISOString().split('T')[0]
      };
      
      // SAVE TO SUPABASE
      if (user) {
        const insertData = {
          user_id: user.id,
          file_name: type === 'file' ? file?.name || 'Manual Upload' : 'Direct Text Input',
          file_type: type === 'file' ? file?.type || 'unknown' : 'text',
          report_type: pReportType,
          doctor_name: response.data.data?.doctor_name || 'Unknown',
          symptoms: pSymptoms || 'None reported',
          original_pdf_url: storagePath,
          simplified_text: response.data.markdown,
          health_score: response.data.data?.health_score || 100,
          status: newPatient.status
        };
        const { error: dbError } = await supabase.from('reports').insert([insertData]);
        if (dbError) throw new Error(`Database transaction failed: ${dbError.message}`);
      }

      setViewingPatient(newPatient);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
       {viewingPatient ? (
          <div className="animate-in fade-in zoom-in-95 duration-500">
             <button 
                onClick={() => setViewingPatient(null)}
                className="mb-6 flex items-center gap-2 px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl shadow-sm transition-all"
             >
                <Plus className="h-5 w-5 rotate-45" /> Close Analysis
             </button>
             <Dashboard 
                patient={viewingPatient} 
                onClose={() => setViewingPatient(null)} 
             />
          </div>
       ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <UploadForm onAnalyze={handleAnalyze} loading={loading} />
             
             {error && (
                <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-900/50 rounded-2xl text-red-700 dark:text-red-400 flex items-start gap-4">
                   <AlertTriangle className="h-7 w-7 shrink-0 mt-0.5" />
                   <div>
                      <p className="font-bold text-lg mb-1">Analysis Failed</p>
                      <p className="text-base font-medium">{error}</p>
                   </div>
                </div>
             )}
          </div>
       )}
    </div>
  );
}
