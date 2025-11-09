"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import AlumniHeader from "@/components/AlumniHeader";

export default function JobApplicationsPage() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get(`/alumni/jobs/${jobId}/applications`);
        setApplications(res.data.data || res.data || []);
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [jobId]);

  const handleStatusChange = async (applicationId: number, status: string) => {
    try {
      await api.put(
        `/alumni/jobs/${jobId}/applications/${applicationId}/status`,
        { status }
      );
      setApplications((prev) =>
        prev.map((a) =>
          a.application_id === applicationId ? { ...a, status } : a
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) return <p className="p-6">Loading applications...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AlumniHeader />
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4 text-green-700">
          Applications for Job #{jobId}
        </h1>

        {applications.length > 0 ? (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.application_id}
                className="bg-white p-4 rounded shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{app.student_name}</p>
                  <p className="text-sm text-gray-600">{app.student_email}</p>
                  <p className="text-sm">Status: {app.status}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(app.application_id, "Shortlisted")}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleStatusChange(app.application_id, "Rejected")}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No applications yet.</p>
        )}
      </div>
    </div>
  );
}
