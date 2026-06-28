import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signOut as fbSignOut 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc
} from "firebase/firestore";
import { auth, db } from "./firebase";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string, currentUser: User) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Create initial profile for new user in Firestore
        const initialProfile: UserProfile = {
          uid: uid,
          email: currentUser.email,
          displayName: currentUser.displayName || (currentUser.email ? currentUser.email.split("@")[0] : "Xeno Researcher"),
          photoURL: currentUser.photoURL,
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, initialProfile);
        setProfile(initialProfile);
      }
    } catch (error) {
      console.warn("Firestore fetch failed (likely missing rules/permissions). Falling back to memory-only profile:", error);
      // Resilient Fallback: construct in-memory profile so user is not blocked
      const fallbackProfile: UserProfile = {
        uid: uid,
        email: currentUser.email,
        displayName: currentUser.displayName || (currentUser.email ? currentUser.email.split("@")[0] : "Xeno Researcher"),
        photoURL: currentUser.photoURL,
        createdAt: new Date().toISOString()
      };
      setProfile(fallbackProfile);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid, user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid, currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    setLoading(true);
    await fbSignOut(auth);
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
