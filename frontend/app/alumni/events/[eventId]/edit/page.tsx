"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Header from "@/components/Header"; // Changed from AlumniHeader
import Aurora from "@/components/Aurora"; // Added
import { toast, ToastContainer } from "react-toastify"; // Added
import "react-toastify/dist/ReactToastify.css"; // Added

// Define a type for your event
interface Event {
  event_id: number;
  event_name: string;
  description: string;
  date: string;
  location: string;
}

export default function EditEventPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return; // Don't fetch if eventId isn't available

    const fetchEvent = async () => {
      try {
        const res = await api.get(`/alumni/events`);
        const found = res.data.data?.find((e: any) => e.event_id == eventId);

        if (found) {
          // Format date for the <input type="date">
          found.date = found.date?.split("T")[0] || "";
          setEvent(found);
        } else {
          toast.error("Event not found.");
          router.push("/alumni/events");
        }
      } catch (err) {
        console.error("Error loading event:", err);
        toast.error("Failed to load event data.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!event) return;
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/alumni/events/${eventId}/update`, event);
      toast.success("Event updated successfully");
      router.push("/alumni/events");
    } catch (err) {
      console.error("Error updating event:", err);
      toast.error("Failed to update event.");
    }
  };

  if (loading || !event) {
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
      <main className="relative z-10 max-w-2xl mx-auto px-6 py-24 sm:py-32">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-10">
          Edit Event
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Event Name"
            name="event_name"
            value={event.event_name}
            onChange={handleChange}
            required
          />
          <FormTextarea
            label="Description"
            name="description"
            value={event.description}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Date"
            name="date"
            type="date"
            value={event.date}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Location"
            name="location"
            value={event.location}
            onChange={handleChange}
            required
          />

          <div className="flex flex-col-reverse sm:flex-row justify-center gap-4 pt-8">
            <button
              type="button"
              onClick={() => router.push("/alumni/events")}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-md hover:bg-gray-100 border border-white/20 transition-colors duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </main>

      <ToastContainer position="bottom-right" autoClose={2000} theme="dark" />
    </div>
  );
}

/* === Form Input Field === */
function FormInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-white/10 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
      />
    </div>
  );
}

/* === Form Textarea Field === */
function FormTextarea({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder = "",
}: {
  label:string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={4}
        className="w-full px-4 py-2 bg-white/10 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
      />
    </div>
  );
}