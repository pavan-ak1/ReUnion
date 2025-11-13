"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Header from "@/components/Header"; // Changed to match previous
import Aurora from "@/components/Aurora"; // Added from previous
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify"; // Added from previous
import "react-toastify/dist/ReactToastify.css"; // Added from previous

// Define a type for your job for better safety
interface Job {
  job_id: number;
  job_title: string;
  company: string;
  location: string;
}

export default function AlumniJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/alumni/jobs");
        setJobs(res.data.data || res.data || []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        toast.error("Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleDelete = async (jobId: number) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
      await api.delete(`/alumni/jobs/${jobId}/delete`);
      setJobs((prev) => prev.filter((j) => j.job_id !== jobId));
      toast.success("Job posting deleted!");
    } catch (err) {
      console.error("Error deleting job:", err);
      toast.error("Failed to delete job posting.");
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
    <div className="relative min-h-screen  text-white overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 -z-10bg-[#0B0B0B]">
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
            Your Job Postings
          </h1>
          <p className="text-gray-400 text-sm">
            View, create, and manage all your job postings.
          </p>
        </div>

        {/* Jobs List Section */}
        <section className="border-t border-white/10 pt-8">
          <div className="flex justify-end mb-6">
            <Link
              href="/alumni/jobs/create"
              className="px-5 py-2 bg-white text-gray-900 font-semibold rounded-md hover:bg-gray-100 border border-white/20 transition-colors duration-200"
            >
              + Post Job
            </Link>
          </div>

          {jobs.length > 0 ? (
            <ul className="space-y-4">
              {jobs.map((job) => (
                <li
                  key={job.job_id}
                  className="flex justify-between items-center border-b border-white/10 py-4"
                >
                  <div>
                    <p className="font-medium text-white text-lg">
                      {job.job_title}
                    </p>
                    <p className="text-sm text-gray-400">
                      {job.company} · {job.location}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm font-medium">
                    <Link
                      href={`/alumni/jobs/${job.job_id}/applications`}
                      className="text-green-400 hover:underline"
                    >
                      View Applicants
                    </Link>
                    <button
                      onClick={() => handleDelete(job.job_id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic text-center py-8">
              No job postings yet.
            </p>
          )}
        </section>
      </main>

      <ToastContainer position="bottom-right" autoClose={2000} theme="dark" />
    </div>
  );
}