"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { X, Mail, ArrowRight, ArrowLeft, Check } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthStep = "email" | "otp" | "signup" | "login";

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep("email");
      setEmail("");
      setOtp(["", "", "", "", ""]);
      setName("");
      setPhone("");
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setStep("otp");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 4) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some(digit => !digit)) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setStep("signup");
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fake user data
    const userData = {
      id: "user_" + Date.now(),
      email,
      name,
      phone,
    };
    
    login(userData);
    setIsLoading(false);
    onClose();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fake user data for returning user
    const userData = {
      id: "user_" + Date.now(),
      email,
      name: "John Doe", // Mock name
      phone: "+1234567890", // Mock phone
    };
    
    login(userData);
    setIsLoading(false);
    onClose();
  };

  const goBack = () => {
    if (step === "otp") setStep("email");
    else if (step === "signup") setStep("otp");
    else if (step === "login") setStep("email");
  };

  const switchToLogin = () => {
    setStep("login");
    setOtp(["", "", "", "", ""]);
    setName("");
    setPhone("");
  };

  const switchToSignup = () => {
    setStep("email");
    setOtp(["", "", "", "", ""]);
    setName("");
    setPhone("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md mx-4"
      >
        {/* Hero Background */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-prop-scholar-deep-navy via-slate-900 to-prop-scholar-deep-navy border border-prop-scholar-electric-blue/20">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-radial from-prop-scholar-royal-blue/10 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-radial from-prop-scholar-electric-blue/20 to-transparent blur-3xl" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <X className="h-5 w-5 text-prop-scholar-main-text" />
          </button>

          {/* Back Button */}
          {step !== "email" && step !== "login" && (
            <button
              onClick={goBack}
              className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors z-10"
            >
              <ArrowLeft className="h-5 w-5 text-prop-scholar-main-text" />
            </button>
          )}

          {/* Content */}
          <div className="relative p-8 pt-16">
            <AnimatePresence mode="wait">
              {/* Email Step */}
              {step === "email" && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center"
                >
                  <div className="bg-prop-scholar-electric-blue/20 rounded-2xl p-4 w-fit mx-auto mb-6">
                    <Mail className="h-8 w-8 text-prop-scholar-electric-blue" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-prop-scholar-main-text mb-2">
                    Welcome to PropScholar
                  </h2>
                  <p className="text-prop-scholar-secondary-text mb-8">
                    Enter your email to get started with your trading journey
                  </p>

                  <form onSubmit={handleEmailSubmit} className="space-y-6">
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-prop-scholar-electric-blue/30 text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:border-prop-scholar-electric-blue focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !email}
                      className="w-full bg-gradient-to-r from-prop-scholar-royal-blue to-prop-scholar-electric-blue hover:from-prop-scholar-electric-blue hover:to-prop-scholar-royal-blue px-6 py-3 rounded-xl font-semibold text-white shadow-[0_0_20px_rgba(36,107,253,0.3)] hover:shadow-[0_0_30px_rgba(36,107,253,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Continue <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-prop-scholar-secondary-text/20">
                    <p className="text-sm text-prop-scholar-secondary-text">
                      Already have an account?{" "}
                      <button
                        onClick={switchToLogin}
                        className="text-prop-scholar-electric-blue hover:text-prop-scholar-royal-blue transition-colors font-medium"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* OTP Step */}
              {step === "otp" && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center"
                >
                  <div className="bg-prop-scholar-amber-yellow/20 rounded-2xl p-4 w-fit mx-auto mb-6">
                    <Check className="h-8 w-8 text-prop-scholar-amber-yellow" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-prop-scholar-main-text mb-2">
                    Verify Your Email
                  </h2>
                  <p className="text-prop-scholar-secondary-text mb-8">
                    Enter the 5-digit code sent to<br />
                    <span className="text-prop-scholar-electric-blue font-medium">{email}</span>
                  </p>

                  <form onSubmit={handleOtpSubmit} className="space-y-6">
                    <div className="flex justify-center gap-3">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { otpRefs.current[index] = el; }}
                          type="text"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-12 text-center rounded-xl bg-white/10 border border-prop-scholar-electric-blue/30 text-prop-scholar-main-text font-bold text-lg focus:border-prop-scholar-electric-blue focus:outline-none transition-colors"
                          maxLength={1}
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otp.some(digit => !digit)}
                      className="w-full bg-gradient-to-r from-prop-scholar-royal-blue to-prop-scholar-electric-blue hover:from-prop-scholar-electric-blue hover:to-prop-scholar-royal-blue px-6 py-3 rounded-xl font-semibold text-white shadow-[0_0_20px_rgba(36,107,253,0.3)] hover:shadow-[0_0_30px_rgba(36,107,253,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Verify Code <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-sm text-prop-scholar-secondary-text mt-4">
                    Didn't receive the code?{" "}
                    <button className="text-prop-scholar-electric-blue hover:text-prop-scholar-royal-blue transition-colors font-medium">
                      Resend
                    </button>
                  </p>
                </motion.div>
              )}

              {/* Signup Step */}
              {step === "signup" && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center"
                >
                  <h2 className="text-2xl font-bold text-prop-scholar-main-text mb-2">
                    Complete Your Profile
                  </h2>
                  <p className="text-prop-scholar-secondary-text mb-8">
                    Just a few more details to get started
                  </p>

                  <form onSubmit={handleSignupSubmit} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-prop-scholar-electric-blue/30 text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:border-prop-scholar-electric-blue focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone Number"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-prop-scholar-electric-blue/30 text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:border-prop-scholar-electric-blue focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="email"
                        value={email}
                        readOnly
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-prop-scholar-secondary-text/20 text-prop-scholar-secondary-text cursor-not-allowed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !name || !phone}
                      className="w-full bg-gradient-to-r from-prop-scholar-royal-blue to-prop-scholar-electric-blue hover:from-prop-scholar-electric-blue hover:to-prop-scholar-royal-blue px-6 py-3 rounded-xl font-semibold text-white shadow-[0_0_20px_rgba(36,107,253,0.3)] hover:shadow-[0_0_30px_rgba(36,107,253,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Complete Signup"
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Login Step */}
              {step === "login" && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center"
                >
                  <div className="bg-prop-scholar-electric-blue/20 rounded-2xl p-4 w-fit mx-auto mb-6">
                    <Mail className="h-8 w-8 text-prop-scholar-electric-blue" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-prop-scholar-main-text mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-prop-scholar-secondary-text mb-8">
                    Sign in to your PropScholar account
                  </p>

                  <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-prop-scholar-electric-blue/30 text-prop-scholar-main-text placeholder-prop-scholar-secondary-text focus:border-prop-scholar-electric-blue focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !email}
                      className="w-full bg-gradient-to-r from-prop-scholar-royal-blue to-prop-scholar-electric-blue hover:from-prop-scholar-electric-blue hover:to-prop-scholar-royal-blue px-6 py-3 rounded-xl font-semibold text-white shadow-[0_0_20px_rgba(36,107,253,0.3)] hover:shadow-[0_0_30px_rgba(36,107,253,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Sign In <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-prop-scholar-secondary-text/20">
                    <p className="text-sm text-prop-scholar-secondary-text">
                      Don't have an account?{" "}
                      <button
                        onClick={switchToSignup}
                        className="text-prop-scholar-electric-blue hover:text-prop-scholar-royal-blue transition-colors font-medium"
                      >
                        Sign up
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 