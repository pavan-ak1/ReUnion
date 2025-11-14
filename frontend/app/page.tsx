"use client";
import Link from "next/link";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen text-white">
      <main className="grow">
        <Header showAuth/>
        <Hero />
        

        <FeaturesSection />
        <section
  className="relative py-24 text-center overflow-hidden 
  bg-linear-to-b from-[#050505] via-[#0a0a0a] to-[#000000]"
>
  {/* Background glow / accent lines */}
  <div className="absolute inset-0 -z-10 opacity-40">
    <div className="absolute top-1/2 left-1/2 w-[80vw] h-[80vw] bg-linear-to-tr from-blue-600 via-cyan-400 to-purple-600 blur-[160px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
  </div>

  <div className="relative z-10 max-w-3xl mx-auto px-6">
    <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
      Ready to Join Your University Community?
    </h2>

    <p className="text-gray-300 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
      Reconnect. Learn. Grow. Step into the ReUnion network today and bridge the gap between ambition and opportunity.
    </p>

    <Link
      href="/signup"
      className="px-8 py-3 sm:py-4 rounded-full bg-white text-gray-900 font-semibold text-base 
            hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.3)]
            transition-all duration-300 hover:scale-105"
    >
      Get Started
    </Link>
  </div>
</section>
<Footer />
      </main>
      
    
    </div>
  );
}
