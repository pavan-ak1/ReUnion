"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import Header from "@/components/Header";
import Aurora from "@/components/Aurora";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addNotification } from "@/lib/notificationUtils";
import { ToastContainer } from "react-toastify";

export default function MentorsListPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false
  });

  // Stores { mentorId: "Pending" | "Accepted" | "Rejected" }
  const [mentorStatuses, setMentorStatuses] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchMentors = async (page = 1) => {
      try {
        setLoading(true);

        // Fetch mentors with pagination
        const mentorsRes = await api.get(`/student/mentorship/mentors?page=${page}&limit=${pagination.limit}`);
        const mentorsData = mentorsRes.data.data || mentorsRes.data || [];
        setMentors(mentorsData);
        
        // Set pagination data
        if (mentorsRes.data.pagination) {
          setPagination(mentorsRes.data.pagination);
        }

        // Fetch student requests
        try {
          const reqRes = await api.get("/student/mentorship/requests");

          const statusMap: Record<number, string> = {};
          (reqRes.data.data || []).forEach((r: any) => {
            statusMap[r.mentor_id] = r.status; // Pending | Accepted | Rejected
          });

          setMentorStatuses(statusMap);
        } catch {
          setMentorStatuses({});
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load mentors.");
      } finally {
        setLoading(false);
      }
    };

    fetchMentors(pagination.currentPage);
  }, [pagination.currentPage, pagination.limit]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleRequest = async (mentorId: number) => {
    try {
      await api.post("/student/mentorship/request", { mentor_id: mentorId });

      toast.success("Mentorship request sent successfully!");

      // Update local status immediately
      setMentorStatuses((prev) => ({
        ...prev,
        [mentorId]: "Pending",
      }));

      // Notify the alumni mentor
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
            {mentors.map((mentor) => {
              const status = mentorStatuses[mentor.mentor_id]; // Pending | Accepted | Rejected | undefined

              return (
                <div key={mentor.mentor_id} className="border-t border-white/10 pt-6">
                  <div className="flex justify-between items-center">
                    {/* Left Content */}
                    <div>
                      <h2 className="text-2xl font-semibold text-white mb-1">
                        {mentor.mentor_name}
                      </h2>
                      <p className="text-gray-400 text-sm">
                        {mentor.degree} • {mentor.department}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">{mentor.mentor_email}</p>
                    </div>

                    {/* Right Buttons */}
                    <div className="flex items-center">

                      {/* Request Button */}
                      <button
                        onClick={() => handleRequest(mentor.mentor_id)}
                        disabled={
                          status === "Pending" ||
                          status === "Accepted" ||
                          mentor.availability === false
                        }
                        className="px-5 py-2 border border-white/20 rounded-md"
                      >
                        {status === "Accepted"
                          ? "Accepted"
                          : status === "Pending"
                          ? "Requested"
                          : mentor.availability
                          ? "Request Mentorship"
                          : "Unavailable"}
                      </button>

                      {/* View Profile Button for Accepted Mentors */}
                      {status === "Accepted" && (
                        <Link
                          href={`/student/mentorship/mentors/${mentor.mentor_id}`}
                          className="ml-4 px-4 py-2 border border-cyan-400 text-cyan-400 rounded-md text-sm hover:bg-cyan-400 hover:text-black transition"
                        >
                          View Profile
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-20 text-lg">
            No mentors are available currently.
          </p>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 border border-white/20 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              Previous
            </button>

            <div className="flex gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${
                    pageNum === pagination.currentPage
                      ? "bg-purple-500 text-white"
                      : "border border-white/20 hover:bg-white/10"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2 border border-white/20 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </main>

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}
