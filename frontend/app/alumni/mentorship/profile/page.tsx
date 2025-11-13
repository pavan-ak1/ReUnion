"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Header from "@/components/Header"; // Changed from AlumniHeader
import Aurora from "@/components/Aurora"; // Added
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify"; // Added
import "react-toastify/dist/ReactToastify.css"; // Added

// Define a type for your profile
interface MentorProfile {
  expertise: string;
  availability: boolean;
  max_mentees: number;
}

export default function MentorProfilePage() {
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/alumni/mentorship/profile");
        setProfile(res.data.data || res.data || null);
      } catch (err) {
        console.error("Error loading mentor profile:", err);
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0B0B0B] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen  text-white overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
        <Aurora
          colorStops={["#6A5AE0", "#b5aada", "#a78bfa", "#8b5cf6"]}
          blend={0.75}
          amplitude={1.5}
          speed={0.2}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0B]/60 to-[#0B0B0B]" />
      </div>

      {/* Header */}
      <Header
        logoText="ReUnion Alumni"
        accent="from-violet-400 to-blue-500"
        dashboardLinks
      />

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-24 sm:py-32 space-y-16">
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-white">
            Mentorship Profile
          </h1>
          <p className="text-gray-400 text-sm">
            Manage your mentorship availability and expertise.
          </p>
        </div>

        {/* Profile Section */}
        <section className="border-t border-white/10 pt-8">
          {profile ? (
            <div className="max-w-xl mx-auto">
              <div className="text-left border-t border-white/20">
                <ProfileDetailRow
                  label="Expertise"
                  value={profile.expertise}
                />
                <ProfileDetailRow
                  label="Availability"
                  value={profile.availability ? "Available" : "Unavailable"}
                />
                <ProfileDetailRow
                  label="Max Mentees"
                  value={profile.max_mentees}
                />
              </div>

              <div className="mt-12 text-center">
                <Link
                  href="/alumni/mentorship/setup"
                  className="px-6 py-2 bg-white text-gray-900 font-semibold rounded-md hover:bg-gray-100 border border-white/20 transition-colors duration-200"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 italic mb-6">
                No mentorship profile found.
              </p>
              <Link
                href="/alumni/mentorship/setup"
                className="px-6 py-2 bg-white text-gray-900 font-semibold rounded-md hover:bg-gray-100 border border-white/20 transition-colors duration-200"
              >
                Create Profile
              </Link>
            </div>
          )}
        </section>
      </main>

      <ToastContainer position="bottom-right" autoClose={2000} theme="dark" />
    </div>
  );
}

/* === Profile Detail Row === */
function ProfileDetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  if (!value && value !== 0) return null; // Don't render empty fields (but allow 0)

  return (
    <div className="flex justify-between items-center py-5 border-b border-white/20">
      <span className="text-gray-400 text-sm capitalize">{label}</span>
      <span className="text-white text-base font-medium text-right">
        {value}
      </span>
    </div>
  );
}