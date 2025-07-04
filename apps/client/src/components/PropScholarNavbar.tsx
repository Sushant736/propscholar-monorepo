"use client";

import React, { useState } from "react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton,
} from "@/components/ui/resizable-navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { AuthModal } from "@/components/AuthModal";
import { ShoppingCart, User, LogOut, Settings, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export const PropScholarNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const router = useRouter();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Platforms", href: "/platforms" },
    { name: "Shop", href: "/shop" },
    { name: "Education", href: "/education" },
    { name: "Community", href: "/community" },
    { name: "About", href: "/about" },
  ];

  const handleItemClick = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
  };

  const openDashboard = () => {
    router.push("/dashboard");
    setIsUserDropdownOpen(false);
  };

  return (
    <>
      <Navbar className="px-4">
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems.map(item => ({ name: item.name, link: item.href }))} onItemClick={handleItemClick} />
          
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <button 
              onClick={() => router.push('/cart')}
              className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-prop-scholar-main-text" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-prop-scholar-electric-blue text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Auth Section */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <div className="bg-prop-scholar-electric-blue rounded-lg p-1">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-prop-scholar-main-text font-medium hidden md:block">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-12 w-48 bg-prop-scholar-deep-navy/95 backdrop-blur-xl border border-prop-scholar-electric-blue/20 rounded-2xl p-2 shadow-[0_0_40px_rgba(36,107,253,0.15)] z-50"
                    >
                      <div className="px-3 py-2 border-b border-prop-scholar-secondary-text/20 mb-2">
                        <p className="text-prop-scholar-main-text font-medium">{user.name}</p>
                        <p className="text-prop-scholar-secondary-text text-sm">{user.email}</p>
                      </div>
                      
                      <button
                        onClick={openDashboard}
                        className="w-full flex items-center gap-3 px-3 py-2 text-prop-scholar-main-text hover:bg-prop-scholar-electric-blue/20 rounded-xl transition-colors"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>Dashboard</span>
                      </button>
                      
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 text-prop-scholar-main-text hover:bg-prop-scholar-electric-blue/20 rounded-xl transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-400/20 rounded-xl transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <NavbarButton
                as="button"
                onClick={() => setIsAuthModalOpen(true)}
                variant="gradient"
              >
                Sign In
              </NavbarButton>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <div className="flex items-center gap-2">
              {/* Mobile Cart */}
              <button 
                onClick={() => router.push('/cart')}
                className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ShoppingCart className="h-5 w-5 text-prop-scholar-main-text" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-prop-scholar-electric-blue text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
              
              <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
            </div>
          </MobileNavHeader>

          <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
            {navItems.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                onClick={handleItemClick}
                className="block w-full text-left px-4 py-3 text-prop-scholar-main-text hover:text-prop-scholar-electric-blue hover:bg-prop-scholar-electric-blue/10 rounded-xl transition-colors"
              >
                {item.name}
              </a>
            ))}
            
            <div className="border-t border-prop-scholar-secondary-text/20 pt-4 mt-4">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="px-4 py-2">
                    <p className="text-prop-scholar-main-text font-medium">{user.name}</p>
                    <p className="text-prop-scholar-secondary-text text-sm">{user.email}</p>
                  </div>
                  
                  <button
                    onClick={openDashboard}
                    className="w-full flex items-center gap-3 px-4 py-3 text-prop-scholar-main-text hover:bg-prop-scholar-electric-blue/20 rounded-xl transition-colors"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                  
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-prop-scholar-main-text hover:bg-prop-scholar-electric-blue/20 rounded-xl transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/20 rounded-xl transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <NavbarButton
                  as="button"
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsOpen(false);
                  }}
                  variant="gradient"
                  className="w-full justify-center"
                >
                  Sign In
                </NavbarButton>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Click outside to close dropdown */}
      {isUserDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserDropdownOpen(false)}
        />
      )}
    </>
  );
}; 