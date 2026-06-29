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
  loginMockUser?: () => void;
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
        setProfile(null);
      }
    } catch (error) {
      console.warn("Firestore fetch failed. Setting profile to null to trigger setup form:", error);
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
      password: profileData.password || "",
      createdAt: new Date().toISOString()
    };

    setDoc(docRef, newProfile).catch((error) => {
      console.warn("Firestore background write failed:", error);
    });
    
    setProfile(newProfile);
  };

  const loginMockUser = () => {
    const mockUser = {
      uid: "mock-user-id-12345",
      email: "researcher@xenolab.edu",
      displayName: "Researcher Vance",
      photoURL: null,
      emailVerified: true,
    } as any;
    setUser(mockUser);
    setProfile({
      uid: "mock-user-id-12345",
      email: "researcher@xenolab.edu",
      displayName: "Researcher Vance",
      photoURL: null,
      createdAt: new Date().toISOString(),
    });
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchProfile(currentUser.uid, currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn("Firebase signout failed:", e);
    }
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, refreshProfile, saveProfile, loginMockUser }}>
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

