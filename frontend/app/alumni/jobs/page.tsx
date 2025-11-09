"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import AlumniHeader from "@/components/AlumniHeader";

export default function AlumniJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/alumni/jobs");
        setJobs(res.data.data || res.data || []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleDelete = async (jobId: number) => {
    if (!confirm("Delete this job posting?")) return;
    try {
      await api.delete(`/alumni/jobs/${jobId}/delete`);
      setJobs((prev) => prev.filter((j) => j.job_id !== jobId));
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  if (loading) return <p className="p-6">Loading jobs...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AlumniHeader />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-green-700">Your Jobs</h1>
          <Link
            href="/alumni/jobs/create"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            + Post Job
          </Link>
        </div>

        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.job_id}
                className="bg-white p-4 rounded shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{job.job_title}</p>
                  <p className="text-sm text-gray-600">
                    {job.company} · {job.location}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/alumni/jobs/${job.job_id}/applications`}
                    className="text-blue-600 underline"
                  >
                    Applicants
                  </Link>
                  <button
                    onClick={() => handleDelete(job.job_id)}
                    className="text-red-600 underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No job posts yet.</p>
        )}
      </div>
    </div>
  );
}
