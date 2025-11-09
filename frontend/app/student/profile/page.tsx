"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import StudentHeader from "@/components/StudentHeader";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        setProfile(res.data.data || res.data);
        setForm(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching student profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      await api.put("/profile/update", form);
      alert("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error("Error updating student profile:", err);
      alert("Failed to update profile");
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />

      <div className="max-w-3xl mx-auto mt-8 bg-white shadow p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">🎓 Student Profile</h1>
          <button
            onClick={() => setEditing(!editing)}
            className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        {!profile ? (
          <p className="text-gray-500">Profile not found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Name
              </label>
              <input
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                readOnly={!editing}
                className={`w-full border rounded p-2 ${
                  editing ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                name="email"
                value={form.email || ""}
                readOnly
                className="w-full border rounded p-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Phone
              </label>
              <input
                name="phone"
                value={form.phone || ""}
                onChange={handleChange}
                readOnly={!editing}
                className={`w-full border rounded p-2 ${
                  editing ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Enrollment Year
              </label>
              <input
                name="enrollment_year"
                value={form.enrollment_year || ""}
                onChange={handleChange}
                readOnly={!editing}
                className={`w-full border rounded p-2 ${
                  editing ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Degree
              </label>
              <input
                name="degree"
                value={form.degree || ""}
                onChange={handleChange}
                readOnly={!editing}
                className={`w-full border rounded p-2 ${
                  editing ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Department
              </label>
              <input
                name="department"
                value={form.department || ""}
                onChange={handleChange}
                readOnly={!editing}
                className={`w-full border rounded p-2 ${
                  editing ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Expected Graduation
              </label>
              <input
                name="expected_graduation"
                value={form.expected_graduation || ""}
                onChange={handleChange}
                readOnly={!editing}
                className={`w-full border rounded p-2 ${
                  editing ? "bg-white" : "bg-gray-100"
                }`}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Joined On
              </label>
              <input
                value={
                  form.created_at
                    ? new Date(form.created_at).toLocaleDateString()
                    : ""
                }
                readOnly
                className="w-full border rounded p-2 bg-gray-100"
              />
            </div>
          </div>
        )}

        {editing && (
          <button
            onClick={handleUpdate}
            className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
}
