import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Shield, List, LineChart, FileText, Lightbulb, Mic, MicOff, CheckCircle2, X } from 'lucide-react';
import clsx from 'clsx';

interface UploadFormProps {
  onAnalyze: (formData: FormData, type: 'file' | 'text') => void;
  loading: boolean;
}

const COMMON_SYMPTOMS = ['Pain', 'Fatigue', 'Dizziness', 'Chest Pain', 'Fever', 'Cough', 'Shortness of Breath'];
const PRE_EXISTING_CONDITIONS = ['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Thyroid Disorder'];

export function UploadForm({ onAnalyze, loading }: UploadFormProps) {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');

  // --- Voice Dictation State ---
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('English (US)');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      const langMap: Record<string, string> = {
        'English (US)': 'en-US',
        'Hindi': 'hi-IN'
      };
      recognition.lang = langMap[language] || 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscript += chunk + ' ';
        }
        if (finalTranscript) {
          setText(prev => {
            const separator = prev && !prev.endsWith(' ') && !prev.endsWith('\n') ? ' ' : '';
            return prev + separator + finalTranscript;
          });
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
    return () => {
       if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice dictation is not supported in this browser. Please use Chrome or Safari.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };
  // -----------------------------

  const [patientName, setPatientName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Select Gender');
  const [reportType, setReportType] = useState('Blood Test');
  
  // Advanced tracking
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

  // Validation
  const isNameValid = patientName.trim().length >= 2;
  const isAgeValid = age !== '' && !isNaN(Number(age)) && Number(age) >= 0;
  const ageHasError = age !== '' && isNaN(Number(age));

  // Calculate age when DOB changes
  useEffect(() => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      if (calculatedAge >= 0) {
        setAge(calculatedAge.toString());
      }
    }
  }, [dob]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev => 
      prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
    );
  };

  const compiledSymptomsContext = `Symptoms: ${selectedSymptoms.join(', ') || 'None'}. Pre-existing Conditions: ${selectedConditions.join(', ') || 'None'}. Notes: ${additionalNotes}`;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (activeTab === 'file' && !file) return;
    if (activeTab === 'text' && !text.trim()) return;

    const formData = new FormData();
    formData.append('patient_name', patientName || 'Unknown Patient');
    formData.append('age', age || '0');
    formData.append('gender', gender === 'Select Gender' ? 'Unknown' : gender);
    formData.append('language', language);
    formData.append('report_type', reportType);
    formData.append('symptoms', compiledSymptomsContext);
    formData.append('pre_existing_conditions', selectedConditions.join(', '));

    if (activeTab === 'file' && file) {
      formData.append('file', file);
      onAnalyze(formData, 'file');
    }

    if (activeTab === 'text') {
      const jsonPayload = {
        text,
        patient_name: patientName,
        age: parseInt(age) || 0,
        gender,
        language,
        report_type: reportType,
        symptoms: compiledSymptomsContext,
        pre_existing_conditions: selectedConditions.join(', ')
      };
      onAnalyze(jsonPayload as any, 'text');
    }
  };

  const RenderAdvancedContext = () => (
    <div className="space-y-6">
       {/* Pre-existing Conditions */}
       <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase mb-3 block">Do you have any pre-existing conditions?</label>
          <div className="flex flex-wrap gap-3">
             {PRE_EXISTING_CONDITIONS.map(condition => (
                <label key={condition} onClick={() => toggleCondition(condition)} className="flex items-center gap-2 cursor-pointer group">
                   <div className={clsx("w-5 h-5 rounded flex items-center justify-center border transition-all", selectedConditions.includes(condition) ? "bg-[#0d5d67] border-[#0d5d67] dark:bg-[#2dd4bf] dark:border-[#2dd4bf] text-white" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-[#0d5d67] dark:group-hover:border-[#2dd4bf]")}>
                      {selectedConditions.includes(condition) && <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={3} />}
                   </div>
                   <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{condition}</span>
                </label>
             ))}
          </div>
       </div>

       {/* Symptoms Tag Input */}
       <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
          <label className="text-xs font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase mb-3 flex justify-between items-center">
             <span>Current Symptoms</span>
             <span className="text-[10px] text-[#0d5d67] dark:text-[#2dd4bf] bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-full">Boosts AI Accuracy</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
             {COMMON_SYMPTOMS.map(symptom => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                   <button 
                     key={symptom} 
                     type="button"
                     onClick={() => toggleSymptom(symptom)}
                     className={clsx("px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5", 
                        isSelected 
                        ? "bg-[#0d5d67] text-white border-[#0d5d67] dark:bg-[#2dd4bf]/20 dark:text-[#2dd4bf] dark:border-[#2dd4bf]/30" 
                        : "bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:border-[#0d5d67] dark:hover:border-[#2dd4bf]"
                     )}
                   >
                     {symptom}
                     {isSelected && <X className="h-3 w-3" />}
                   </button>
                );
             })}
          </div>
          <textarea rows={2} placeholder="Any additional symptoms, context, or specific concerns..." value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)}
             className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-none rounded-xl text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-[#0d5d67]/20 outline-none resize-none placeholder-slate-300 dark:placeholder-slate-600 text-sm shadow-sm" />
       </div>
    </div>
  );

  return (
     <div className="w-full relative z-10 p-2 sm:p-0 pb-12">
        <div className="mb-8">
           <h1 className="text-4xl font-black text-[#0d5d67] dark:text-[#2dd4bf] tracking-tight mb-3">
              {activeTab === 'file' ? 'Upload Medical Report' : 'Paste Clinical Text'}
           </h1>
           <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
             Leverage our Clinical AI to extract insights from {activeTab === 'file' ? 'diagnostic files, X-Rays, and MRIs' : 'raw medical transcriptions and notes'}. Our vision and text models ensure secure, sanctuary-grade privacy.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           {/* LEFT COLUMN: Main Forms */}
           <div className="lg:col-span-8 space-y-6">
              
              {/* Universal Tab Switcher */}
              <div className="flex border-b border-slate-200 dark:border-slate-700 bg-transparent overflow-x-auto custom-scrollbar">
                 <button onClick={() => setActiveTab('file')} className={clsx("px-8 py-4 font-bold text-sm border-b-2 transition-all block whitespace-nowrap", activeTab === 'file' ? "border-[#0d5d67] text-[#0d5d67] dark:border-[#2dd4bf] dark:text-[#2dd4bf]" : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300")}>
                    Upload File
                 </button>
                 <button onClick={() => setActiveTab('text')} className={clsx("px-8 py-4 font-bold text-sm border-b-2 transition-all block whitespace-nowrap", activeTab === 'text' ? "border-[#0d5d67] text-[#0d5d67] dark:border-[#2dd4bf] dark:text-[#2dd4bf]" : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300")}>
                    Paste Text
                 </button>
              </div>

              {/* Patient Identity Config (Applies to both) */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                 <h2 className="text-lg font-black flex items-center gap-2 mb-6 text-slate-800 dark:text-white">
                    <UserPolygon className="h-5 w-5" /> Patient Identity & Report Settings
                 </h2>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-2">
                    <div className="relative">
                       <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2">Patient Name</label>
                       <input type="text" placeholder="e.g. Elena Vance" value={patientName} onChange={(e) => setPatientName(e.target.value)}
                          className={clsx(
                             "w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border rounded-xl text-slate-800 dark:text-white font-medium outline-none transition-all",
                             isNameValid ? "border-green-400 dark:border-green-500 focus:ring-2 focus:ring-green-400/20" : "border-transparent focus:ring-2 focus:ring-[#0d5d67]/20"
                          )} />
                       {isNameValid && <CheckCircle2 className="absolute right-3 top-[34px] text-green-500 h-5 w-5 animate-in zoom-in duration-300" />}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2">Date of Birth</label>
                          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
                             className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-900/50 border-transparent border rounded-xl text-slate-800 dark:text-white font-medium outline-none text-sm appearance-none" />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2">Age</label>
                          <input type="text" placeholder="Years" value={age} onChange={(e) => setAge(e.target.value)}
                             className={clsx(
                                "w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border rounded-xl text-slate-800 dark:text-white font-medium outline-none transition-all",
                                ageHasError ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20" : 
                                isAgeValid ? "border-green-400 dark:border-green-500 focus:ring-2 focus:ring-green-400/20" : "border-transparent focus:ring-2 focus:ring-[#0d5d67]/20"
                             )} />
                       </div>
                    </div>

                    <div className="relative">
                       <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2">Gender</label>
                       <select value={gender} onChange={(e) => setGender(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-transparent rounded-xl text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-[#0d5d67]/20 outline-none appearance-none cursor-pointer">
                          <option>Select Gender</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                       </select>
                       <svg className="absolute right-4 top-[38px] h-4 w-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>

                    <div className="relative">
                       <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2">Report Language</label>
                       <select value={language} onChange={(e) => setLanguage(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-transparent rounded-xl text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-[#0d5d67]/20 outline-none appearance-none cursor-pointer">
                          <option>English (US)</option>
                          <option>Hindi</option>
                       </select>
                       <svg className="absolute right-4 top-[38px] h-4 w-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>

                    <div className="relative md:col-span-2">
                       <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2">Report Type</label>
                       <select value={reportType} onChange={(e) => setReportType(e.target.value)}
                          className="w-full px-4 py-3 bg-teal-50/50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-800 border rounded-xl text-[#0d5d67] dark:text-[#2dd4bf] font-bold focus:ring-2 focus:ring-[#0d5d67]/20 outline-none appearance-none cursor-pointer">
                          <option>Blood Test / Lab Results</option>
                          <option>X-Ray</option>
                          <option>MRI</option>
                          <option>ECG</option>
                          <option>Clinical Notes</option>
                       </select>
                       <svg className="absolute right-4 top-[38px] h-4 w-4 text-[#0d5d67] dark:text-[#2dd4bf] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                 </div>
              </div>

              {activeTab === 'file' && (
                 <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl p-8 sm:p-14 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/20 relative group hover:border-[#0d5d67] dark:hover:border-[#2dd4bf] hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-all mb-8 shadow-inner">
                       <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                       <div className="h-16 w-16 bg-[#cffafe] dark:bg-[#0d5d67]/30 text-[#0d5d67] dark:text-[#2dd4bf] rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                          <UploadCloud className="h-8 w-8" />
                       </div>
                       <p className="text-xl font-black text-slate-900 dark:text-white mb-2 text-center wrap-break-word max-w-full px-4">{file ? file.name : "Drag & drop report here"}</p>
                       <p className="text-sm font-medium text-slate-500 mb-6 relative z-20">or <span className="text-[#0d5d67] dark:text-[#2dd4bf] underline font-bold cursor-pointer">browse your files</span></p>
                       
                       <div className="flex gap-3">
                          <span className="px-4 py-1.5 bg-white dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"><FileText className="h-3 w-3" /> PDF, JPG, PNG</span>
                          <span className="px-4 py-1.5 bg-white dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"><UploadCloud className="h-3 w-3" /> MAX 25MB</span>
                       </div>
                    </div>

                    <RenderAdvancedContext />
                 </div>
              )}

              {activeTab === 'text' && (
                 <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                       <h2 className="text-sm font-black text-[#0d5d67] dark:text-[#2dd4bf] tracking-widest uppercase flex items-center gap-2">
                          <FileText className="h-4 w-4" /> Clinical Report Text
                       </h2>
                       <div className="flex items-center gap-4">
                          <button 
                            onClick={toggleListening}
                            type="button"
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase font-black transition-all shadow-sm border ${isListening ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50 animate-pulse scale-105 ring-4 ring-red-500/20' : 'bg-white text-slate-500 border-slate-200 hover:text-[#0d5d67] hover:border-teal-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:text-[#2dd4bf] hover:shadow-md hover:scale-105'}`}
                          >
                             {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                             <span className={isListening ? 'font-black' : 'font-bold'}>{isListening ? 'RECORDING...' : 'DICTATE'}</span>
                          </button>
                       </div>
                    </div>
                    
                    <textarea rows={10} placeholder="Type or dictate the clinical text here. For best results, include medical history, current symptoms, and any available lab results..." value={text} onChange={e => setText(e.target.value)}
                       className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-transparent border focus:border-slate-300 dark:focus:border-slate-600 text-slate-800 dark:text-white text-base focus:ring-0 outline-none resize-y placeholder-slate-400 dark:placeholder-slate-600 font-medium mb-4 shadow-inner" />
                    
                    <div className="flex flex-wrap sm:flex-nowrap justify-between items-center pt-2 pb-6 gap-4 border-b border-slate-100 dark:border-slate-700 mb-6">
                       <div className="flex gap-6 text-sm font-bold text-slate-500 dark:text-slate-400">
                          <button onClick={() => setText('')} type="button" className="flex items-center gap-2 hover:text-slate-800 dark:hover:text-white transition-colors"><UploadCloud className="h-4 w-4 rotate-180" /> CLEAR TEXT</button>
                       </div>
                       <div className="text-xs sm:text-sm font-medium text-slate-500">
                          {wordCount} words <span className="mx-2">•</span> Privacy: End-to-end Encrypted
                       </div>
                    </div>

                    <RenderAdvancedContext />
                 </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                 <button onClick={handleSubmit} disabled={loading || (activeTab==='file' && !file) || (activeTab==='text' && !text.trim())}
                    className="flex justify-between items-center gap-4 bg-[#0d5d67] hover:bg-[#0a454a] disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-8 py-4 rounded-xl font-bold transition-transform hover:scale-[1.02] active:scale-95 w-full sm:w-auto shadow-lg shadow-teal-500/20 disabled:shadow-none">
                    {loading ? (
                      <span className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing Report...</span>
                    ) : (
                      <>
                         <span>{activeTab === 'file' ? `Analyze ${reportType}` : 'Analyze Clinical Text'}</span>
                         <LineChart className="h-5 w-5 opacity-70" />
                      </>
                    )}
                 </button>
              </div>

           </div>

           {/* RIGHT COLUMN: Static Info Cards (Only shown on file upload mode) */}
           {activeTab === 'file' && (
              <div className="lg:col-span-4 space-y-6">
                 
                 {/* Pro Tip Card */}
                 <div className="bg-[#0f5f66] dark:bg-[#0a454a] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-40 w-40 bg-teal-500/20 rounded-full -translate-y-10 translate-x-10 blur-2xl"></div>
                    <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md mb-6 relative z-10 shadow-sm border border-white/10">
                       <Lightbulb className="h-5 w-5 text-white drop-shadow-md" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 relative z-10">Pro Tip: Imaging Scans</h3>
                    <p className="text-teal-50 font-medium leading-relaxed mb-6 text-sm relative z-10">
                       For X-Rays and MRIs, our LLaMA Vision Models interpret impressions and visual anomalies directly from your scans. Ensure the upload is clear.
                    </p>
                    <div className="bg-[#0a454a] dark:bg-black/20 px-4 py-2 rounded-xl inline-block border border-white/10 text-[10px] font-black tracking-widest uppercase relative z-10 shadow-inner">
                       Multimodal Analysis Active
                    </div>
                 </div>

                 {/* Information Card */}
                 <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-700">
                    <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-6">Security guarantees</h3>
                    <div className="space-y-6">
                       <div className="flex gap-4">
                          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                             <Shield className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                          </div>
                          <div>
                             <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Data Anonymization</h4>
                             <p className="text-xs font-medium text-slate-500 leading-relaxed">Personal identifiers are stripped before AI processing to ensure privacy.</p>
                          </div>
                       </div>
                       <div className="flex gap-4">
                          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                             <List className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                          </div>
                          <div>
                             <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Contextual Analysis</h4>
                             <p className="text-xs font-medium text-slate-500 leading-relaxed">Findings are instantly mapped against age and provided medical history.</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           )}
        </div>
     </div>
  );
}

function UserPolygon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
