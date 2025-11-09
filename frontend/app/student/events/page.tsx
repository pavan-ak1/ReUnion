"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import AlumniHeader from "@/components/AlumniHeader"; // Or create StudentHeader instead

export default function StudentEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events");
        setEvents(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleRegister = async (eventId: number) => {
    try {
      await api.post("/student/events/register", { event_id: eventId });
      alert("Successfully registered for the event!");
    } catch (err) {
      console.error(err);
      alert("Could not register for event.");
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading events...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 bg-white shadow flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">🎉 Events</h1>
        <a href="/student/events/registered" className="text-blue-600 underline">
          My Registered Events →
        </a>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.event_id} className="bg-white p-4 rounded-xl shadow">
              <h3 className="text-lg font-semibold text-blue-700">
                {event.event_name}
              </h3>
              <p className="text-gray-600 text-sm mb-2">{event.location}</p>
              <p className="text-gray-500 text-sm mb-2">
                {new Date(event.date).toDateString()}
              </p>
              <p className="text-gray-700 mb-3">{event.description}</p>
              <button
                onClick={() => handleRegister(event.event_id)}
                className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
              >
                Register
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">No events available</p>
        )}
      </div>
    </div>
  );
}
