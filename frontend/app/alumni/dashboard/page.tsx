"use client";
import { useEffect, useState } from "react";
import { getUserName } from "@/app/lib/auth";
import api from "@/app/lib/api";
import Link from "next/link";

export default function AlumniDashboard() {
  const [events, setEvents] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const e = await api.get("/alumni/events");
        const j = await api.get("/alumni/jobs");
        setEvents(e.data.data || []);
        setJobs(j.data.data || []);
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
        <h1 className="text-2xl font-bold text-blue-700">👩‍💼 Alumni Dashboard</h1>
        <span className="text-gray-700">Welcome, {name}</span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2 text-blue-600">Your Events</h2>
          {events.length > 0 ? (
            events.map((event: any) => (
              <div key={event.event_id} className="border-b py-2">
                <p className="font-medium">{event.event_name}</p>
                <p className="text-sm text-gray-600">{event.date}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No events created yet</p>
          )}
          <Link href="/alumni/events/create" className="text-blue-600 underline mt-2 block">
            + Create Event
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2 text-green-600">Your Jobs</h2>
          {jobs.length > 0 ? (
            jobs.map((job: any) => (
              <div key={job.job_id} className="border-b py-2">
                <p className="font-medium">{job.job_title}</p>
                <p className="text-sm text-gray-600">{job.company}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No job posts yet</p>
          )}
          <Link href="/alumni/jobs/create" className="text-green-600 underline mt-2 block">
            + Post Job
          </Link>
        </div>
      </div>
    </div>
  );
}
