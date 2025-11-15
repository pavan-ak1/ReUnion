"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Header from "@/components/Header";
import Aurora from "@/components/Aurora";

export default function AlumniList() {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const res = await api.get("/student/allAlumni", { withCredentials: true });
        setAlumni(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch alumni:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlumni();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#0B0B0B] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
        <Aurora
          colorStops={["#2563eb", "#6A5AE0", "#b5aada", "#FFFFFF"]}
          blend={0.85}
          amplitude={1.4}
          speed={0.25}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0B]/60 to-[#0B0B0B]" />
      </div>

      {/* Header */}
      <Header
        logoText="ReUnion Student"
        accent="from-cyan-400 to-blue-500"
        dashboardLinks
      />

      {/* Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-24 sm:py-32 space-y-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-white text-center">
          Alumni Directory
        </h1>

        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-10">
          Explore the registered alumni and their academic & professional background.
        </p>

        {/* TABLE */}
        <div className="overflow-x-auto bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-xl">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/10 text-gray-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="py-3 px-4 border-b border-white/10">Name</th>
                <th className="py-3 px-4 border-b border-white/10">Email</th>
                <th className="py-3 px-4 border-b border-white/10">Degree</th>
                <th className="py-3 px-4 border-b border-white/10">Department</th>
                <th className="py-3 px-4 border-b border-white/10">Position</th>
                <th className="py-3 px-4 border-b border-white/10">Company</th>
                <th className="py-3 px-4 border-b border-white/10">Location</th>
              </tr>
            </thead>

            <tbody>
              {alumni.map((al, index) => (
                <tr
                  key={index}
                  className="border-b border-white/10 hover:bg-white/5 transition"
                >
                  <td className="py-3 px-4">{al.name}</td>
                  <td className="py-3 px-4 text-cyan-300">{al.email}</td>
                  <td className="py-3 px-4">{al.degree}</td>
                  <td className="py-3 px-4">{al.department}</td>
                  <td className="py-3 px-4">{al.current_position}</td>
                  <td className="py-3 px-4">{al.company}</td>
                  <td className="py-3 px-4">{al.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Count */}
        <p className="text-gray-400 text-center mt-6">
          Total Alumni:{" "}
          <span className="text-cyan-400 font-semibold">{alumni.length}</span>
        </p>
      </main>
    </div>
  );
}
