"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  links?: { name: string; href: string }[];
  logoText?: string;
  accent?: string; // e.g. "from-indigo-400 to-blue-500"
  showAuth?: boolean;
}

export default function Header({
  links = [
    { name: "Home", href: "/" },
    
  ],
  logoText = "ReUnion",
  accent = "from-indigo-400 to-blue-500",
  showAuth = false,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50
      w-[90%] max-w-6xl
      backdrop-blur-2xl bg-white/10 border border-white/10
      rounded-full shadow-[0_0_40px_rgba(255,255,255,0.1)]
      px-8 py-3 flex justify-between items-center transition-all duration-300"
    >
      {/* === Logo Section === */}
      
        <span className="text-white font-semibold text-lg tracking-wide">
          {logoText}
        </span>

      {/* === Navigation Links (Desktop) === */}
      <nav className="hidden sm:flex items-center space-x-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-gray-200 hover:text-white text-sm font-medium transition-colors"
          >
            {link.name}
          </Link>
        ))}

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
              className="px-4 py-2 text-sm font-semibold rounded-full bg-white text-gray-900 hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.3)  transition-all"
            >
              Join
            </Link>
          </>
        )}
      </nav>

      {/* === Mobile Menu Button === */}
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
          flex flex-col items-center py-4 space-y-4 sm:hidden"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-gray-200 hover:text-cyan-400 text-base transition-colors"
            >
              {link.name}
            </Link>
          ))}

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
                className="px-4 py-2 text-sm font-semibold text-gray-900  hover:bg-white hover:text-black rounded-md shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all"
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
