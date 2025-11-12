"use client";
import Link from "next/link";
import { Facebook, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="relative bottom-0 left-0 w-full z-50
      backdrop-blur-2xl bg-black/80 border-t border-white/10
      shadow-[0_-4px_20px_rgba(0,0,0,0.6)]
      text-gray-300 transition-colors duration-500"
      
    >
      <div className="max-w-6xl mx-auto px-8 py-4 flex flex-col sm:flex-row items-center justify-between">
        
        {/* Left — Brand */}
        <div className="flex items-center space-x-2 mb-3 sm:mb-0">
          <div className="h-6 w-6 rounded-full bg-linear-to-tr from-gray-400 to-gray-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">R</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-wide">ReUnion</span>
        </div>

        {/* Center — Links */}
        <div className="flex space-x-6 mb-3 sm:mb-0">
          <Link href="#" className="hover:text-cyan-400 text-sm transition-colors">
            About
          </Link>
          <Link href="#" className="hover:text-cyan-400 text-sm transition-colors">
            Contact
          </Link>
          <Link href="#" className="hover:text-cyan-400 text-sm transition-colors">
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
      <div className="border-t border-white/10 text-center py-2 text-xs text-gray-400 backdrop-blur-md">
        &copy; {new Date().getFullYear()} ReUnion. All rights reserved.
      </div>
    </footer>
  );
}
