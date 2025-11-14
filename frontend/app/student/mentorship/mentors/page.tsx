"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import Header from "@/components/Header";
import Aurora from "@/components/Aurora";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addNotification } from "@/lib/notificationUtils";

export default function MentorsListPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedMentors, setRequestedMentors] = useState<number[]>([]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);

        // ✅ FETCH AVAILABLE MENTORS
        const mentorsRes = await api.get("/student/mentorship/mentors");
        setMentors(mentorsRes.data.data || mentorsRes.data || []);

        // ✅ FETCH STUDENT REQUESTS
        try {
          const reqRes = await api.get("/student/mentorship/requests");
          const alreadyRequested = (reqRes.data.data || []).map(
            (r: any) => r.mentor_id
          );
          setRequestedMentors(alreadyRequested);
        } catch {
          setRequestedMentors([]);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load mentors.");
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  // ✅ FIXED REQUEST SENDER — NO DOUBLE API PREFIX
  const handleRequest = async (mentorId: number) => {
    try {
      await api.post("/student/mentorship/request", { mentor_id: mentorId });

      toast.success("Mentorship request sent successfully!");

      setRequestedMentors((prev) => [...prev, mentorId]);
      
      // Notify alumni about new mentorship request
      addNotification(
        "New Mentorship Request",
        "A student has requested mentorship from you. Check your mentorship requests to review.",
        "alumni"
      );

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Request failed.");
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
      <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
        <Aurora
          colorStops={["#6A5AE0", "#b5aada", "#a78bfa", "#8b5cf6"]}
          blend={0.85}
          amplitude={1.4}
          speed={0.25}
        />
      </div>

      <Header logoText="ReUnion Student" accent="from-violet-400 to-purple-500" dashboardLinks />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-24 sm:py-32">
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4">Available Mentors</h1>
          <Link
            href="/student/mentorship/requests"
            className="inline-block px-6 py-2 border border-white/20 rounded-md"
          >
            My Requests →
          </Link>
        </div>

        {mentors.length > 0 ? (
          <div className="space-y-10">
            {mentors.map((mentor) => (
              <div key={mentor.mentor_id} className="border-t border-white/10 pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-1">
                      {mentor.mentor_name}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {mentor.degree} • {mentor.department}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">{mentor.mentor_email}</p>
                  </div>

                  <button
                    onClick={() => handleRequest(mentor.mentor_id)}
                    disabled={
                      requestedMentors.includes(mentor.mentor_id) ||
                      mentor.availability === false
                    }
                    className="px-5 py-2 border border-white/20 rounded-md"
                  >
                    {requestedMentors.includes(mentor.mentor_id)
                      ? "Requested"
                      : mentor.availability
                      ? "Request Mentorship"
                      : "Unavailable"}
                  </button>
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
