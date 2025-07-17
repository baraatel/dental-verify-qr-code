
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  const checkAdminStatus = useCallback(async (currentSession?: Session | null): Promise<boolean> => {
    const sessionToCheck = currentSession || session;
    
    if (!sessionToCheck?.user) {
      console.log('No session user available for admin check');
      return false;
    }
    
    try {
      console.log('Checking admin status for user:', sessionToCheck.user.id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', sessionToCheck.user.id)
        .single();
      
      console.log('Profile data:', profileData, 'error:', profileError);
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking profile:', profileError);
        return false;
      }
      
      const isAdminUser = profileData?.role === 'admin';
      console.log('User is admin:', isAdminUser);
      return isAdminUser;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }, [session]);

  useEffect(() => {
    let mounted = true;

    const handleAuthStateChange = async (event: string, currentSession: Session | null) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event, 'session exists:', !!currentSession);
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        console.log('Checking admin status after auth change...');
        try {
          const adminStatus = await checkAdminStatus(currentSession);
          console.log('Admin status result:', adminStatus);
          if (mounted) {
            setIsAdmin(adminStatus);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          if (mounted) {
            setIsAdmin(false);
          }
        }
      } else {
        if (mounted) {
          setIsAdmin(false);
        }
      }
      
      if (mounted) {
        setIsLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session check:', !!initialSession);
        
        if (!mounted) return;
        
        await handleAuthStateChange('INITIAL_SESSION', initialSession);
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || email.trim(),
          },
        },
      });

      if (error) {
        toast({
          title: "خطأ في إنشاء الحساب",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "يرجى تفعيل حسابك عبر الرابط المرسل لبريدك الإلكتروني",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsAdmin(false);
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "نراك قريباً",
      });
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الخروج",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    checkAdminStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
