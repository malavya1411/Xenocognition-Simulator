import React, { useState } from "react";
import { X, Chrome, Mail, Lock, User } from "lucide-react";
import { motion } from "framer-motion";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = "login" }) => {
  const [authTab, setAuthTab] = useState<"login" | "signup">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setFormLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to log in with Google.");
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
      if (authTab === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!name) {
          setErrorMsg("Please provide your name.");
          setFormLoading(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/85 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="premium-glass relative w-full max-w-md overflow-hidden rounded-2xl p-8 bg-surface/90 border border-border-glow shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-text-ghost hover:text-text-primary rounded p-1 hover:bg-white/5 transition-colors"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        <h3 className="font-sans text-xl font-bold uppercase tracking-wide text-text-primary text-center">
          Sync Interface
        </h3>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-text-secondary text-center">
          Initialize Secure Uplink
        </p>

        {errorMsg && (
          <div className="mt-4 rounded border border-red-500/20 bg-red-950/20 p-3 text-xs text-red-400 font-mono">
            {errorMsg}
          </div>
        )}

        <div className="mt-6 flex border-b border-border-dim">
          <button
            onClick={() => { setAuthTab("login"); setErrorMsg(""); }}
            className={`flex-1 pb-3 text-xs font-semibold uppercase tracking-wider transition-colors ${authTab === "login" ? "text-text-primary border-b-2 border-text-primary" : "text-text-ghost hover:text-text-secondary"}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setAuthTab("signup"); setErrorMsg(""); }}
            className={`flex-1 pb-3 text-xs font-semibold uppercase tracking-wider transition-colors ${authTab === "signup" ? "text-text-primary border-b-2 border-text-primary" : "text-text-ghost hover:text-text-secondary"}`}
          >
            Create Account
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            disabled={formLoading}
            className="flex w-full items-center justify-center gap-3 rounded bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-black hover:bg-neutral-200 transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            <Chrome size={14} />
            Connect with Google
          </button>
        </div>

        <div className="relative mt-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-dim"></div></div>
          <span className="relative bg-[#08080f] px-3 font-mono text-[9px] uppercase tracking-widest text-text-ghost">or</span>
        </div>

        <form onSubmit={handleEmailAuth} className="mt-6 space-y-4">
          {authTab === "signup" && (
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
          )}
          
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
            {formLoading ? "Authorizing..." : authTab === "login" ? "Initialize Interface" : "Deploy Credentials"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};
