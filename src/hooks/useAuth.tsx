
import React, { createContext, useContext, useEffect, useState } from 'react';
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

  const checkAdminStatus = async (sessionToCheck?: Session | null): Promise<boolean> => {
    const currentSession = sessionToCheck || session;
    
    if (!currentSession?.user) {
      console.log('No session user available for admin check');
      return false;
    }
    
    try {
      console.log('Checking admin status for user:', currentSession.user.id);
      
      // Check profiles table directly for admin role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentSession.user.id)
        .single();
      
      console.log('Profile data:', profileData, 'error:', profileError);
      
      if (profileError) {
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
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, 'session exists:', !!session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check admin status with the new session
          console.log('Checking admin status after auth change...');
          try {
            const adminStatus = await checkAdminStatus(session);
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
          setIsAdmin(false);
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', !!session);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('Checking admin status on initial load...');
          try {
            const adminStatus = await checkAdminStatus(session);
            console.log('Initial admin status result:', adminStatus);
            if (mounted) {
              setIsAdmin(adminStatus);
            }
          } catch (error) {
            console.error('Error checking admin status on init:', error);
            if (mounted) {
              setIsAdmin(false);
            }
          }
        }
        
        if (mounted) {
          setIsLoading(false);
        }
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
  }, []);

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
