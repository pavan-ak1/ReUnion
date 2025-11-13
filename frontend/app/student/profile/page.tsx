"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Aurora from "@/components/Aurora";
import Header from "@/components/Header";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface StudentProfile {
  name: string;
  email: string;
  phone?: string;
  enrollment_year?: number;
  degree?: string;
  department?: string;
  expected_graduation?: string;
  created_at?: string;
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      setProfile(res.data.data || res.data);
    } catch (err) {
      toast.error("Failed to load student profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put("/profile/update", profile);
      toast.success("Profile updated successfully!");
      setEditMode(false);
      await fetchProfile();
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#0B0B0B] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
      </div>
    );

  if (!profile)
    return (
      <div className="text-center text-red-400 py-24">
        Profile not found. Please try again later.
      </div>
    );

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* === Aurora Background === */}
      <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
        <Aurora
          colorStops={["#c51616", "#FFFFFF", "#b5aada"]}
          blend={0.85}
          amplitude={1.4}
          speed={0.25}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0B]/60 to-[#0B0B0B]" />
      </div>

      {/* === Header === */}
      <Header logoText="ReUnion Student" accent="from-cyan-400 to-blue-500" dashboardLinks />

      {/* === Main Content === */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-28 sm:py-36 text-center">
        {/* === Name + Email === */}
        <h1 className="text-6xl sm:text-7xl font-extrabold mb-3">{profile.name}</h1>
        <p className="text-gray-400 text-lg mb-10">{profile.email}</p>

        {!editMode ? (
          <>
            <div className="text-left max-w-2xl mx-auto space-y-6">
              <InfoRow label="Phone" value={profile.phone || "-"} />
              <InfoRow label="Enrollment Year" value={profile.enrollment_year?.toString() || "-"} />
              <InfoRow label="Degree" value={profile.degree || "-"} />
              <InfoRow label="Department" value={profile.department || "-"} />
              <InfoRow label="Expected Graduation" value={profile.expected_graduation || "-"} />
              <InfoRow
                label="Joined On"
                value={
                  profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : "-"
                }
              />
            </div>

            <div className="mt-12">
              <button
                onClick={() => setEditMode(true)}
                className="px-6 py-2 bg-white text-gray-900 font-semibold rounded-md hover:bg-gray-100 border border-white/20 transition-colors duration-200"
              >
                Edit Profile
              </button>
            </div>
          </>
        ) : (
          <form
            onSubmit={handleUpdate}
            className="mt-12 space-y-6 max-w-2xl mx-auto text-left"
          >
            <EditableField label="Full Name" name="name" value={profile.name} onChange={handleChange} required />
            <EditableField label="Phone" name="phone" value={profile.phone || ""} onChange={handleChange} />
            <EditableField
              label="Enrollment Year"
              name="enrollment_year"
              type="number"
              value={profile.enrollment_year?.toString() || ""}
              onChange={handleChange}
            />
            <EditableField label="Degree" name="degree" value={profile.degree || ""} onChange={handleChange} />
            <EditableField label="Department" name="department" value={profile.department || ""} onChange={handleChange} />
            <EditableField label="Expected Graduation" name="expected_graduation" value={profile.expected_graduation || ""} onChange={handleChange} />

            <div className="flex justify-center gap-4 pt-8">
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  fetchProfile();
                }}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-white text-gray-900 font-semibold rounded-md hover:bg-gray-100 border border-white/20 transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </main>

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}

/* === Read-Only Info Row === */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/10 pb-3 flex justify-between items-center">
      <span className="text-gray-400 text-sm tracking-wide">{label}</span>
      <span className="text-white text-lg font-medium">{value}</span>
    </div>
  );
}

/* === Editable Input Field === */
function EditableField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
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
        className="w-full px-4 py-2 bg-white/10 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
      />
    </div>
  );
}
