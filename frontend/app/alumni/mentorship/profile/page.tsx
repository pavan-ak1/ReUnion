"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AlumniHeader from "@/components/AlumniHeader";
import Link from "next/link";

export default function MentorProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/alumni/mentorship/profile");
        setProfile(res.data.data || res.data || null);
      } catch (err) {
        console.error("Error loading mentor profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AlumniHeader />
      <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-4 text-purple-700">
          Mentorship Profile
        </h1>

        {profile ? (
          <div className="space-y-2">
            <p><strong>Expertise:</strong> {profile.expertise}</p>
            <p><strong>Availability:</strong> {profile.availability ? "Available" : "Unavailable"}</p>
            <p><strong>Max Mentees:</strong> {profile.max_mentees}</p>

            <Link
              href="/alumni/mentorship/setup"
              className="bg-purple-600 text-white px-4 py-2 rounded mt-4 inline-block"
            >
              Edit Profile
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">No mentorship profile found.</p>
            <Link
              href="/alumni/mentorship/setup"
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              Create Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
