"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Header from "@/components/Header"; // Changed to match previous
import Aurora from "@/components/Aurora"; // Added from previous
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify"; // Added from previous
import "react-toastify/dist/ReactToastify.css"; // Added from previous

// Define a type for your event for better safety
interface Event {
  event_id: number;
  event_name: string;
  date: string;
  location: string;
}

export default function AlumniEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/alumni/events");
        setEvents(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching events:", err);
        toast.error("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleDelete = async (eventId: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/alumni/events/${eventId}/delete`);
      setEvents((prev) => prev.filter((e) => e.event_id !== eventId));
      toast.success("Event deleted successfully!");
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error("Failed to delete event.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0B0B0B] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen  text-white overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
        <Aurora
          colorStops={["#3A29FF", "#6A5AE0", "#2563eb", "#c51616"]}
          blend={0.75}
          amplitude={1.5}
          speed={0.2}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0B]/60 to-[#0B0B0B]" />
      </div>

      {/* Header */}
      <Header
        logoText="ReUnion Alumni"
        accent="from-violet-400 to-blue-500"
        dashboardLinks
      />

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-24 sm:py-32 space-y-16">
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-white">
            Your Events
          </h1>
          <p className="text-gray-400 text-sm">
            View, create, and manage all your events.
          </p>
        </div>

        {/* Events List Section */}
        <section className="border-t border-white/10 pt-8">
          <div className="flex justify-end mb-6">
            <Link
              href="/alumni/events/create"
              className="px-5 py-2 bg-white text-gray-900 font-semibold rounded-md hover:bg-gray-100 border border-white/20 transition-colors duration-200"
            >
              + Create Event
            </Link>
          </div>

          {events.length > 0 ? (
            <ul className="space-y-4">
              {events.map((event) => (
                <li
                  key={event.event_id}
                  className="flex justify-between items-center border-b border-white/10 py-4"
                >
                  <div>
                    <p className="font-medium text-white text-lg">
                      {event.event_name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {event.date} · {event.location}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm font-medium">
                    <Link
                      href={`/alumni/events/${event.event_id}/edit`}
                      className="text-cyan-400 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(event.event_id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic text-center py-8">
              No events created yet.
            </p>
          )}
        </section>
      </main>

      <ToastContainer position="bottom-right" autoClose={2000} theme="dark" />
    </div>
  );
}