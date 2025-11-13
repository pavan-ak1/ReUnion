"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Header from "@/components/Header";
import Aurora from "@/components/Aurora";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RegisteredEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistered = async () => {
      try {
        const res = await api.get("/student/events");
        setEvents(res.data.data || res.data);
      } catch (err) {
        toast.error("Failed to load registered events");
      } finally {
        setLoading(false);
      }
    };
    fetchRegistered();
  }, []);

  const handleUnregister = async (eventId: number) => {
    try {
      await api.delete(`/student/events/unregister/${eventId}`);
      setEvents((prev) => prev.filter((e) => e.event_id !== eventId));
      toast.success("Event unregistered successfully");
    } catch (err) {
      toast.error("Unable to unregister from event");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#0B0B0B] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
      </div>
    );

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* === Aurora Background === */}
      <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
        <Aurora
          colorStops={["#3A29FF", "#6A5AE0", "#2563eb", "#c51616"]}
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
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-24 sm:py-32">
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4">
            My Registered Events
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Here are all the events you’ve registered for.
          </p>

          <a
            href="/student/events"
            className="inline-block px-6 py-2 border border-white/20 rounded-md text-sm text-white hover:bg-white hover:text-black transition-all duration-200"
          >
            Browse All Events →
          </a>
        </div>

        {/* === Events List === */}
        {events.length > 0 ? (
          <div className="space-y-10">
            {events.map((event) => (
              <div
                key={event.event_id}
                className="border-t border-white/10 pt-6 text-left"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-1">
                      {event.event_name}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {new Date(event.date).toDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleUnregister(event.event_id)}
                    className="mt-4 sm:mt-0 px-5 py-2 border border-red-400 text-red-400 rounded-md hover:bg-red-500 hover:text-white transition-all duration-200"
                  >
                    Unregister
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-20 text-lg">
            You haven’t registered for any events yet.
          </p>
        )}
      </main>

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}
