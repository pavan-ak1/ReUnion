"use client";
import Link from "next/link";
import { Facebook, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="relative w-full
        backdrop-blur-2xl bg-black border-t border-white/10
        shadow-[0_-4px_20px_rgba(0,0,0,0.6)]
        text-gray-300 transition-colors duration-500"
    >
      <div className="max-w-6xl mx-auto px-8 py-4 flex flex-col sm:flex-row items-center justify-between">
        
        {/* Left — Brand (Plain Text Logo) */}
        <Link
          href="/"
          className="flex items-center mb-3 sm:mb-0"
          aria-label="ReUnion Homepage"
        >
          <span className="text-white font-semibold text-xl tracking-wide">
            ReUnion
          </span>
        </Link>

        {/* Center — Links */}
        <div className="flex space-x-6 mb-3 sm:mb-0">
          <Link
            href="#"
            className="hover:text-cyan-400 text-sm transition-colors"
          >
            About
          </Link>
          <Link
            href="#"
            className="hover:text-cyan-400 text-sm transition-colors"
          >
            Contact
          </Link>
          <Link
            href="#"
            className="hover:text-cyan-400 text-sm transition-colors"
          >
            Privacy
          </Link>
        </div>

        {/* Right — Socials */}
        <div className="flex space-x-5">
          <Link
            href="#"
            className="hover:text-cyan-400 transition-colors duration-300 transform hover:scale-110"
            aria-label="Facebook"
          >
            <Facebook className="w-4 h-4" />
          </Link>
          <Link
            href="#"
            className="hover:text-cyan-400 transition-colors duration-300 transform hover:scale-110"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </Link>
          <Link
            href="#"
            className="hover:text-cyan-400 transition-colors duration-300 transform hover:scale-110"
            aria-label="Twitter"
          >
            <Twitter className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Bottom line */}
      <div className="border-t border-white/10 text-center py-2 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} ReUnion. All rights reserved.
      </div>
    </footer>
  );
}