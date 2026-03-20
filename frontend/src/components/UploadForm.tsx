import React, { useState } from 'react';
import { UploadCloud, FileText, Send, User, Globe, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface UploadFormProps {
  onAnalyze: (formData: FormData, type: 'file' | 'text') => void;
  loading: boolean;
}

export function UploadForm({ onAnalyze, loading }: UploadFormProps) {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [patientName, setPatientName] = useState('John Doe');
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState('Male');
  const [language, setLanguage] = useState('English');
  const [symptoms, setSymptoms] = useState('');
  
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'file' && !file) return;
    if (activeTab === 'text' && !text.trim()) return;

    const formData = new FormData();
    formData.append('patient_name', patientName);
    formData.append('age', age.toString());
    formData.append('gender', gender);
    formData.append('language', language);
    formData.append('symptoms', symptoms);

    if (activeTab === 'file' && file) {
      formData.append('file', file);
    }

    if (activeTab === 'text') {
      const jsonPayload = {
        text,
        patient_name: patientName,
        age,
        gender,
        language,
        symptoms
      };
      onAnalyze(jsonPayload as any, 'text');
    } else {
      onAnalyze(formData, 'file');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-colors">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
            <User className="h-4 w-4" /> Patient Name
          </label>
          <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age</label>
          <input type="number" min="1" max="120" value={age} onChange={(e) => setAge(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors">
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
            <Globe className="h-4 w-4" /> Language
          </label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>Hindi</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-orange-500" /> Symptoms Context (Optional)
        </label>
        <input type="text" placeholder="e.g. Headache, dizziness, fatigue..." value={symptoms} onChange={(e) => setSymptoms(e.target.value)}
          className="w-full mb-6 px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors" />

        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4 transition-colors">
          <button type="button" onClick={() => setActiveTab('file')}
            className={clsx("px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors", 
              activeTab === 'file' ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}>
            <UploadCloud className="h-4 w-4" /> Upload Document
          </button>
          <button type="button" onClick={() => setActiveTab('text')}
            className={clsx("px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors", 
              activeTab === 'text' ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}>
            <FileText className="h-4 w-4" /> Paste Text
          </button>
        </div>

        {activeTab === 'file' && (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-12 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 relative group hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <UploadCloud className="h-10 w-10 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mb-3" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{file ? file.name : "Drag and drop or click to upload PDF/Image"}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Max file size: 10MB</p>
          </div>
        )}

        {activeTab === 'text' && (
          <div>
            <textarea rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your medical report text here..."
              className="w-full p-4 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm transition-colors" />
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={loading || (activeTab==='file' && !file) || (activeTab==='text' && !text.trim())}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {loading ? "Analyzing report..." : "Analyze Report"}
          </button>
        </div>
      </div>
    </form>
  );
}
