"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from "react";
import type { AppUserProfile, Role } from "@/lib/firebase/types";
import { createRoleScopedProfile, getAvailableRoles, getPrimaryRole } from "@/lib/permissions";
import { normalizeUsername } from "@/lib/utils";
import { loginAction, logoutAction, getMeAction, checkBootstrapAction, verifyUsernameAction, resetPasswordAction } from "@/lib/actions/auth-actions";

type VerifyUsernameResult = {
  found: boolean;
  username?: string;
  displayName?: string;
  error?: string;
};

type AuthContextValue = {
  firebaseUser: any | null; // Kept for compatibility, mostly just uid and email
  profile: AppUserProfile | null;
  workspaceProfile: AppUserProfile | null;
  loading: boolean;
  bootstrapReady: boolean;
  availableRoles: Role[];
  activeRole: Role | null;
  setActiveRole: (role: Role) => void;
  signInWithUsername: (username: string, password: string) => Promise<void>;
  signOutCurrentUser: () => Promise<void>;
  createInitialSuperAdmin: (input: {
    username: string;
    displayName: string;
    password: string;
  }) => Promise<void>;
  verifyUsername: (username: string) => Promise<VerifyUsernameResult>;
  forgotPassword: (username: string, nextPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const PROFILE_POLL_INTERVAL_MS = 15000;
const POST_SIGNOUT_REDIRECT_KEY = "stk:post-signout-redirect";
const POST_LOGIN_FORCE_ROLE_KEY = "stk:post-login-force-role";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [preferredRole, setPreferredRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [bootstrapReady, setBootstrapReady] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (typeof window !== "undefined") {
      const isTabActive = window.sessionStorage.getItem("stk_tab_session_active");
      if (!isTabActive) {
        setProfile(null);
        setLoading(false);
        await logoutAction().catch(() => {});
        return;
      }
    }

    try {
      const user = await getMeAction();
      setProfile(user as AppUserProfile | null);
      if (!user) setLoading(false);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    fetchProfile().finally(() => setLoading(false));

    const intervalId = window.setInterval(() => {
      fetchProfile();
    }, PROFILE_POLL_INTERVAL_MS);

    const onFocus = () => fetchProfile();
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchProfile]);

  useEffect(() => {
    const checkBootstrap = async () => {
      try {
        const initialized = await checkBootstrapAction();
        setBootstrapReady(initialized);
      } catch {
        setBootstrapReady(false);
      }
    };
    checkBootstrap();
  }, []);

  useEffect(() => {
    if (profile) {
      const available = getAvailableRoles(profile);
      const savedRole =
        typeof window !== "undefined"
          ? (window.localStorage.getItem(`stk-active-role:${profile.uid}`) as Role | null)
          : null;

      if (savedRole && available.includes(savedRole)) {
        setPreferredRole(savedRole);
      } else {
        setPreferredRole(getPrimaryRole(profile) as Role);
      }

      const forced =
        typeof window !== "undefined"
          ? (window.sessionStorage.getItem(POST_LOGIN_FORCE_ROLE_KEY) as Role | null)
          : null;

      if (forced && available.includes(forced)) {
        setPreferredRole(forced);
        window.localStorage.setItem(`stk-active-role:${profile.uid}`, forced);
        window.sessionStorage.removeItem(POST_LOGIN_FORCE_ROLE_KEY);
      }
    }
  }, [profile]);

  const availableRoles = getAvailableRoles(profile);
  const activeRole = preferredRole && availableRoles.includes(preferredRole)
      ? preferredRole
      : (getPrimaryRole(profile) as Role | null);
  const workspaceProfile = createRoleScopedProfile(profile, activeRole);

  const setActiveRole = (role: Role) => {
    if (!profile) return;
    if (!availableRoles.includes(role)) return;

    setPreferredRole(role);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`stk-active-role:${profile.uid}`, role);
    }
  };

  const signInWithUsername = async (username: string, password: string) => {
    const res = await loginAction(username, password);
    if (!res?.success) {
      throw new Error(res?.error || "Failed to sign in.");
    }
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("stk_tab_session_active", "1");
    }
    await fetchProfile();
  };

  const signOutCurrentUser = async () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("stk_tab_session_active");
      window.sessionStorage.setItem(POST_SIGNOUT_REDIRECT_KEY, "1");
    }
    setProfile(null);
    void logoutAction().catch(() => {});
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const createInitialSuperAdmin = async (input: { username: string; displayName: string; password: string; }) => {
    // Left empty for now, in a production setup we'd call an action here
    setBootstrapReady(true);
  };

  const verifyUsername = async (username: string): Promise<VerifyUsernameResult> => {
    return await verifyUsernameAction(username);
  };

  const forgotPassword = async (username: string, nextPassword: string) => {
    await resetPasswordAction(username, nextPassword);
  };

  // Provide a fake firebaseUser object for compatibility
  const firebaseUser = profile ? { uid: profile.uid, email: profile.username } : null;

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        workspaceProfile,
        loading,
        bootstrapReady,
        availableRoles,
        activeRole,
        setActiveRole,
        signInWithUsername,
        signOutCurrentUser,
        createInitialSuperAdmin,
        verifyUsername,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
