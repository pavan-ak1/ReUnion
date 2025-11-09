"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import AlumniHeader from "@/components/AlumniHeader";
import { useRouter } from "next/navigation";

export default function SetupMentorshipPage() {
  const [form, setForm] = useState({
    expertise: "",
    availability: true,
    max_mentees: 5,
  });
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/alumni/mentorship/profile");
        const data = res.data.data || res.data;
        if (data) setForm(data);
      } catch {}
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleToggle = () => {
    setForm({ ...form, availability: !form.availability });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/alumni/mentorship/setup", form);
      alert("Mentorship profile saved successfully");
      router.push("/alumni/mentorship/profile");
    } catch (err) {
      console.error("Error saving mentorship profile:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AlumniHeader />
      <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-4 text-purple-700">
          Setup Mentorship Profile
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            name="expertise"
            placeholder="Describe your areas of expertise"
            value={form.expertise}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.availability}
              onChange={handleToggle}
            />
            <label>Available for mentorship</label>
          </div>
          <input
            type="number"
            name="max_mentees"
            placeholder="Max number of mentees"
            value={form.max_mentees}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}
