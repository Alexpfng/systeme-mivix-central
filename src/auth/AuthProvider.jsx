import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext, useAuth } from './AuthContext';

export function createContentItemsUpsert({ supabase: client, userId }) {
  return async (items) => {
    if (!userId) throw new Error('Utilisateur authentifié requis pour importer les données.');
    const rows = items.map((item) => ({ ...item, owner_id: userId }));
    const { data, error } = await client
      .from('content_items')
      .upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    return data ?? rows;
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function bootstrapSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) {
          setSession(null);
          setAuthError(error);
          return;
        }
        setAuthError(null);
        setSession(data?.session ?? null);
      } catch (error) {
        if (!mounted) return;
        setSession(null);
        setAuthError(error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setIsPasswordRecovery(false);
      }
      if (currentSession) setAuthError(null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isPasswordRecovery,
      loading,
      authError,
      upsertContentItems: createContentItemsUpsert({ supabase, userId: session?.user?.id }),
      signIn: (credentials) => supabase.auth.signInWithPassword(credentials),
      signOut: () => supabase.auth.signOut(),
      updatePassword: (password) => supabase.auth.updateUser({ password }),
      resetPassword: (email) =>
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        }),
    }),
    [authError, isPasswordRecovery, loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { useAuth } from './AuthContext';
