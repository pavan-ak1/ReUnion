"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import Header from "@/components/Header";
import Aurora from "@/components/Aurora";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { addNotification } from "@/lib/notificationUtils";

export default function StudentJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const [allJobs, applied] = await Promise.all([
          api.get("/jobs"),
          api.get("/student/jobs/applied"),
        ]);
        setJobs(allJobs.data.data || allJobs.data);
        setAppliedJobs((applied.data.data || applied.data).map((j: any) => j.job_id));
      } catch {
        toast.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleApply = async (jobId: number) => {
    try {
      await api.post("/student/jobs/apply", { job_id: jobId });

      toast.success("Successfully applied for the job!");
      setAppliedJobs((prev) => [...prev, jobId]);
      
      // Notify alumni about new job application
      addNotification(
        "New Job Application",
        "A student has applied for your posted job. Check your job applications to review.",
        "alumni"
      );

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not apply for the job.");
    }
  };

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
            Available Jobs
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Explore the latest job postings and apply to kickstart your career.
          </p>

          <Link
            href="/student/jobs/applied"
            className="inline-block px-6 py-2 border border-white/20 rounded-md text-sm text-white hover:bg-white hover:text-black transition-all duration-200"
          >
            View My Applications →
          </Link>
        </div>

        {/* === Jobs List === */}
        {jobs.length > 0 ? (
          <div className="space-y-10">
            {jobs.map((job) => (
              <div
                key={job.job_id}
                className="border-t border-white/10 pt-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-1">
                      {job.job_title}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {job.company} • {job.location || "—"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleApply(job.job_id)}
                    disabled={appliedJobs.includes(job.job_id)}
                    className={`mt-4 sm:mt-0 px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 border ${
                      appliedJobs.includes(job.job_id)
                        ? "border-gray-600 text-gray-400 cursor-not-allowed"
                        : "border-white/20 text-white hover:bg-white hover:text-black"
                    }`}
                  >
                    {appliedJobs.includes(job.job_id)
                      ? "Applied"
                      : "Apply"}
                  </button>
                </div>

                {job.job_description && (
                  <p className="text-gray-300 mt-4 leading-relaxed max-w-3xl">
                    {job.job_description.length > 200
                      ? `${job.job_description.slice(0, 200)}...`
                      : job.job_description}
                  </p>
                )}

                <p className="text-xs text-gray-400 mt-3">
                  Deadline:{" "}
                  {job.application_deadline
                    ? new Date(job.application_deadline).toDateString()
                    : "Not specified"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-20 text-lg">
            No job listings available at the moment.
          </p>
        )}
      </main>

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}
