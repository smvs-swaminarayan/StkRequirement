"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/components/providers/auth-provider";
import { getFirebaseErrorMessage } from "@/lib/firebase/error-message";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

const POST_LOGIN_FORCE_ROLE_KEY = "stk:post-login-force-role";

function stripUrlDecorators(path: string) {
  return path.split("#")[0]?.split("?")[0] ?? path;
}

function resolveNextAfterLogin(nextPath?: string) {
  let decoded = nextPath ? decodeURIComponent(nextPath) : undefined;
  const normalized = decoded ? stripUrlDecorators(decoded) : undefined;

  if (normalized === "/cart" || normalized === "/orders/cart") {
    return { target: "/orders/cart", forceUserRole: true };
  }

  const target = (normalized && normalized !== "/") ? normalized : "/orders";
  return { target, forceUserRole: false };
}

export function LoginScreen({ nextPath }: { nextPath?: string }) {
  const {
    bootstrapReady,
    createInitialSuperAdmin,
    firebaseUser,
    verifyUsername,
    forgotPassword,
    signInWithUsername,
  } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "bootstrap">(
    bootstrapReady ? "login" : "bootstrap",
  );
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [bootstrapForm, setBootstrapForm] = useState({
    username: "",
    displayName: "",
    password: "",
  });
  const [resetStep, setResetStep] = useState<"username" | "password" | "done">("username");
  const [resetForm, setResetForm] = useState({
    username: "",
    nextPassword: "",
    confirmPassword: "",
  });
  const [resetVerifiedName, setResetVerifiedName] = useState("");
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMode(bootstrapReady ? "login" : "bootstrap");
  }, [bootstrapReady]);

  useEffect(() => {
    if (firebaseUser) {
      const { target, forceUserRole } = resolveNextAfterLogin(nextPath);

      if (forceUserRole) {
        window.sessionStorage.setItem(POST_LOGIN_FORCE_ROLE_KEY, "USER");
      }

      window.location.assign(target);
    }
  }, [firebaseUser, nextPath]);

  const onLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const { target, forceUserRole } = resolveNextAfterLogin(nextPath);
      if (forceUserRole) {
        window.sessionStorage.setItem(POST_LOGIN_FORCE_ROLE_KEY, "USER");
      }
      await signInWithUsername(loginForm.username, loginForm.password);
      toast.success("Welcome back!");
      window.location.assign(target);
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error, "Unable to sign in."));
      setSubmitting(false);
    }
  };

  const onBootstrap = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await createInitialSuperAdmin(bootstrapForm);
      router.replace("/dashboard");
      toast.success("Setup complete.");
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error, "Unable to initialize app."));
    } finally {
      setSubmitting(false);
    }
  };

  const onVerifyUsername = async () => {
    if (!resetForm.username.trim()) {
      toast.error("Please enter your username.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await verifyUsername(resetForm.username.trim());
      if (result.found) {
        setResetVerifiedName(result.displayName || result.username || resetForm.username.trim());
        setResetStep("password");
        toast.success(`Account verified: ${result.displayName || result.username}`);
      } else {
        toast.error(result.error || "User not found.");
      }
    } catch {
      toast.error("Unable to verify username. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const onForgotPassword = async () => {
    const passLen = resetForm.nextPassword.trim().length;
    if (passLen < 3 || passLen > 16) {
      toast.error("Password must be between 3 and 16 characters.");
      return;
    }

    if (resetForm.nextPassword !== resetForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await forgotPassword(resetForm.username, resetForm.nextPassword);
      setResetStep("done");
      toast.success("Your password has been updated successfully!");
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error, "Unable to reset password."));
    } finally {
      setSubmitting(false);
    }
  };

  const openResetModal = () => {
    setResetForm({
      username: loginForm.username,
      nextPassword: "",
      confirmPassword: "",
    });
    setResetStep("username");
    setResetVerifiedName("");
    setResetModalOpen(true);
  };

  const closeResetModal = () => {
    setResetModalOpen(false);
    setResetStep("username");
    setResetVerifiedName("");
    if (resetStep === "done") {
      setLoginForm((current) => ({
        ...current,
        username: resetForm.username,
        password: "",
      }));
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      {/* ─── Animated Background ────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]" />
      <div className="soft-grid absolute inset-0" />

      {/* Animated floating orbs */}
      <div className="login-orb left-[10%] top-[15%] h-[300px] w-[300px] bg-[var(--accent)]/30" style={{ animationDelay: "0s" }} />
      <div className="login-orb right-[15%] top-[60%] h-[250px] w-[250px] bg-[var(--primary)]/20" style={{ animationDelay: "2s" }} />
      <div className="login-orb left-[50%] bottom-[10%] h-[200px] w-[200px] bg-[var(--teal)]/15" style={{ animationDelay: "1s" }} />

      {/* ─── Login Card ─────────────────────────────── */}
      <section className="animate-fade-up relative z-10 w-full max-w-[420px]">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-sm font-extrabold text-white shadow-lg shadow-[var(--primary)]/30">
            STK
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">STK Requirement</span>
        </div>

        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-white/10 bg-white/[0.06] shadow-xl backdrop-blur-xl">
          <div className="rounded-[var(--radius-xl)] bg-white p-7 sm:p-8">
            <div>
              <h2 className="animate-fade-up text-2xl font-bold text-[var(--ink)]">
                Welcome back
              </h2>
              <p className="animate-fade-up mt-1.5 text-sm text-[var(--ink-soft)]" style={{ animationDelay: "0.05s" }}>
                Enter your credentials to sign in.
              </p>
            </div>

            <form className="mt-6 space-y-4" onSubmit={onLogin}>
                <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--ink)]">
                    Username
                  </label>
                  <input
                    className="stk-input py-2.5"
                    value={loginForm.username}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        username: event.target.value,
                      }))
                    }
                    placeholder="Enter your username"
                    required
                    autoComplete="username"
                  />
                </div>
                <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
                  <label className="mb-1.5 block text-sm font-semibold text-[var(--ink)]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="stk-input py-2.5 pr-10"
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-light)] hover:text-[var(--ink-soft)] transition"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="animate-fade-up btn-action w-full py-3 text-base"
                  style={{ animationDelay: "0.2s" }}
                >
                  {submitting ? "Signing in..." : "Sign in"}
                </button>
                <button
                  type="button"
                  onClick={openResetModal}
                  className="animate-fade-up w-full text-center text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-dark)] transition"
                  style={{ animationDelay: "0.25s" }}
                >
                  Forgot password?
                </button>
              </form>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-white/30 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          &copy; {new Date().getFullYear()} STK Requirement System
        </p>
      </section>

      {/* ─── Forgot Password Modal (3-step) ─────────── */}
      <Modal
        open={resetModalOpen}
        onClose={closeResetModal}
        title={
          resetStep === "username"
            ? "Forgot password"
            : resetStep === "password"
              ? "Set new password"
              : "Password updated"
        }
        description={
          resetStep === "username"
            ? "Enter your username to verify your account."
            : resetStep === "password"
              ? `Account verified: ${resetVerifiedName}`
              : undefined
        }
      >
        <div className="space-y-4">
          {resetStep === "username" ? (
            <>
              <label className="block text-sm font-semibold text-[var(--ink)]">
                Username
                <input
                  className="stk-input mt-1.5 py-2.5"
                  value={resetForm.username}
                  onChange={(event) =>
                    setResetForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                  placeholder="Enter your username"
                  autoFocus
                />
              </label>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeResetModal} className="btn-secondary">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onVerifyUsername}
                  disabled={submitting || !resetForm.username.trim()}
                  className="btn-action"
                >
                  {submitting ? "Checking..." : "Next →"}
                </button>
              </div>
            </>
          ) : resetStep === "password" ? (
            <>
              <div className="rounded-[var(--radius-md)] border border-[var(--success)]/30 bg-[var(--success-soft)] p-3">
                <p className="text-sm font-semibold text-[var(--success)]">
                  ✓ Account verified: {resetVerifiedName}
                </p>
              </div>
              <label className="block text-sm font-semibold text-[var(--ink)]">
                New password
                <input
                  type="password"
                  className="stk-input mt-1.5 py-2.5"
                  value={resetForm.nextPassword}
                  onChange={(event) =>
                    setResetForm((current) => ({
                      ...current,
                      nextPassword: event.target.value,
                    }))
                  }
                  placeholder="Enter new password (minimum 6 characters)"
                  autoFocus
                />
              </label>
              <label className="block text-sm font-semibold text-[var(--ink)]">
                Re-enter password
                <input
                  type="password"
                  className="stk-input mt-1.5 py-2.5"
                  value={resetForm.confirmPassword}
                  onChange={(event) =>
                    setResetForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  placeholder="Re-enter new password (minimum 6 characters)"
                />
              </label>
              <div className="flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setResetStep("username")}
                  className="btn-secondary"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  disabled={
                    submitting ||
                    !resetForm.nextPassword.trim() ||
                    !resetForm.confirmPassword.trim()
                  }
                  className="btn-action"
                >
                  {submitting ? "Saving..." : "Change Password"}
                </button>
              </div>
            </>
          ) : (
            /* Step 3: Success */
            <>
              <div className="rounded-[var(--radius-lg)] border border-[var(--success)]/30 bg-[var(--success-soft)] p-6 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success)]/10">
                  <svg className="h-7 w-7 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-[var(--success)]">Password Updated!</h4>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  Your password has been updated successfully. You can now sign in with your new password.
                </p>
              </div>
              <button
                type="button"
                onClick={closeResetModal}
                className="btn-action w-full py-2.5"
              >
                Back to Sign In
              </button>
            </>
          )}
        </div>
      </Modal>
    </main>
  );
}
