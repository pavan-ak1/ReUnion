"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast, ToastContainer } from "react-toastify";
import Aurora from "@/components/Aurora";
import Header from "@/components/Header";
import "react-toastify/dist/ReactToastify.css";

interface AlumniProfile {
  name: string;
  email: string;
  phone?: string;
  graduation_year?: number;
  degree?: string;
  department?: string;
  current_position?: string;
  company?: string;
  location?: string;
}

export default function AlumniProfilePage() {
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/alumni/profile");
      setProfile(res.data);
    } catch (err) {
      toast.error("Failed to load profile");
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
      await api.put("/alumni/profile/update", profile);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );

  if (!profile)
    return (
      <div className="p-6 text-center text-red-400">
        Profile not found. Please try again later.
      </div>
    );

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
        <Aurora
          colorStops={["#c51616", "#FFFFFF", "#b5aada"]}
          blend={0.85}
          amplitude={1.3}
          speed={0.3}
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
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-28 sm:py-36 text-center">
        {/* --- MODIFICATION: LARGER NAME --- */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold mb-12">
          {profile.name}
        </h1>

        {!editMode ? (
          <>
            {/* --- MODIFICATION: PREMIUM DETAIL LIST --- */}
            <div className="max-w-xl mx-auto text-left border-t border-white/20">
              <ProfileDetailRow label="Email" value={profile.email} />
              <ProfileDetailRow label="Phone" value={profile.phone} />
              <ProfileDetailRow
                label="Profession"
                value={
                  profile.current_position && profile.company
                    ? `${profile.current_position} @ ${profile.company}`
                    : profile.current_position
                }
              />
              <ProfileDetailRow
                label="Education"
                value={
                  profile.degree && profile.department
                    ? `${profile.degree} in ${profile.department}`
                    : profile.degree
                }
              />
              <ProfileDetailRow
                label="Graduation Year"
                value={profile.graduation_year?.toString()}
              />
              <ProfileDetailRow label="Location" value={profile.location} />
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
            className="mt-10 space-y-6 max-w-xl mx-auto text-left"
          >
            <EditableField
              label="Full Name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
            />
            <EditableField
              label="Phone"
              name="phone"
              value={profile.phone || ""}
              onChange={handleChange}
            />
            <EditableField
              label="Graduation Year"
              name="graduation_year"
              value={profile.graduation_year?.toString() || ""}
              onChange={handleChange}
              type="number"
            />
            <EditableField
              label="Degree"
              name="degree"
              value={profile.degree || ""}
              onChange={handleChange}
            />
            <EditableField
              label="Department"
              name="department"
              value={profile.department || ""}
              onChange={handleChange}
            />
            <EditableField
              label="Current Position"
              name="current_position"
              value={profile.current_position || ""}
              onChange={handleChange}
            />
            <EditableField
              label="Company"
              name="company"
              value={profile.company || ""}
              onChange={handleChange}
            />
            <EditableField
              label="Location"
              name="location"
              value={profile.location || ""}
              onChange={handleChange}
            />

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

      <ToastContainer position="bottom-right" autoClose={2000} theme="dark" />
    </div>
  );
}

/* === Editable Field === */
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
        className="w-full px-4 py-2 bg-white/10 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
      />
    </div>
  );
}

/* === NEW COMPONENT: Profile Detail Row === */
function ProfileDetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  if (!value) return null; // Don't render empty fields

  return (
    <div className="flex justify-between items-center py-5 border-b border-white/20">
      <span className="text-gray-400 text-sm capitalize">{label}</span>
      <span className="text-white text-base font-medium text-right">
        {value}
      </span>
    </div>
  );
}