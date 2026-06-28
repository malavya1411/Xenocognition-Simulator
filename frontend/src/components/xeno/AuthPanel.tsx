import React, { useState } from "react";
import { Chrome, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthPanelProps {
  mode: "login" | "signup";
  onCancel: () => void;
  onSuccess: () => void;
}

export const AuthPanel: React.FC<AuthPanelProps> = ({ mode, onCancel, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setFormLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to connect Google account.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email || !password) {
      setErrorMsg("Please fill out all fields.");
      return;
    }
    setFormLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!name) {
          setErrorMsg("Please provide your name.");
          setFormLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setErrorMsg("Email already in use.");
      } else if (err.code === "auth/weak-password") {
        setErrorMsg("Password should be at least 6 characters.");
      } else if (err.code === "auth/invalid-credential") {
        setErrorMsg("Invalid credentials.");
      } else {
        setErrorMsg(err.message || "Authentication failed.");
      }
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="premium-glass relative w-full max-w-md mx-auto overflow-hidden rounded-2xl p-8 bg-surface/90 border border-border-glow shadow-2xl text-left"
    >
      <button
        onClick={onCancel}
        className="absolute top-4 left-6 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-text-ghost hover:text-text-primary transition-colors cursor-pointer"
      >
        <ArrowLeft size={10} /> Back to landing page
      </button>

      <div className="mt-6 text-center">
        <h3 className="font-sans text-lg font-bold uppercase tracking-wide text-text-primary">
          {mode === "login" ? "Welcome Back" : "Establish Identity"}
        </h3>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-text-secondary">
          {mode === "login" ? "Connect & Synchronize" : "Create Neural Profile"}
        </p>
      </div>

      {errorMsg && (
        <div className="mt-4 rounded border border-red-500/20 bg-red-950/20 p-3 text-xs text-red-400 font-mono">
          {errorMsg}
        </div>
      )}

      {mode === "login" ? (
        /* Log In Mode - Google connection primary */
        <div className="mt-6 space-y-5 text-center">
          <p className="text-xs text-text-secondary leading-relaxed">
            Connect your Google account to automatically authorize your workspace and access the simulation dashboard.
          </p>
          <button
            onClick={handleGoogleLogin}
            disabled={formLoading}
            className="flex w-full items-center justify-center gap-3 rounded bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wider text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            <Chrome size={14} />
            Connect Google Account
          </button>

          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="mt-2 font-mono text-[9px] uppercase tracking-widest text-text-ghost hover:text-text-secondary transition-colors underline cursor-pointer"
            >
              Use email credentials instead
            </button>
          ) : (
            <div className="text-left border-t border-border-dim pt-4 mt-4">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                    <Mail size={10} /> Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@xenolab.edu"
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
                  disabled={formLoading}
                  className="flex w-full items-center justify-center rounded border border-border-glow bg-elevated py-2.5 text-xs font-bold uppercase tracking-wider text-text-primary hover:bg-white hover:text-black transition-all cursor-pointer disabled:opacity-50"
                >
                  {formLoading ? "Authorizing..." : "Initialize Interface"}
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        /* Sign In (Sign Up) Mode - Profile Creation */
        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            disabled={formLoading}
            className="flex w-full items-center justify-center gap-3 rounded bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            <Chrome size={14} />
            Sign In with Google
          </button>

          <div className="relative mt-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-dim"></div></div>
            <span className="relative bg-[#08080f] px-3 font-mono text-[9px] uppercase tracking-widest text-text-ghost">or</span>
          </div>

          <form onSubmit={handleEmailAuth} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                <User size={10} /> Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Vance"
                className="w-full rounded border border-border-dim bg-void/50 px-3 py-2 text-xs text-text-primary outline-none focus:border-border-glow transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                <Mail size={10} /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@xenolab.edu"
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
              disabled={formLoading}
              className="mt-6 flex w-full items-center justify-center gap-1.5 rounded border border-border-glow bg-elevated py-2.5 text-xs font-bold uppercase tracking-wider text-text-primary hover:bg-white hover:text-black transition-all cursor-pointer disabled:opacity-50"
            >
              {formLoading ? "Deploying..." : "Create Neural Profile"}
            </button>
          </form>
        </div>
      )}
    </motion.div>
  );
};
