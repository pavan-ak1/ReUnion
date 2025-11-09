"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function AppliedJobsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get("/student/jobs/applied");
        setApplications(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching applied jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading) return <p className="p-6 text-gray-500">Loading your applications...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 bg-white shadow flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-700">🧾 My Applications</h1>
        <Link href="/student/jobs" className="text-green-600 underline">
          Browse More Jobs →
        </Link>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.length > 0 ? (
          applications.map((app) => (
            <div key={app.job_id} className="bg-white p-4 rounded-xl shadow">
              <h3 className="text-lg font-semibold text-green-700">
                {app.job_title}
              </h3>
              <p className="text-gray-600 text-sm">{app.company}</p>
              <p className="text-gray-500 text-sm mb-2">{app.location}</p>
              <p className="text-sm">
                Status:{" "}
                <span
                  className={
                    app.status === "Hired"
                      ? "text-green-600"
                      : app.status === "Rejected"
                      ? "text-red-600"
                      : app.status === "Shortlisted"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }
                >
                  {app.status}
                </span>
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">
            You haven’t applied for any jobs yet.
          </p>
        )}
      </div>
    </div>
  );
}
