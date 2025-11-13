"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Header from "@/components/Header"; // Changed from AlumniHeader
import Aurora from "@/components/Aurora"; // Added
import { toast, ToastContainer } from "react-toastify"; // Added
import "react-toastify/dist/ReactToastify.css"; // Added

// Define a type for your request
interface Request {
  request_id: number;
  student_name: string;
  student_email: string;
  status: string;
}

export default function MentorshipRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get("/alumni/mentorship/requests");
        setRequests(res.data.data || res.data || []);
      } catch (err) {
        console.error("Error fetching requests:", err);
        toast.error("Failed to load requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleStatusChange = async (requestId: number, status: string) => {
    try {
      await api.put(`/alumni/mentorship/request/${requestId}/status`, { status });
      setRequests((prev) =>
        prev.map((r) =>
          r.request_id === requestId ? { ...r, status } : r
        )
      );
      toast.success(`Request ${status.toLowerCase()}!`);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0B0B0B] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
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
            Mentorship Requests
          </h1>
          <p className="text-gray-400 text-sm">
            Review and respond to pending requests from students.
          </p>
        </div>

        {/* Requests List Section */}
        <section className="border-t border-white/10 pt-8">
          {requests.length > 0 ? (
            <ul className="space-y-4">
              {requests.map((req) => (
                <li
                  key={req.request_id}
                  className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 py-4"
                >
                  <div>
                    <p className="font-semibold text-white text-lg">
                      {req.student_name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {req.student_email}
                    </p>
                    <p
                      className={`text-sm font-medium mt-1 ${
                        req.status === "Accepted"
                          ? "text-green-400"
                          : req.status === "Rejected"
                          ? "text-red-500"
                          : "text-yellow-400"
                      }`}
                    >
                      Status: {req.status}
                    </p>
                  </div>
                  {req.status === "Pending" && (
                    <div className="flex gap-3 flex-shrink-0">
                      <button
                        onClick={() =>
                          handleStatusChange(req.request_id, "Accepted")
                        }
                        className="px-4 py-2 rounded-lg font-semibold text-sm text-green-400 bg-transparent border border-green-500/50 hover:bg-green-500/20 hover:border-green-500/80 transition-all duration-200"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(req.request_id, "Rejected")
                        }
                        className="px-4 py-2 rounded-lg font-semibold text-sm text-red-400 bg-transparent border border-red-500/50 hover:bg-red-500/20 hover:border-red-500/80 transition-all duration-200"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic text-center py-8">
              No mentorship requests yet.
            </p>
          )}
        </section>
      </main>

      <ToastContainer position="bottom-right" autoClose={2000} theme="dark" />
    </div>
  );
}