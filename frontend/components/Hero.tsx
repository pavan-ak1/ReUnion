"use client";
import Link from "next/link";
import Aurora from "@/components/Aurora";
import GlowDivider from "./GlowDivider";

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] sm:min-h-screen overflow-hidden text-white px-6">
      {/* === Aurora Background (No black overlay) === */}
      <div className="absolute inset-0 -z-10  bg-[#050505]">
        <Aurora
          colorStops={[
            "#6A5AE0", // violet
            "#3A29FF", // indigo
            "#FF94B4", // pink
            "#FF3232", // red
          ]}
          blend={0.9}
          amplitude={1}
          speed={0.5}
        />
        {/* Subtle gradient overlay to fade Aurora near bottom for readability */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/20 to-black/80" />
      </div>

      {/* === Frosted Navbar === */}
      

      {/* === Hero Content === */}
      <div className="relative z-10 flex flex-col items-center text-center mt-28 sm:mt-40 px-4">
        <div className="px-4 py-1.5 mb-6 rounded-full border border-white/20 bg-white/10 text-sm text-gray-200">
          ✦ ReUnion Platform
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight max-w-3xl">
          Bridging the Gap Between <br />
          Students & Alumni
        </h1>

        <p className="text-gray-300 text-base sm:text-lg md:text-xl mt-6 max-w-2xl leading-relaxed">
          Join ReUnion to connect with your university community, find mentors,
          explore job opportunities, and stay updated with the latest events.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            href="/signup"
            className="px-8 py-3 sm:py-4 rounded-full bg-white text-gray-900 font-semibold text-base 
            hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.3)]
            transition-all duration-300 hover:scale-105"
          >
            Get Started
          </Link>

          <Link
            href="#features"
            className="px-8 py-3 sm:py-4 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 
            text-white font-semibold text-base transition-all duration-300 hover:scale-105"
          >
            Learn More
          </Link>
        </div>
         <GlowDivider color="via-gray-300"/>
      </div>
     
    </section>
  );
}
