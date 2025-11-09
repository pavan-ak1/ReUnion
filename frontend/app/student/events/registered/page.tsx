"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function RegisteredEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistered = async () => {
      try {
        const res = await api.get("/student/events");
        setEvents(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching registered events:", err);
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
      alert("Event unregistered successfully");
    } catch (err) {
      console.error(err);
      alert("Unable to unregister from event.");
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading your events...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 bg-white shadow flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">🗓️ My Events</h1>
        <a href="/student/events" className="text-blue-600 underline">
          Browse All Events →
        </a>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.event_id} className="bg-white p-4 rounded-xl shadow">
              <h3 className="text-lg font-semibold text-blue-700">
                {event.event_name}
              </h3>
              <p className="text-gray-500 text-sm mb-2">
                {new Date(event.date).toDateString()}
              </p>
              <button
                onClick={() => handleUnregister(event.event_id)}
                className="bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700 transition"
              >
                Unregister
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">You haven’t registered for any events yet.</p>
        )}
      </div>
    </div>
  );
}
