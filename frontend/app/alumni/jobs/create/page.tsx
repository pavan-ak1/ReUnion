"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Header from "@/components/Header"; // Changed from AlumniHeader
import Aurora from "@/components/Aurora"; // Added
import { toast, ToastContainer } from "react-toastify"; // Added
import "react-toastify/dist/ReactToastify.css"; // Added

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/alumni/jobs/create", form);
      toast.success("Job posted successfully!");
      router.push("/alumni/jobs");
    } catch (err) {
      console.error("Error creating job:", err);
      toast.error("Failed to post job. Please check all fields.");
    }
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
        <Aurora
          colorStops={["#f1f2ca", "#f9ee71", "#f3e11b"]}
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
          Post New Job
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Job Title"
            name="job_title"
            placeholder="e.g. Software Engineer Intern"
            value={form.job_title}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Company"
            name="company"
            placeholder="e.g. Acme Inc."
            value={form.company}
            onChange={handleChange}
            required
          />
          <FormTextarea
            label="Job Description"
            name="job_description"
            placeholder="Details about the role, responsibilities, and qualifications..."
            value={form.job_description}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Location"
            name="location"
            placeholder="e.g. New York, NY or Remote"
            value={form.location}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Employment Type"
            name="employment_type"
            placeholder="e.g. Full-time, Part-time, Internship"
            value={form.employment_type}
            onChange={handleChange}
          />
          <FormInput
            label="Application Deadline"
            name="application_deadline"
            type="date"
            value={form.application_deadline}
            onChange={handleChange}
          />

          <div className="flex flex-col-reverse sm:flex-row justify-center gap-4 pt-8">
            <button
              type="button"
              onClick={() => router.push("/alumni/jobs")}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-md hover:bg-gray-100 border border-white/20 transition-colors duration-200"
            >
              Post Job
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
  label: string;
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