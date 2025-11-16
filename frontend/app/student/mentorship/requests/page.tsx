"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import Header from "@/components/Header";
import Aurora from "@/components/Aurora";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addNotification } from "@/lib/notificationUtils";

export default function StudentRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get("/student/mentorship/requests");
        const fetchedRequests = res.data.data || res.data;
        setRequests(fetchedRequests);

        // Check for status changes and notify student
        const notifiedRequests = JSON.parse(localStorage.getItem("notified_mentorship_requests") || "[]");
        const newNotifiedRequests: number[] = [];

        fetchedRequests.forEach((req: any) => {
          const reqId = req.request_id;
          const wasNotified = notifiedRequests.includes(reqId);
          
          if (!wasNotified) {
            if (req.status === "Accepted") {
              addNotification(
                "Mentorship Request Accepted! 🎉",
                `Great news! Your mentorship request to ${req.mentor_name || "the mentor"} has been accepted. Check your mentorship dashboard for details.`,
                "student"
              );
              newNotifiedRequests.push(reqId);
            } else if (req.status === "Rejected") {
              addNotification(
                "Mentorship Request Update",
                `Your mentorship request to ${req.mentor_name || "the mentor"} has been declined. Don't worry, you can apply to other mentors.`,
                "student"
              );
              newNotifiedRequests.push(reqId);
            }
          }
        });

        // Update notified requests list
        if (newNotifiedRequests.length > 0) {
          localStorage.setItem("notified_mentorship_requests", JSON.stringify([...notifiedRequests, ...newNotifiedRequests]));
        }
      } catch {
        toast.error("Failed to load mentorship requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

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
            My Mentorship Requests
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Track the status of your mentorship requests.
          </p>

          <Link
            href="/student/mentorship/mentors"
            className="inline-block px-6 py-2 border border-white/20 rounded-md text-sm text-white hover:bg-white hover:text-black transition-all duration-200"
          >
            Find More Mentors →
          </Link>
        </div>

        {/* === Requests List === */}
        {requests.length > 0 ? (
          <div className="space-y-10">
            {requests.map((req) => (
              <div
                key={req.request_id}
                className="border-t border-white/10 pt-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-white mb-1">
                        {req.mentor_name}
                      </h2>
                      <p className="text-gray-400 text-sm">{req.mentor_email}</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Requested on:{" "}
                        {new Date(req.requested_at).toDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <div
                        className={`px-4 py-2 rounded-md text-sm font-semibold border ${
                          req.status === "Accepted"
                            ? "border-green-400 text-green-400 bg-green-400/10"
                            : req.status === "Rejected"
                            ? "border-red-400 text-red-400 bg-red-400/10"
                            : "border-yellow-400 text-yellow-400 bg-yellow-400/10"
                        }`}
                      >
                        {req.status || "Pending"}
                      </div>

                      {req.status === "Accepted" && (
                        <Link
                          href={`/student/mentorship/mentors/${req.mentor_id}`}
                          className="px-4 py-2 rounded-md text-sm font-semibold text-blue-400 border border-blue-500/50 hover:bg-blue-500/20 transition-all duration-200"
                        >
                          View Profile
                        </Link>
                      )}
                    </div>
                  </div>

                {req.notes && (
                  <p className="text-gray-300 mt-4 leading-relaxed max-w-3xl">
                    Note: {req.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-20 text-lg">
            You haven’t sent any mentorship requests yet.
          </p>
        )}
      </main>

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}
