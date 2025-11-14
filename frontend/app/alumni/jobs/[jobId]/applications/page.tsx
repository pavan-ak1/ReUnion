"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import Header from "@/components/Header"; // Changed from AlumniHeader
import Aurora from "@/components/Aurora"; // Added
import { toast, ToastContainer } from "react-toastify"; // Added
import "react-toastify/dist/ReactToastify.css"; // Added
import { addNotification } from "@/lib/notificationUtils";

// Define a type for your application
interface Application {
  application_id: number;
  student_name: string;
  student_email: string;
  status: string;
}

export default function JobApplicationsPage() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    const fetchApplications = async () => {
      try {
        const res = await api.get(`/alumni/jobs/${jobId}/applications`);
        setApplications(res.data.data || res.data || []);
      } catch (err) {
        console.error("Error fetching applications:", err);
        toast.error("Failed to load applications.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [jobId]);

  const handleStatusChange = async (applicationId: number, status: string) => {
    try {
      const app = applications.find(a => a.application_id === applicationId);
      if (!app) return;

      await api.put(
        `/alumni/jobs/${jobId}/applications/${applicationId}/status`,
        { status }
      );
      setApplications((prev) =>
        prev.map((a) =>
          a.application_id === applicationId ? { ...a, status } : a
        )
      );

      // === LOCAL NOTIFICATION (Alumni side) ===
      if (status === "Shortlisted") {
        addNotification(
          "Application Shortlisted",
          `You shortlisted ${app.student_name}'s application for this job.`,
          "alumni"
        );
      } else if (status === "Rejected") {
        addNotification(
          "Application Rejected",
          `You rejected ${app.student_name}'s application for this job.`,
          "alumni"
        );
      }
      
      // Note: Student notifications will be generated when they view their applications

      toast.success(`Applicant ${status.toLowerCase()}!`);
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
          colorStops={["#f1f2ca", "#f9ee71", "#f3e11b"]}
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
            Job Applications
          </h1>
          <p className="text-gray-400 text-sm">
            Reviewing applications for Job #{jobId}
          </p>
        </div>

        {/* Applications List Section */}
        <section className="border-t border-white/10 pt-8">
          {applications.length > 0 ? (
            <ul className="space-y-4">
              {applications.map((app) => (
                <li
                  key={app.application_id}
                  className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 py-4"
                >
                  <div>
                    <p className="font-semibold text-white text-lg">
                      {app.student_name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {app.student_email}
                    </p>
                    <p
                      className={`text-sm font-medium mt-1 ${
                        app.status === "Shortlisted"
                          ? "text-green-400"
                          : app.status === "Rejected"
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      Status: {app.status}
                    </p>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <button
                      onClick={() =>
                        handleStatusChange(app.application_id, "Shortlisted")
                      }
                      className="px-4 py-2 rounded-lg font-semibold text-sm text-white bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all duration-200"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() =>
                        handleStatusChange(app.application_id, "Rejected")
                      }
                      className="px-4 py-2 rounded-lg font-semibold text-sm text-red-400 bg-transparent border border-red-500/50 hover:bg-red-500/20 hover:border-red-500/80 transition-all duration-200"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic text-center py-8">
              No applications received yet.
            </p>
          )}
        </section>
      </main>

      <ToastContainer position="bottom-right" autoClose={2000} theme="dark" />
    </div>
  );
}