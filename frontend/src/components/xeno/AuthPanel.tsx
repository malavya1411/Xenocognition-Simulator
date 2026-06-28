import React, { useState, useEffect } from "react";
import { Chrome, Mail, Lock, User, ArrowLeft, Send } from "lucide-react";
import { motion } from "framer-motion";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

interface AuthPanelProps {
  mode: "login" | "signup";
  onCancel: () => void;
  onSuccess: () => void;
}

export const AuthPanel: React.FC<AuthPanelProps> = ({ mode, onCancel, onSuccess }) => {
  const { user, profile, saveProfile, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Prefill fields when user becomes authenticated but profile is missing
  useEffect(() => {
    if (user && !profile) {
      setEmail(user.email || "");
      setUsername(user.displayName || "");
    }
  }, [user, profile]);

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // Wait for auth context to update user/profile. 
      // If profile already exists, onSuccess() will navigate them to dashboard
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to connect Google account.");
      setGoogleLoading(false);
    }
  };

  const handleProfileSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!username.trim() || !email.trim()) {
      setErrorMsg("Username and Email are required.");
      return;
    }
    setProfileLoading(true);
    try {
      await saveProfile({
        displayName: username.trim(),
        email: email.trim(),
        password: password
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to create profile in Firestore.");
      setProfileLoading(false);
    }
  };

  const handleCancelAndLogout = async () => {
    setGoogleLoading(true);
    try {
      await logout();
      onCancel();
    } catch (err) {
      console.error(err);
      setGoogleLoading(false);
    }
  };

  // If the user has authenticated via Google, but has no Firestore profile setup yet,
  // we STOP here and ask for Username, Email, and Password details.
  if (user && !profile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="premium-glass relative w-full max-w-md mx-auto overflow-hidden rounded-2xl p-8 bg-surface/90 border border-border-glow shadow-2xl text-left"
      >
        <button
          onClick={handleCancelAndLogout}
          disabled={googleLoading || profileLoading}
          className="absolute top-4 left-6 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-text-ghost hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft size={10} /> Cancel Registration
        </button>

        <div className="mt-6 text-center">
          <h3 className="font-sans text-lg font-bold uppercase tracking-wide text-text-primary">
            Complete Neural Profile
          </h3>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-text-secondary">
            Personalize Your Uplink Session
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded border border-red-500/20 bg-red-950/20 p-3 text-xs text-red-400 font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleProfileSetupSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-[9px] uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
              <User size={10} /> Custom Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Researcher Vance"
              required
              className="w-full rounded border border-border-dim bg-void/50 px-3 py-2 text-xs text-text-primary outline-none focus:border-border-glow transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-[9px] uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
              <Mail size={10} /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="researcher@xenolab.edu"
              required
              className="w-full rounded border border-border-dim bg-void/50 px-3 py-2 text-xs text-text-primary outline-none focus:border-border-glow transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-[9px] uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
              <Lock size={10} /> Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded border border-border-dim bg-void/50 px-3 py-2 text-xs text-text-primary outline-none focus:border-border-glow transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="mt-6 flex w-full items-center justify-center gap-1.5 rounded border border-border-glow bg-elevated py-2.5 text-xs font-bold uppercase tracking-wider text-text-primary hover:bg-white hover:text-black transition-all cursor-pointer disabled:opacity-50"
          >
            {profileLoading ? "Saving Uplink..." : "Complete Setup & Enter Dashboard"}
          </button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="premium-glass relative w-full max-w-md mx-auto overflow-hidden rounded-2xl p-8 bg-surface/90 border border-border-glow shadow-2xl text-left"
    >
      <button
        onClick={onCancel}
        disabled={googleLoading}
        className="absolute top-4 left-6 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-text-ghost hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
      >
        <ArrowLeft size={10} /> Back to landing page
      </button>

      <div className="mt-6 text-center">
        <h3 className="font-sans text-lg font-bold uppercase tracking-wide text-text-primary">
          {mode === "login" ? "Welcome Back" : "Verify Identity"}
        </h3>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-text-secondary">
          {mode === "login" ? "Connect & Synchronize" : "Google Authentication Step"}
        </p>
      </div>

      {errorMsg && (
        <div className="mt-4 rounded border border-red-500/20 bg-red-950/20 p-3 text-xs text-red-400 font-mono">
          {errorMsg}
        </div>
      )}

      <div className="mt-8 space-y-6 text-center">
        <p className="text-xs text-text-secondary leading-relaxed">
          {mode === "login" 
            ? "Connect your Google account to automatically authorize your workspace and access the simulation dashboard."
            : "Verify your Google credentials first to initialize your workspace profile."}
        </p>
        
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wider text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-lg disabled:opacity-50"
        >
          <Chrome size={14} />
          {googleLoading ? "Connecting Google..." : (mode === "login" ? "Connect Google Account" : "Verify Google Account")}
        </button>
      </div>
    </motion.div>
  );
};
