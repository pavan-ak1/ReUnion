//available mentors
"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

export default function MentorsListPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await api.get("/student/mentorship/mentors");
        setMentors(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching mentors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const handleRequest = async (mentorId: number) => {
    try {
      await api.post("/student/mentorship/request", { mentor_id: mentorId });
      alert("Mentorship request sent successfully!");
    } catch (err: any) {
      console.error("Error sending request:", err);
      alert(err.response?.data?.message || "Unable to send request.");
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading mentors...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 bg-white shadow flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-700">🧑‍🏫 Available Mentors</h1>
        <Link href="/student/mentorship/requests" className="text-purple-600 underline">
          My Requests →
        </Link>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.length > 0 ? (
          mentors.map((mentor) => (
            <div key={mentor.mentor_id} className="bg-white p-4 rounded-xl shadow">
              <h3 className="text-lg font-semibold text-purple-700">
                {mentor.mentor_name}
              </h3>
              <p className="text-gray-600 text-sm mb-1">
                {mentor.degree} • {mentor.department}
              </p>
              <p className="text-gray-500 text-sm mb-2">
                {mentor.mentor_email}
              </p>
              <p className="text-gray-700 text-sm mb-3">
                Expertise: {mentor.expertise || "Not specified"}
              </p>
              <p
                className={`text-sm font-medium ${
                  mentor.availability ? "text-green-600" : "text-red-500"
                }`}
              >
                {mentor.availability ? "Available" : "Not Available"}
              </p>

              <button
                onClick={() => handleRequest(mentor.mentor_id)}
                className="bg-purple-600 text-white px-4 py-1.5 rounded mt-3 hover:bg-purple-700 transition"
                disabled={!mentor.availability}
              >
                Request Mentorship
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">No mentors available currently.</p>
        )}
      </div>
    </div>
  );
}
