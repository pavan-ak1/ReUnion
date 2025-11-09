//sent mentorship requests
"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function StudentRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get("/student/mentorship/requests");
        setRequests(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching mentorship requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) return <p className="p-6 text-gray-500">Loading requests...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 bg-white shadow flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-700">📬 My Mentorship Requests</h1>
        <Link href="/student/mentorship/mentors" className="text-purple-600 underline">
          Find More Mentors →
        </Link>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.length > 0 ? (
          requests.map((req) => (
            <div key={req.request_id} className="bg-white p-4 rounded-xl shadow">
              <h3 className="text-lg font-semibold text-purple-700">
                {req.mentor_name}
              </h3>
              <p className="text-gray-600 text-sm">{req.mentor_email}</p>
              <p className="text-gray-500 text-sm mt-1">
                Requested: {new Date(req.requested_at).toDateString()}
              </p>
              <p className="text-sm mt-2">
                Status:{" "}
                <span
                  className={
                    req.status === "Accepted"
                      ? "text-green-600"
                      : req.status === "Rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }
                >
                  {req.status}
                </span>
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">
            You haven’t sent any mentorship requests yet.
          </p>
        )}
      </div>
    </div>
  );
}
