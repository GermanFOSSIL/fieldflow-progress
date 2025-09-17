import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  userProfile: any | null;
  loading: boolean;
  signIn: (email: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setUserProfile(data);
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Si falla la conexión a Supabase, usar datos mock
      setUserProfile({
        id: userId,
        email: 'demo@fieldprogress.com',
        full_name: 'Usuario Demo',
        role: 'supervisor'
      });
      setUserRole('supervisor');
    }
  };

  useEffect(() => {
    // Modo offline forzado - usar usuario demo directamente
    console.log('👤 Inicializando usuario demo en modo offline');
    
    const demoUser = {
      id: 'demo-user-1',
      email: 'demo@fieldprogress.com',
      user_metadata: {
        full_name: 'Usuario Demo'
      }
    } as User;

    const demoProfile = {
      id: 'demo-user-1',
      email: 'demo@fieldprogress.com',
      full_name: 'Usuario Demo',
      role: 'supervisor'
    };

    setUser(demoUser);
    setUserProfile(demoProfile);
    setUserRole('supervisor');
    setLoading(false);

    // No hacer consultas a Supabase en modo offline
    console.log('✅ Usuario demo configurado correctamente');
  }, []);

  const signIn = async (email: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setUserProfile(null);
      setUserRole(null);
    }
    return { error };
  };

  const value = {
    user,
    session,
    userRole,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}