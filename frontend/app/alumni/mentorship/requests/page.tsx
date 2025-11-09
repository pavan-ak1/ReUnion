"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AlumniHeader from "@/components/AlumniHeader";

export default function MentorshipRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get("/alumni/mentorship/requests");
        setRequests(res.data.data || res.data || []);
      } catch (err) {
        console.error("Error fetching requests:", err);
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
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) return <p className="p-6">Loading requests...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AlumniHeader />
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4 text-purple-700">
          Mentorship Requests
        </h1>

        {requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.request_id}
                className="bg-white p-4 rounded shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{req.student_name}</p>
                  <p className="text-sm text-gray-600">{req.student_email}</p>
                  <p className="text-sm">
                    Status: <span className="font-medium">{req.status}</span>
                  </p>
                </div>
                {req.status === "Pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(req.request_id, "Accepted")}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusChange(req.request_id, "Rejected")}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No mentorship requests yet.</p>
        )}
      </div>
    </div>
  );
}
