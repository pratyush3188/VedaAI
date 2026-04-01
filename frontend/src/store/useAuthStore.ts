import { create } from 'zustand';
import { type Session, type User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  blood_group: string;
  height: string;
  weight: string;
  conditions: string;
  allergies: string;
  lifestyle: string;
  language: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  setSession: (session) => set({ session, user: session?.user || null }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
}));
