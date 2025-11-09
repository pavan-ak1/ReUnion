"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function StudentJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs");
        setJobs(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleApply = async (jobId: number) => {
    try {
      await api.post("/student/jobs/apply", { job_id: jobId });
      alert("Successfully applied for the job!");
    } catch (err: any) {
      console.error("Error applying for job:", err);
      alert(err.response?.data?.message || "Could not apply for the job.");
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading jobs...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 bg-white shadow flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-700">💼 Available Jobs</h1>
        <Link href="/student/jobs/applied" className="text-green-600 underline">
          My Applications →
        </Link>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.job_id} className="bg-white p-4 rounded-xl shadow">
              <h3 className="text-lg font-semibold text-green-700">
                {job.job_title}
              </h3>
              <p className="text-gray-600 text-sm">{job.company}</p>
              <p className="text-gray-500 text-sm">{job.location}</p>
              <p className="mt-2 text-gray-700 text-sm">
                {job.job_description?.slice(0, 100)}...
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Deadline:{" "}
                {job.application_deadline
                  ? new Date(job.application_deadline).toDateString()
                  : "N/A"}
              </p>
              <button
                onClick={() => handleApply(job.job_id)}
                className="bg-green-600 text-white px-4 py-1.5 rounded mt-3 hover:bg-green-700 transition"
              >
                Apply
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">No job listings available</p>
        )}
      </div>
    </div>
  );
}
