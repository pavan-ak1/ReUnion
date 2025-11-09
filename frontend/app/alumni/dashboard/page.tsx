"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import AlumniHeader from "@/components/AlumniHeader";

export default function AlumniDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [e, j] = await Promise.all([
          api.get("/alumni/events"),
          api.get("/alumni/jobs"),
        ]);
        setEvents(e.data.data || []);
        setJobs(j.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AlumniHeader />

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Events Section */}
<div className="bg-white p-4 rounded-xl shadow">
  <h2 className="text-lg font-semibold mb-2 text-blue-600">
    Your Events
  </h2>

  {events.length > 0 ? (
    events.map((event) => (
      <Link
        key={event.event_id}
        href={`/alumni/events/${event.event_id}/edit`}
        className="block border-b py-2 hover:bg-gray-50 rounded transition"
      >
        <p className="font-medium">{event.event_name}</p>
        <p className="text-sm text-gray-600">{event.date}</p>
      </Link>
    ))
  ) : (
    <p className="text-gray-500">No events created yet</p>
  )}

  <div className="mt-2 space-y-1">
    <Link
      href="/alumni/events/create"
      className="text-blue-600 underline block"
    >
      + Create Event
    </Link>
    <Link
      href="/alumni/events"
      className="text-gray-600 underline block"
    >
      View All Events →
    </Link>
  </div>
</div>


        
        {/* Jobs Section */}
<div className="bg-white p-4 rounded-xl shadow">
  <h2 className="text-lg font-semibold mb-2 text-green-600">Your Jobs</h2>

  {jobs.length > 0 ? (
    jobs.map((job) => (
      <div
        key={job.job_id}
        className="border-b py-2 hover:bg-gray-50 rounded transition"
      >
        <p className="font-medium">{job.job_title}</p>
        <p className="text-sm text-gray-600">
          {job.company} · {job.location}
        </p>
        <div className="flex gap-3 mt-1">
          <Link
            href={`/alumni/jobs/${job.job_id}/applications`}
            className="text-blue-600 underline text-sm"
          >
            View Applicants
          </Link>
        </div>
      </div>
    ))
  ) : (
    <p className="text-gray-500">No job posts yet</p>
  )}

  <div className="mt-2 space-y-1">
    <Link
      href="/alumni/jobs/create"
      className="text-green-600 underline block"
    >
      + Post Job
    </Link>
    <Link
      href="/alumni/jobs"
      className="text-gray-600 underline block"
    >
      View All Jobs →
    </Link>
  </div>
</div>
    {/* Mentorship Section */}
<div className="bg-white p-4 rounded-xl shadow">
  <h2 className="text-lg font-semibold mb-2 text-purple-700">
    Mentorship
  </h2>

  <p className="text-gray-700 mb-2">
    Manage your mentorship profile and review student requests.
  </p>

  <div className="space-y-1">
    <Link
      href="/alumni/mentorship/profile"
      className="text-purple-600 underline block"
    >
      View Profile
    </Link>
    <Link
      href="/alumni/mentorship/setup"
      className="text-purple-600 underline block"
    >
      Setup / Edit Profile
    </Link>
    <Link
      href="/alumni/mentorship/requests"
      className="text-purple-600 underline block"
    >
      View Mentorship Requests →
    </Link>
  </div>
</div>

      </div>
    </div>
  );
}
