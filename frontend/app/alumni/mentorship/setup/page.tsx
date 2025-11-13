"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import Header from "@/components/Header"; // Changed from AlumniHeader
import Aurora from "@/components/Aurora"; // Added
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify"; // Added
import "react-toastify/dist/ReactToastify.css"; // Added

export default function SetupMentorshipPage() {
  const [form, setForm] = useState({
    expertise: "",
    availability: true,
    max_mentees: 5,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/alumni/mentorship/profile");
        const data = res.data.data || res.data;
        if (data) setForm(data);
      } catch (err) {
        console.log("No existing profile found, creating new one.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleToggle = () => {
    setForm({ ...form, availability: !form.availability });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/alumni/mentorship/setup", form);
      toast.success("Mentorship profile saved!");
      router.push("/alumni/mentorship/profile");
    } catch (err) {
      console.error("Error saving mentorship profile:", err);
      toast.error("Failed to save profile.");
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
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
        <Aurora
          colorStops={["#6A5AE0", "#b5aada", "#a78bfa", "#8b5cf6"]}
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
          Setup Mentorship Profile
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormTextarea
            label="Areas of Expertise"
            name="expertise"
            placeholder="Describe your areas of expertise (e.g., Software Engineering, Product Management, Marketing)"
            value={form.expertise}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Max Mentees"
            type="number"
            name="max_mentees"
            value={form.max_mentees.toString()}
            onChange={handleChange}
          />
          <FormToggleSwitch
            label="Available for mentorship"
            checked={form.availability}
            onChange={handleToggle}
          />

          <div className="flex flex-col-reverse sm:flex-row justify-center gap-4 pt-8">
            <button
              type="button"
              onClick={() => router.push("/alumni/mentorship/profile")}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-md hover:bg-gray-100 border border-white/20 transition-colors duration-200"
            >
              Save Profile
            </button>
          </div>
        </form>
      </main>

      <ToastContainer position="bottom-right" autoClose={2000} theme="dark" />
    </div>
  );
}

/* === Form Toggle Switch === */
function FormToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/10 border border-white/10 rounded-md">
      <label className="text-sm text-gray-300">{label}</label>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
          checked ? "bg-cyan-500" : "bg-gray-600"
        }`}
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
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