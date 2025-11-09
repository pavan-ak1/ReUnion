"use client";
import { useEffect, useState } from "react";
import { getUserName } from "@/lib/auth";
import api from "@/lib/api";
import Link from "next/link";
import StudentHeader from "@/components/StudentHeader";

export default function StudentDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  const name = getUserName();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, jobsRes, requestsRes] = await Promise.all([
  api.get("/events"),                            // ✅ public, works
  api.get("/jobs"),                      // ✅ verifyStudent protected
  api.get("/mentorship/requests"),       // ✅ verifyStudent protected
]);



        setEvents(eventsRes.data.data || []);
        setJobs(jobsRes.data.data || []);
        const pending = (requestsRes.data.data || []).filter(
          (r: any) => r.status === "Pending"
        ).length;
        setPendingRequests(pending);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />

      {/* Welcome header */}
      <div className="p-6 bg-white shadow flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">Welcome, {name}</h1>
        <span className="text-gray-600 text-sm">
          Here’s your university network at a glance.
        </span>
      </div>

      {/* Dashboard grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Events */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3 text-blue-600">
            Upcoming Events
          </h2>
          {events.length > 0 ? (
            events.slice(0, 3).map((event) => (
              <div key={event.event_id} className="border-b py-2">
                <p className="font-medium">{event.event_name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(event.date).toDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No events available</p>
          )}
          <Link
            href="/student/events"
            className="text-blue-600 underline mt-3 block hover:text-blue-800"
          >
            → View All Events
          </Link>
        </div>

        {/* Jobs */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3 text-green-600">
            Available Jobs
          </h2>
          {jobs.length > 0 ? (
            jobs.slice(0, 3).map((job) => (
              <div key={job.job_id} className="border-b py-2">
                <p className="font-medium">{job.job_title}</p>
                <p className="text-sm text-gray-600">{job.company}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No jobs available</p>
          )}
          <Link
            href="/student/jobs"
            className="text-green-600 underline mt-3 block hover:text-green-800"
          >
            → Explore Jobs
          </Link>
        </div>

        {/* Mentorship */}
        <div className="bg-white p-4 rounded-xl shadow relative">
          <h2 className="text-lg font-semibold mb-3 text-purple-700">
            Mentorship
          </h2>
          <p className="text-gray-700 mb-2">
            Connect with alumni mentors for guidance.
          </p>
          <div className="space-y-1">
            <Link
              href="/student/mentorship/mentors"
              className="text-purple-600 underline block hover:text-purple-800"
            >
              Find Mentors
            </Link>
            <Link
              href="/student/mentorship/requests"
              className="text-purple-600 underline block hover:text-purple-800 relative"
            >
              View My Requests →
              {pendingRequests > 0 && (
                <span className="absolute ml-2 bg-red-500 text-white text-xs px-1.5 rounded">
                  {pendingRequests}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
