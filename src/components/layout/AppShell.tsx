"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home,
  MessageCircle,
  BarChart3,
  BookOpen,
  GraduationCap,
  Settings,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/learn", icon: MessageCircle, label: "Chat" },
  { href: "/lessons", icon: GraduationCap, label: "Lessons" },
  { href: "/dashboard", icon: BarChart3, label: "Progress" },
  { href: "/dashboard?tab=parent", icon: BookOpen, label: "Parents" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function AppShell({
  children,
  showNav = true,
}: {
  children: ReactNode;
  showNav?: boolean;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F5EF]">
      {showNav && (
        <>
          {/* Desktop sidebar */}
          <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 flex-col items-center py-6 gap-2 bg-white/80 backdrop-blur-sm border-r border-[#E5E2DA] z-40">
            <Link href="/" className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#4F7C57] flex items-center justify-center text-white text-xl font-bold">
                P
              </div>
            </Link>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href.split("?")[0]));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all text-xs",
                    isActive
                      ? "bg-[#DDEED5] text-[#4F7C57] font-semibold"
                      : "text-[#6B7280] hover:bg-[#F0EDE6]"
                  )}
                >
                  <item.icon size={20} />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile top bar */}
          <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-sm border-b border-[#E5E2DA] flex items-center justify-between px-4 z-40">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#4F7C57] flex items-center justify-center text-white text-sm font-bold">
                P
              </div>
              <span className="font-bold text-[#2F2F2F]">Panda</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#F0EDE6]"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="md:hidden fixed top-14 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-[#E5E2DA] z-30 p-4"
              >
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-colors",
                        isActive
                          ? "bg-[#DDEED5] text-[#4F7C57] font-semibold"
                          : "text-[#6B7280] hover:bg-[#F0EDE6]"
                      )}
                    >
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile bottom nav */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-sm border-t border-[#E5E2DA] flex items-center justify-around z-40">
            {navItems.slice(0, 4).map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href.split("?")[0]));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors",
                    isActive
                      ? "text-[#4F7C57] font-semibold"
                      : "text-[#6B7280]"
                  )}
                >
                  <item.icon size={20} />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </>
      )}

      <main
        className={cn(
          "min-h-screen",
          showNav && "md:ml-20 pb-20 md:pb-0 pt-14 md:pt-0"
        )}
      >
        {children}
      </main>
    </div>
  );
}
