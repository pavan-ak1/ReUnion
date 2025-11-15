"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import Header from "@/components/Header";
import Aurora from "@/components/Aurora";
import { toast, ToastContainer } from "react-toastify";
import { getCookie } from "@/lib/cookies";
import "react-toastify/dist/ReactToastify.css";

export default function StudentDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Get user data immediately on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const userString = getCookie("user");
      console.log('User cookie data:', userString);
      if (userString) {
        try {
          const userData = JSON.parse(userString);
          console.log('Parsed user data:', userData);
          setUser(userData);
          
          // Fetch user profile to get name
          try {
            const profileRes = await api.get('/profile');
            console.log('Profile data:', profileRes.data);
            if (profileRes.data?.data) {
              setUser((prev: any) => ({ ...prev, ...profileRes.data.data }));
            }
          } catch (profileError) {
            console.error('Error fetching profile:', profileError);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      } else {
        console.log('No user cookie found');
      }
    };
    
    fetchUserData();
  }, []);

  // Extract name from profile data
  const getDisplayName = () => {
    if (!user) return 'Student';
    
    // Try different name fields from profile
    return user.name || user.first_name || user.fullName || user.full_name || 
           user.firstName || user.display_name || user.displayName || 
           (user.email ? user.email.split('@')[0] : 'Student');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [e, j, r] = await Promise.all([
          api.get("/events"),
          api.get("/jobs"),
          api.get("/student/mentorship/requests"),
        ]);
        setEvents(e.data.data || []);
        setJobs(j.data.data || []);
        setRequests(r.data.data || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#0B0B0B] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* === Aurora Background === */}
      <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
        <Aurora
          colorStops={["#2563eb", "#6A5AE0", "#b5aada", "#FFFFFF"]}
          blend={0.85}
          amplitude={1.4}
          speed={0.25}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0B]/60 to-[#0B0B0B]" />
      </div>

      {/* === Header === */}
      <Header
        logoText="ReUnion Student"
        accent="from-cyan-400 to-blue-500"
        dashboardLinks
      />

      {/* === Main Content === */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-24 sm:py-32 space-y-16">
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-5xl sm:text-5xl font-bold mb-2 text-white">
            Hello {getDisplayName()}!
          </h1>
          <p className="text-gray-400 text-sm">
            Manage your events, job applications, and mentorship connections.
          </p>
        </div>

        {/* === Events Section === */}
        <section className="border-t border-white pt-8">
          <h2 className="text-3xl font-bold text-white mb-4">Upcoming Events</h2>

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
                      {event.location} • {new Date(event.date).toDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No upcoming events available.</p>
          )}

          <div className="mt-4 text-sm space-x-4">
            <Link
              href="/student/events"
              className="text-cyan-400 hover:underline font-medium"
            >
              View All Events →
            </Link>
            <Link
              href="/student/events/registered"
              className="text-gray-400 hover:underline"
            >
              My Registered Events →
            </Link>
          </div>
        </section>

        {/* === Jobs Section === */}
        <section className="border-t border-white pt-8">
          <h2 className="text-3xl font-bold text-white mb-4">Job Opportunities</h2>

          {jobs.length > 0 ? (
            <ul className="space-y-3">
              {jobs.slice(0, 3).map((job) => (
                <li key={job.job_id} className="border-b border-white/10 pb-3">
                  <p className="font-medium text-white">{job.job_title}</p>
                  <p className="text-sm text-gray-400 mb-2">
                    {job.company} · {job.location}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No jobs available.</p>
          )}

          <div className="mt-4 text-sm space-x-4">
            <Link
              href="/student/jobs"
              className="text-green-400 hover:underline font-medium"
            >
              Explore Jobs →
            </Link>
            <Link
              href="/student/jobs/applied"
              className="text-gray-400 hover:underline"
            >
              My Applications →
            </Link>
          </div>
        </section>

        {/* === Mentorship Section === */}
        <section className="border-t border-white pt-8 pb-10">
          <h2 className="text-3xl font-bold text-white mb-4">Mentorship</h2>

          {requests.length > 0 ? (
            <p className="text-gray-300 mb-4">
              You have{" "}
              <span className="font-semibold text-white">
                {requests.filter((r) => r.status === "Pending").length}
              </span>{" "}
              pending mentorship request
              {requests.filter((r) => r.status === "Pending").length !== 1 && "s"}.
            </p>
          ) : (
            <p className="text-gray-400 mb-4">
              Connect with alumni mentors for guidance and opportunities.
            </p>
          )}

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
