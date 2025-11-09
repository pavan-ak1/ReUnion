"use client";

import { useState } from "react";
import api from "@/lib/api";
import AlumniHeader from "@/components/AlumniHeader";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const [form, setForm] = useState({
    event_name: "",
    description: "",
    date: "",
    location: "",
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/alumni/events/create", form);
      alert("Event created successfully");
      router.push("/alumni/events");
    } catch (err) {
      console.error("Error creating event:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AlumniHeader />

      <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-4 text-blue-700">
          Create New Event
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="event_name"
            placeholder="Event Name"
            value={form.event_name}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
}
