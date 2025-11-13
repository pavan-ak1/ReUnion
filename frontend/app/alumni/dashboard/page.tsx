"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import Header from "@/components/Header";
import Aurora from "@/components/Aurora";

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
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* === Aurora Background === */}
      <div className="absolute inset-0 -z-10  bg-[#0B0B0B]">
        <Aurora
          colorStops={[
            "#5c615c", // indigo
            "#b5aada", // pink
            "#ffffff",
          ]}
          blend={0.85}
          amplitude={1.4}
          speed={0.25}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0B]/30 to-[#0B0B0B]" />
      </div>

      {/* === Universal Header === */}
      <Header logoText="ReUnion Alumni"
  accent="from-violet-400 to-blue-500"
  dashboardLinks />

      {/* === Dashboard Content === */}
     <main className="relative z-10 max-w-5xl mx-auto px-6 py-24 sm:py-32 space-y-16">
  {/* Page Title */}
  <div className="text-center">
    <h1 className="text-5xl sm:text-5xl font-bold mb-2 text-white">
      Alumni Dashboard
    </h1>
    <p className="text-gray-400 text-sm">
      Manage your activities, events, and mentorships at one place.
    </p>
  </div>

  {/* === Events Section === */}
  <section className="border-t border-white pt-8">
    <h2 className="text-3xl font-bold text-white mb-4">Your Events</h2>

    {events.length > 0 ? (
      <ul className="space-y-3">
        {events.map((event) => (
          <li
            key={event.event_id}
            className="flex justify-between items-center border-b border-white/10 pb-3"
          >
            <div>
              <p className="font-medium text-white">{event.event_name}</p>
              <p className="text-sm text-gray-400">{event.date}</p>
            </div>
            
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-400 italic">
        You haven’t created any events yet.
      </p>
    )}

    <div className="mt-4 text-sm space-x-4">
      <Link
        href="/alumni/events/create"
        className="text-cyan-400 hover:underline font-medium"
      >
        + Create Event
      </Link>
      <Link href="/alumni/events" className="text-gray-400 hover:underline">
        View All Events →
      </Link>
    </div>
  </section>

  {/* === Jobs Section === */}
  <section className="border-t border-white pt-8">
    <h2 className="text-3xl font-bold text-white mb-4">Your Job Postings</h2>

    {jobs.length > 0 ? (
      <ul className="space-y-3">
        {jobs.map((job) => (
          <li key={job.job_id} className="border-b border-white/10 pb-3">
            <p className="font-medium text-white">{job.job_title}</p>
            <p className="text-sm text-gray-400 mb-2">
              {job.company} · {job.location}
            </p>
            <Link
              href={`/alumni/jobs/${job.job_id}/applications`}
              className="text-green-400 hover:underline text-sm font-medium"
            >
              View Applicants
            </Link>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-400 italic">No job postings yet.</p>
    )}

    <div className="mt-4 text-sm space-x-4">
      <Link
        href="/alumni/jobs/create"
        className="text-green-400 hover:underline font-medium"
      >
        + Post Job
      </Link>
      <Link href="/alumni/jobs" className="text-gray-400 hover:underline">
        View All Jobs →
      </Link>
    </div>
  </section>

  {/* === Mentorship Section === */}
  <section className="border-t border-white pt-8 pb-10">
    <h2 className="text-3xl font-bold text-white mb-4">Mentorship</h2>

    <p className="text-gray-300 mb-6">
      Guide and connect with students looking for mentorship opportunities.
    </p>

    <div className="text-sm space-y-3">
      <Link
        href="/alumni/mentorship/profile"
        className="block text-purple-400 hover:underline font-medium"
      >
        View Profile
      </Link>
      <Link
        href="/alumni/mentorship/setup"
        className="block text-purple-400 hover:underline font-medium"
      >
        Setup / Edit Profile
      </Link>
      <Link
        href="/alumni/mentorship/requests"
        className="block text-purple-400 hover:underline font-medium"
      >
        View Mentorship Requests →
      </Link>
    </div>
  </section>
</main>
    </div>
  );
}
