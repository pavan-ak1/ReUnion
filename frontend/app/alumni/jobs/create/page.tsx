"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import AlumniHeader from "@/components/AlumniHeader";

export default function CreateJobPage() {
  const [form, setForm] = useState({
    job_title: "",
    company: "",
    job_description: "",
    location: "",
    employment_type: "",
    application_deadline: "",
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/alumni/jobs/create", form);
      alert("Job posted successfully");
      router.push("/alumni/jobs");
    } catch (err) {
      console.error("Error creating job:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AlumniHeader />
      <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-4 text-green-700">
          Post New Job
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="job_title"
            placeholder="Job Title"
            value={form.job_title}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
          <input
            type="text"
            name="company"
            placeholder="Company"
            value={form.company}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
          <textarea
            name="job_description"
            placeholder="Job Description"
            value={form.job_description}
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
          <input
            type="text"
            name="employment_type"
            placeholder="Employment Type (Full-time / Internship)"
            value={form.employment_type}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          <input
            type="date"
            name="application_deadline"
            value={form.application_deadline}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Post Job
          </button>
        </form>
      </div>
    </div>
  );
}
