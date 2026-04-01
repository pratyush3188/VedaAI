import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { ActivitySquare, AlertTriangle } from 'lucide-react';

export function Onboarding() {
  const { user, setProfile } = useAuthStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: 'Male',
    blood_group: 'O+',
    height: '',
    weight: '',
    conditions: '',
    allergies: '',
    lifestyle: '',
    language: 'English'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');

    const profileData = {
      id: user.id,
      full_name: formData.full_name,
      age: parseInt(formData.age),
      gender: formData.gender,
      blood_group: formData.blood_group,
      height: formData.height,
      weight: formData.weight,
      conditions: formData.conditions,
      allergies: formData.allergies,
      lifestyle: formData.lifestyle,
      language: formData.language,
    };

    const { error: dbError } = await supabase.from('profiles').insert([profileData]);

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
    } else {
      setProfile(profileData as any);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden p-8 sm:p-12 border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-10">
          <ActivitySquare className="h-12 w-12 text-blue-600 dark:text-blue-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Complete Your Profile</h2>
          <p className="text-slate-500 dark:text-slate-400">Please provide your health context. Veda AI uses this to personalize report insights.</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-8 flex items-start gap-3 border border-red-200 dark:border-red-900/50">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
              <input required type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Age</label>
              <input required type="number" name="age" min="0" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Blood Group</label>
              <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                <option value="Unknown">I don't know</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Primary Language</label>
              <select name="language" value={formData.language} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white">
                {['English', 'Hindi', 'Spanish', 'French', 'Arabic'].map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Height (e.g. 5'8 or 170cm)</label>
              <input type="text" name="height" value={formData.height} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Weight (e.g. 70kg / 150lbs)</label>
              <input type="text" name="weight" value={formData.weight} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Existing Medical Conditions</label>
              <textarea name="conditions" placeholder="e.g. Diabetes, Hypertension..." rows={2} value={formData.conditions} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white resize-none" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Allergies</label>
              <textarea name="allergies" placeholder="e.g. Penicillin, Peanuts..." rows={2} value={formData.allergies} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white resize-none" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Lifestyle Notes</label>
              <textarea name="lifestyle" placeholder="e.g. Smokes occasionally, minimal exercise..." rows={2} value={formData.lifestyle} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white resize-none" />
            </div>
            
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-colors shadow-lg hover:shadow-xl mt-8 disabled:opacity-50 text-lg"
          >
            {loading ? 'Saving Profile...' : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              useAuthStore.setState({ session: null, user: null, profile: null, isLoading: false });
              navigate('/login');
            }}
            className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors"
          >
            Wrong account? Log out
          </button>
        </div>
      </div>
    </div>
  );
}
