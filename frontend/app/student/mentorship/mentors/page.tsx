"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import Header from "@/components/Header";
import Aurora from "@/components/Aurora";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MentorsListPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedMentors, setRequestedMentors] = useState<number[]>([]);

  useEffect(() => {
    const fetchMentors = async () => {
  try {
    setLoading(true);
    
    // Fetch mentors first
    const mentorsRes = await api.get("/student/mentorship/mentors");
    console.log("Mentors response:", mentorsRes.data);
    setMentors(mentorsRes.data.data || mentorsRes.data || []);
    
    // Try to fetch requests, but don't fail if it doesn't exist
    try {
      const requestsRes = await api.get("/student/mentorship/requests");
      const requested = (requestsRes.data.data || requestsRes.data || []).map(
        (r: any) => r.mentor_id
      );
      setRequestedMentors(requested);
    } catch (requestsError) {
      console.warn("Could not load mentorship requests:", requestsError);
      setRequestedMentors([]); // Default to empty array if requests endpoint fails
    }
  } catch (err: any) {
    console.error("Error fetching mentors:", err);
    toast.error(err.response?.data?.message || "Failed to load mentors list");
  } finally {
    setLoading(false);
  }
};
    fetchMentors();
  }, []);

  const handleRequest = async (mentorId: number) => {
    try {
      await api.post("/api/v1/student/mentorship/request", { mentor_id: mentorId });
      toast.success("Mentorship request sent successfully!");
      setRequestedMentors((prev) => [...prev, mentorId]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Unable to send request.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#0B0B0B] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    );

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* === Aurora Background === */}
      <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
        <Aurora
          colorStops={["#6A5AE0", "#b5aada", "#a78bfa", "#8b5cf6"]}
          blend={0.85}
          amplitude={1.4}
          speed={0.25}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0B]/60 to-[#0B0B0B]" />
      </div>

      {/* === Header === */}
      <Header
        logoText="ReUnion Student"
        accent="from-violet-400 to-purple-500"
        dashboardLinks
      />

      {/* === Main Content === */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-24 sm:py-32">
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4">
            Available Mentors
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Connect with alumni mentors to receive guidance and advice.
          </p>

          <Link
            href="/student/mentorship/requests"
            className="inline-block px-6 py-2 border border-white/20 rounded-md text-sm text-white hover:bg-white hover:text-black transition-all duration-200"
          >
            My Requests →
          </Link>
        </div>

        {/* === Mentors List === */}
        {mentors.length > 0 ? (
          <div className="space-y-10">
            {mentors.map((mentor) => (
              <div
                key={mentor.mentor_id}
                className="border-t border-white/10 pt-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-1">
                      {mentor.mentor_name}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {mentor.degree} • {mentor.department}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {mentor.mentor_email}
                    </p>
                    <p className="text-gray-300 mt-3">
                      <span className="text-gray-400">Expertise:</span>{" "}
                      {mentor.expertise || "Not specified"}
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-0 flex flex-col items-end">
                    <span
                      className={`text-sm font-semibold mb-3 ${
                        mentor.availability
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {mentor.availability ? "Available" : "Not Available"}
                    </span>

                    <button
                      onClick={() => handleRequest(mentor.mentor_id)}
                      disabled={
                        !mentor.availability ||
                        requestedMentors.includes(mentor.mentor_id)
                      }
                      className={`px-5 py-2 rounded-md text-sm font-medium border transition-all duration-200 ${
                        !mentor.availability
                          ? "border-gray-700 text-gray-500 cursor-not-allowed"
                          : requestedMentors.includes(mentor.mentor_id)
                          ? "border-gray-500 text-gray-400 cursor-not-allowed"
                          : "border-white/20 text-white hover:bg-white hover:text-black"
                      }`}
                    >
                      {requestedMentors.includes(mentor.mentor_id)
                        ? "Requested"
                        : "Request Mentorship"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-20 text-lg">
            No mentors are available currently.
          </p>
        )}
      </main>

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}
