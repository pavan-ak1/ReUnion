"use client";
import { useEffect, useState } from "react";
import { getUserName } from "@/app/lib/auth";
import api from "@/app/lib/api";
import Link from "next/link";

export default function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsRes = await api.get("/events");
        const jobsRes = await api.get("/jobs");
        setEvents(eventsRes.data.data || []);
        setJobs(jobsRes.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const name = getUserName();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 bg-white shadow flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">🎓 Student Dashboard</h1>
        <span className="text-gray-700">Welcome, {name}</span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">Upcoming Events</h2>
          {events.length > 0 ? (
            events.map((event: any) => (
              <div key={event.event_id} className="border-b py-2">
                <p className="font-medium">{event.event_name}</p>
                <p className="text-sm text-gray-600">{event.date}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No events available</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2 text-green-600">Available Jobs</h2>
          {jobs.length > 0 ? (
            jobs.map((job: any) => (
              <div key={job.job_id} className="border-b py-2">
                <p className="font-medium">{job.job_title}</p>
                <p className="text-sm text-gray-600">{job.company}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No jobs found</p>
          )}
        </div>
      </div>

      <div className="p-6 text-center">
        <Link
          href="/student/mentorship"
          className="text-blue-600 underline hover:text-blue-800"
        >
          View Mentorship Opportunities →
        </Link>
      </div>
    </div>
  );
}
