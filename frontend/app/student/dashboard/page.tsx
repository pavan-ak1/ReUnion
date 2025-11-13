"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import Header from "@/components/Header";
import Aurora from "@/components/Aurora";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function StudentDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [mentorships, setMentorships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [eventsRes, jobsRes, mentorshipRes] = await Promise.all([
          api.get("/events"),
          api.get("/jobs"),
          api.get("/mentorship/requests"),
        ]);
        setEvents(eventsRes.data.data || []);
        setJobs(jobsRes.data.data || []);
        setMentorships(mentorshipRes.data.data || []);
      } catch (err) {
        console.error("Error fetching student dashboard:", err);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0B0B0B] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* === Aurora Background === */}
      <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
        <Aurora
          colorStops={[
            "#2563eb", // blue
            "#b5aada", // soft violet
            "#ffffff", // white highlights
          ]}
          blend={0.85}
          amplitude={1.3}
          speed={0.25}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0B]/40 to-[#0B0B0B]" />
      </div>

      {/* === Header === */}
      <Header
        logoText="ReUnion Student"
        accent="from-cyan-400 to-blue-500"
        dashboardLinks
      />

      {/* === Dashboard Main === */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-24 sm:py-32 space-y-16">
        {/* === Title === */}
        <div className="text-center">
          <h1 className="text-5xl sm:text-5xl font-bold mb-2 text-white">
            Student Dashboard
          </h1>
          <p className="text-gray-400 text-sm">
            Stay updated with events, opportunities, and mentorships.
          </p>
        </div>

        {/* === Events Section === */}
        <section className="border-t border-white pt-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Upcoming Events
          </h2>

          {events.length > 0 ? (
            <ul className="space-y-3">
              {events.slice(0, 3).map((event) => (
                <li
                  key={event.event_id}
                  className="flex justify-between items-center border-b border-white/10 pb-3"
                >
                  <div>
                    <p className="font-medium text-white">{event.event_name}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(event.date).toDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No upcoming events found.</p>
          )}

          <div className="mt-4 text-sm space-x-4">
            <Link
              href="/student/events"
              className="text-cyan-400 hover:underline font-medium"
            >
              View All Events →
            </Link>
          </div>
        </section>

        {/* === Jobs Section === */}
        <section className="border-t border-white pt-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Job Opportunities
          </h2>

          {jobs.length > 0 ? (
            <ul className="space-y-3">
              {jobs.slice(0, 3).map((job) => (
                <li key={job.job_id} className="border-b border-white/10 pb-3">
                  <p className="font-medium text-white">{job.job_title}</p>
                  <p className="text-sm text-gray-400 mb-2">
                    {job.company} · {job.location}
                  </p>
                  <Link
                    href={`/student/jobs/${job.job_id}`}
                    className="text-green-400 hover:underline text-sm font-medium"
                  >
                    View Details →
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No job openings currently.</p>
          )}

          <div className="mt-4 text-sm space-x-4">
            <Link
              href="/student/jobs"
              className="text-green-400 hover:underline font-medium"
            >
              Explore All Jobs →
            </Link>
          </div>
        </section>

        {/* === Mentorship Section === */}
        <section className="border-t border-white pt-8 pb-10">
          <h2 className="text-3xl font-bold text-white mb-4">Mentorship</h2>

          <p className="text-gray-300 mb-6">
            Connect with alumni mentors to guide your academic and career path.
          </p>

          <div className="text-sm space-y-3">
            <Link
              href="/student/mentorship/mentors"
              className="block text-purple-400 hover:underline font-medium"
            >
              Find Mentors
            </Link>
            <Link
              href="/student/mentorship/requests"
              className="block text-purple-400 hover:underline font-medium"
            >
              View My Requests →
            </Link>
          </div>
        </section>
      </main>

      <ToastContainer position="bottom-right" autoClose={2000} theme="dark" />
    </div>
  );
}
