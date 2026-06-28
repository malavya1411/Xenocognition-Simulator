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
  password?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  saveProfile: (profileData: {
    displayName: string;
    email: string;
    password?: string;
  }) => Promise<void>;
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
        // Stop here! Do not automatically create the profile.
        // Set profile to null so the frontend knows to prompt for details.
        setProfile(null);
      }
    } catch (error) {
      console.warn("Firestore fetch failed (likely missing rules/permissions). Setting profile to null to trigger setup form:", error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid, user);
    }
  };

  const saveProfile = async (profileData: {
    displayName: string;
    email: string;
    password?: string;
  }) => {
    if (!user) throw new Error("No authenticated user found.");
    
    const docRef = doc(db, "users", user.uid);
    const newProfile: UserProfile = {
      uid: user.uid,
      email: profileData.email,
      displayName: profileData.displayName,
      photoURL: user.photoURL,
      password: profileData.password || "", // Save password if provided
      createdAt: new Date().toISOString()
    };

    // Run setDoc in the background without awaiting it.
    // This prevents the UI from getting stuck if the network hangs or rules are locked.
    setDoc(docRef, newProfile).catch((error) => {
      console.warn("Firestore background write failed (likely missing rules/permissions):", error);
    });
    
    // Set profile state immediately to trigger dashboard redirection
    setProfile(newProfile);
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
    <AuthContext.Provider value={{ user, profile, loading, logout, refreshProfile, saveProfile }}>
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
