"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import AlumniHeader from "@/components/AlumniHeader";

export default function EditEventPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/alumni/events`);
        const found = res.data.data?.find((e: any) => e.event_id == eventId);
        setEvent(found);
      } catch (err) {
        console.error("Error loading event:", err);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/alumni/events/${eventId}/update`, event);
      alert("Event updated successfully");
      router.push("/alumni/events");
    } catch (err) {
      console.error("Error updating event:", err);
    }
  };

  if (!event) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AlumniHeader />
      <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-4 text-blue-700">
          Edit Event
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="event_name"
            value={event.event_name}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          <textarea
            name="description"
            value={event.description}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          <input
            type="date"
            name="date"
            value={event.date?.split("T")[0] || ""}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            name="location"
            value={event.location}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
