"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Header from "@/components/Header";
import Aurora from "@/components/Aurora";

export default function MentorProfileView() {
  const { mentorId } = useParams();
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/student/mentorship/mentors/${mentorId}`);
        setMentor(res.data.data);
      } catch (error) {
        console.error("Error fetching mentor profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [mentorId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#0B0B0B] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );

  if (!mentor)
    return (
      <div className="text-center text-gray-400 mt-20">
        Mentor profile not found.
      </div>
    );

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
        <Aurora
          colorStops={["#2563eb", "#6A5AE0", "#b5aada", "#FFFFFF"]}
          blend={0.85}
          amplitude={1.3}
          speed={0.3}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0B]/60 to-[#0B0B0B]" />
      </div>

      {/* Header */}
      <Header
        logoText="ReUnion Student"
        accent="from-cyan-400 to-blue-500"
        dashboardLinks
      />

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-28 sm:py-36 text-center">
        {/* TITLE */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold mb-12">
          {mentor.name}
        </h1>

        {/* PROFILE DETAILS */}
        <div className="max-w-xl mx-auto text-left border-t border-white/20">
          <ProfileRow label="Email" value={mentor.email} />
          <ProfileRow label="Degree" value={mentor.degree} />
          <ProfileRow label="Department" value={mentor.department} />
          <ProfileRow label="Expertise" value={mentor.expertise} />
          <ProfileRow
            label="Current Position"
            value={
              mentor.current_position && mentor.company
                ? `${mentor.current_position} @ ${mentor.company}`
                : mentor.current_position
            }
          />
          <ProfileRow label="Location" value={mentor.location} />
          <ProfileRow
            label="Availability"
            value={mentor.availability ? "Available" : "Unavailable"}
          />
        </div>
      </main>
    </div>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  if (!value) return null;

  return (
    <div className="flex justify-between items-center py-5 border-b border-white/20">
      <span className="text-gray-400 text-sm capitalize">{label}</span>
      <span className="text-white text-base font-medium text-right">
        {value}
      </span>
    </div>
  );
}
