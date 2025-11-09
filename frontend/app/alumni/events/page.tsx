"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AlumniHeader from "@/components/AlumniHeader";
import Link from "next/link";

export default function AlumniEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/alumni/events");
        setEvents(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching events:", err);
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
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  if (loading) return <p className="p-6">Loading events...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AlumniHeader />

      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-blue-700">Your Events</h1>
          <Link
            href="/alumni/events/create"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Create Event
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.event_id}
                className="bg-white p-4 rounded shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{event.event_name}</p>
                  <p className="text-sm text-gray-600">
                    {event.date} · {event.location}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/alumni/events/${event.event_id}/edit`}
                    className="text-blue-600 underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(event.event_id)}
                    className="text-red-600 underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No events created yet.</p>
        )}
      </div>
    </div>
  );
}
