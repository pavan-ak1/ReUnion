"use client";

import Link from "next/link";
import { Menu, X, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { NotificationBell } from "@/components/NotificationBell";

interface HeaderProps {
  links?: { name: string; href: string }[];
  logoText?: string;
  accent?: string; // e.g. "from-indigo-400 to-blue-500"
  showAuth?: boolean;
  dashboardLinks?: boolean;
}

export default function Header({
  links = [{ name: "Home", href: "/" }],
  logoText = "ReUnion",
  accent = "from-indigo-400 to-blue-500",
  showAuth = false,
  dashboardLinks = false,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashboardHome, setDashboardHome] = useState("/");

  // Detect user role from storage
  useEffect(() => {
    const role =
      localStorage.getItem("role") ||
      sessionStorage.getItem("role") ||
      ""; // 'student' or 'alumni'

    if (role === "student") setDashboardHome("/student/dashboard");
    else if (role === "alumni") setDashboardHome("/alumni/dashboard");
    else setDashboardHome("/");
  }, []);

  return (
    <header
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50
      w-[90%] max-w-6xl
      backdrop-blur-2xl bg-white/10 border border-white/10
      rounded-full shadow-[0_0_40px_rgba(255,255,255,0.1)]
      px-8 py-3 flex justify-between items-center transition-all duration-300"
    >
      {/* === Logo Section === */}
      <Link href={dashboardHome} className="flex items-center space-x-2">
        <span className="text-white font-semibold text-lg tracking-wide">
          {logoText}
        </span>
      </Link>

      {/* === Navigation Links (Desktop) === */}
      <nav className="hidden sm:flex items-center space-x-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.name === "Home" ? dashboardHome : link.href}
            className="text-gray-200 hover:text-white text-sm font-medium transition-colors"
          >
            {link.name}
          </Link>
        ))}

        {dashboardLinks && (
          <>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <Link
                href={
                  dashboardHome.includes("student")
                    ? "/student/profile"
                    : "/alumni/profile"
                }
                className="flex items-center justify-center gap-2
                  px-5 py-2.5 rounded-full 
                  bg-transparent hover:bg-white
                  border border-gray-200 hover:border-white
                  text-white hover:text-black
                  text-sm font-semibold
                  transition-all duration-300
                  hover:scale-105"
              >
                Profile
              </Link>
            </div>

            <Link
              href="/signin"
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
              }}
              className="flex items-center justify-center gap-2
                px-5 py-2.5 rounded-full 
                bg-transparent hover:bg-red-600
                border border-red-600/40 hover:border-red-600
                text-white hover:text-white
                text-sm font-semibold
                transition-all duration-300
                hover:scale-105"
            >
              Logout
            </Link>
          </>
        )}

        {showAuth && (
          <>
            <Link
              href="/signin"
              className="text-gray-200 hover:text-white text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-semibold rounded-full bg-white text-gray-900 hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all"
            >
              Join
            </Link>
          </>
        )}
      </nav>

      {/* === Mobile Menu Toggle === */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="sm:hidden text-white"
        aria-label="Toggle Menu"
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* === Mobile Menu === */}
      {menuOpen && (
        <div
          className="absolute top-full mt-3 left-0 w-full
          bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl
          flex flex-col items-center py-5 space-y-4 sm:hidden"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.name === "Home" ? dashboardHome : link.href}
              onClick={() => setMenuOpen(false)}
              className="text-gray-200 hover:text-cyan-400 text-base transition-colors"
            >
              {link.name}
            </Link>
          ))}

          {dashboardLinks && (
            <>
              <div className="flex items-center justify-center">
                <NotificationBell />
              </div>
              <Link
                href={
                  dashboardHome.includes("student")
                    ? "/student/profile"
                    : "/alumni/profile"
                }
                onClick={() => setMenuOpen(false)}
                className="text-gray-200 hover:text-cyan-400 text-base transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = "/signin";
                }}
                className="text-gray-200 hover:text-red-400 text-base transition-colors"
              >
                Logout
              </button>
            </>
          )}

          {showAuth && (
            <>
              <Link
                href="/signin"
                onClick={() => setMenuOpen(false)}
                className="text-gray-200 hover:text-cyan-400 text-base transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-900 bg-white hover:bg-gray-200 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all"
              >
                Join
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
