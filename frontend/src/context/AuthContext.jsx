import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  getSession,
  loginAdmin,
  loginUser,
  logoutSession,
  signupUser,
} from '../api/auth.js';

const AuthContext = createContext(null);

const anonymousSession = {
  status: 'anonymous',
  account: null,
  role: null,
};

function authenticatedSession(role, account) {
  return {
    status: 'authenticated',
    account,
    role,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState({
    status: 'loading',
    account: null,
    role: null,
  });
  const sessionRevision = useRef(0);

  const refresh = useCallback(async ({ signal } = {}) => {
    const revision = sessionRevision.current + 1;
    sessionRevision.current = revision;

    try {
      const data = await getSession({ signal });

      if (revision !== sessionRevision.current) {
        return null;
      }

      const nextSession = authenticatedSession(data.role, data.account);
      setSession(nextSession);
      return nextSession;
    } catch (error) {
      if (
        error?.name === 'AbortError' ||
        revision !== sessionRevision.current
      ) {
        return null;
      }

      setSession(anonymousSession);
      return null;
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    refresh({ signal: controller.signal });

    return () => controller.abort();
  }, [refresh]);

  const login = useCallback(async (role, credentials) => {
    const data =
      role === 'admin'
        ? await loginAdmin(credentials)
        : await loginUser(credentials);
    const account = role === 'admin' ? data.admin : data.user;

    if (!account) {
      throw new Error('The server did not return an account for this session.');
    }

    sessionRevision.current += 1;
    const nextSession = authenticatedSession(role, account);
    setSession(nextSession);
    return nextSession;
  }, []);

  const signup = useCallback(async (credentials) => {
    const data = await signupUser(credentials);

    if (!data.user) {
      throw new Error('The server did not return an account for this session.');
    }

    sessionRevision.current += 1;
    const nextSession = authenticatedSession('user', data.user);
    setSession(nextSession);
    return nextSession;
  }, []);

  const logout = useCallback(async () => {
    sessionRevision.current += 1;

    try {
      await logoutSession();
    } catch {}

    setSession(anonymousSession);
  }, []);

  const value = useMemo(
    () => ({
      ...session,
      isAuthenticated: session.status === 'authenticated',
      login,
      signup,
      logout,
      refresh,
    }),
    [session, login, signup, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
