
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
    console.log('ProtectedRoute: Setting up auth listeners');
    
    let mounted = true;

    // Check initial session
    const checkInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('ProtectedRoute: Initial session check', { session, error });
        
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
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error in checkInitialSession:', error);
        if (mounted) {
          setUser(null);
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    };

    checkInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('ProtectedRoute: Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;
        
        if (event === 'SIGNED_OUT') {
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
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      console.log('ProtectedRoute: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      console.log('ProtectedRoute: Checking admin role for user:', userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      console.log('ProtectedRoute: Profile query result:', { profile, error });

      if (error) {
        console.error('Error checking admin role:', error);
        // If profile doesn't exist, user is not admin
        setIsAdmin(false);
      } else {
        const adminStatus = profile?.role === 'admin';
        console.log('ProtectedRoute: Admin status:', adminStatus);
        setIsAdmin(adminStatus);
      }
    } catch (error) {
      console.error('Error in checkAdminRole:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    console.log('ProtectedRoute: Login success, rechecking auth state');
    // The auth state change listener will handle the login automatically
  };

  const handleLogout = async () => {
    try {
      console.log('ProtectedRoute: Logging out user');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  console.log('ProtectedRoute: Current state', { user: user?.email, isAdmin, isLoading });

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

  // If not authenticated or not admin, show login with logout option
  if (!user || !isAdmin) {
    console.log('ProtectedRoute: Showing login form', { hasUser: !!user, isAdmin });
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
        <AdminLogin onLogin={handleLoginSuccess} />
      </div>
    );
  }

  // If authenticated and admin
  console.log('ProtectedRoute: User is authenticated admin, showing protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
