"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import Header from "@/components/Header";
import Aurora from "@/components/Aurora";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addNotification } from "@/lib/notificationUtils";

export default function AppliedJobsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/student/jobs/applied");
        const fetchedApps = res.data.data || res.data;
        setApplications(fetchedApps);

        // Check for status changes and notify student
        const notifiedApps = JSON.parse(localStorage.getItem("notified_job_applications") || "[]");
        const newNotifiedApps: number[] = [];

        fetchedApps.forEach((app: any) => {
          const appId = app.application_id || app.job_id;
          const wasNotified = notifiedApps.includes(appId);
          
          if (!wasNotified) {
            if (app.status === "Shortlisted") {
              addNotification(
                "Job Application Accepted! 🎉",
                `Congratulations! Your application for ${app.job_title || "the job"} at ${app.company || "the company"} has been shortlisted. The employer will contact you soon.`,
                "student"
              );
              newNotifiedApps.push(appId);
            } else if (app.status === "Rejected") {
              addNotification(
                "Job Application Update",
                `Your application for ${app.job_title || "the job"} at ${app.company || "the company"} has been reviewed. Keep applying to other opportunities!`,
                "student"
              );
              newNotifiedApps.push(appId);
            } else if (app.status === "Hired") {
              addNotification(
                "Congratulations! You've Been Hired! 🎉🎉",
                `Amazing news! You've been hired for ${app.job_title || "the job"} at ${app.company || "the company"}. Congratulations!`,
                "student"
              );
              newNotifiedApps.push(appId);
            }
          }
        });

        // Update notified applications list
        if (newNotifiedApps.length > 0) {
          localStorage.setItem("notified_job_applications", JSON.stringify([...notifiedApps, ...newNotifiedApps]));
        }
      } catch (err) {
        toast.error("Failed to load applied jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#0B0B0B] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
      </div>
    );

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* === Aurora Background === */}
      <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
        <Aurora
          colorStops={["#f1f2ca", "#f9ee71", "#f3e11b"]}
          blend={0.85}
          amplitude={1.4}
          speed={0.25}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0B]/60 to-[#0B0B0B]" />
      </div>

      {/* === Header === */}
      <Header
        logoText="ReUnion Student"
        accent="from-cyan-400 to-blue-500"
        dashboardLinks
      />

      {/* === Main Content === */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-24 sm:py-32">
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4">
            My Applications
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Track the status of your job applications.
          </p>

          <Link
            href="/student/jobs"
            className="inline-block px-6 py-2 border border-white/20 rounded-md text-sm text-white hover:bg-white hover:text-black transition-all duration-200"
          >
            Browse More Jobs →
          </Link>
        </div>

        {/* === Applications List === */}
        {applications.length > 0 ? (
          <div className="space-y-10">
            {applications.map((app) => (
              <div
                key={app.job_id}
                className="border-t border-white/10 pt-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-1">
                      {app.job_title}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {app.company} • {app.location || "—"}
                    </p>
                  </div>

                  <div
                    className={`mt-4 sm:mt-0 px-4 py-2 rounded-md text-sm font-semibold border ${
                      app.status === "Hired"
                        ? "border-green-400 text-green-400 bg-green-400/10"
                        : app.status === "Rejected"
                        ? "border-red-400 text-red-400 bg-red-400/10"
                        : app.status === "Shortlisted"
                        ? "border-blue-400 text-blue-400 bg-blue-400/10"
                        : "border-gray-500 text-gray-400 bg-gray-500/10"
                    }`}
                  >
                    {app.status || "Pending"}
                  </div>
                </div>

                {app.job_description && (
                  <p className="text-gray-300 mt-4 leading-relaxed max-w-3xl">
                    {app.job_description.length > 200
                      ? `${app.job_description.slice(0, 200)}...`
                      : app.job_description}
                  </p>
                )}

                {app.application_date && (
                  <p className="text-xs text-gray-400 mt-3">
                    Applied on:{" "}
                    {new Date(app.application_date).toDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-20 text-lg">
            You haven’t applied for any jobs yet.
          </p>
        )}
      </main>

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}
