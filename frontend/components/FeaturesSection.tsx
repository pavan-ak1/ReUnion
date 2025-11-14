"use client";

import CircularGallery from "@/components/CircularGallery";
import GlowDivider from "./GlowDivider";

export default function FeaturesSection() {
  const items = [
    {
      image: "https://static-www.adweek.com/wp-content/uploads/2019/05/gg-leverage-alumni-CONTENT-2019.jpg?q=80&w=800&auto=format",
      text: "Alumni Network",
    },
    {
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format",
      text: "Mentorship",
    },
    {
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format",
      text: "Job Opportunities",
    },
    {
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJm5oD5pEh2yb4MEeghSekPEW3kX-_dwn_3zjifM1k6QgQ-pqvJHXIAgV4uYWp0Dnm44E&usqp=CAU?q=80&w=800&auto=format",
      text: "Events",
    },
  ];

  return (
    <section
      id="features"
      className="relative flex flex-col items-center justify-center text-center py-28 overflow-hidden 
      bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#000000] text-white"
    >
      {/* Section Heading */}
      <div className="relative z-10 max-w-3xl px-6 mb-20">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 text-white">
          Everything You Need to Stay Connected
        </h2>
        <p className="text-gray-300 text-lg leading-relaxed">
          Discover the core features of ReUnion through an interactive 3D experience.
        </p>
      </div>

      {/* Circular Gallery */}
      <div className="relative z-0 w-full max-w-6xl h-[500px] sm:h-[600px] lg:h-[700px]">
        <CircularGallery
          items={items}
          bend={3}
          textColor="#ffffff"
          borderRadius={0.05}
          font="bold 28px Figtree"
          scrollSpeed={2}
          scrollEase={0.05}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50 pointer-events-none" />
        <GlowDivider color="via-gray-300" />
      </div>
      
    </section>
  );
}
