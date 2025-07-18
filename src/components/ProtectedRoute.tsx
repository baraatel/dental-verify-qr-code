
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLogin from './AdminLogin';
import type { User } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAdminRole = async (userId: string) => {
      try {
        console.log('Checking admin role for user:', userId);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();

        console.log('Profile query result:', { profile, error });

        if (!mounted) return;

        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        } else if (profile) {
          const adminStatus = profile.role === 'admin';
          console.log('Admin status:', adminStatus);
          setIsAdmin(adminStatus);
        } else {
          console.log('No profile found for user');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error in checkAdminRole:', error);
        if (mounted) {
          setIsAdmin(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
          await checkAdminRole(session.user.id);
        }
        
        setIsLoading(false);
      }
    );

    // Check initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session check:', { session: !!session, error });
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          await checkAdminRole(session.user.id);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          setUser(null);
          setIsAdmin(false);
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

  const handleLogout = async () => {
    try {
      console.log('Logging out user');
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      // Reset state immediately
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);
    }
  };

  console.log('ProtectedRoute state:', { 
    user: user?.email, 
    isAdmin, 
    isLoading 
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من صلاحيات الوصول...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not admin, show login
  if (!user || !isAdmin) {
    return (
      <div>
        {user && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 mb-4 text-center">
            <p className="text-yellow-800 mb-2">مرحباً {user.email} - ليس لديك صلاحيات إدارية</p>
            <button
              onClick={handleLogout}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              تسجيل الخروج
            </button>
          </div>
        )}
        <AdminLogin onLogin={() => {
          // Force re-initialization after login
          setIsLoading(true);
        }} />
      </div>
    );
  }

  // If authenticated and admin, show content
  return <>{children}</>;
};

export default ProtectedRoute;
