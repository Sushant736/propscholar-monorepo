"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthService, User } from "@/lib/auth-service";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check if user has valid tokens
      if (AuthService.isAuthenticated()) {
        // Try to fetch user profile with current tokens
        const userProfile = await AuthService.getProfile();
        setUser(userProfile);
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      // Clear any invalid tokens
      AuthService.clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const refreshUserProfile = async () => {
    try {
      if (AuthService.isAuthenticated()) {
        const userProfile = await AuthService.getProfile();
        setUser(userProfile);
      }
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
      // If profile fetch fails, logout the user
      setUser(null);
      AuthService.clearAuth();
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 