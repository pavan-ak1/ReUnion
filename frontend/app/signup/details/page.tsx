"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Aurora from "@/components/Aurora";

export default function SignupDetails() {
  const router = useRouter();
  const [role, setRole] = useState("student");
  const [extra, setExtra] = useState<any>({});

  useEffect(() => {
    const basicData = sessionStorage.getItem("signup_basic");
    if (!basicData) router.push("/signup");
    else setRole(JSON.parse(basicData).role);
  }, [router]);

  const handleChange = (e: any) => {
    setExtra({ ...extra, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const basicData = JSON.parse(sessionStorage.getItem("signup_basic") || "{}");
    const fullData = { ...basicData, extra };

    try {
      await api.post("/signup", fullData);
      toast.success("Signup successful! Redirecting...");
      sessionStorage.removeItem("signup_basic");
      setTimeout(() => router.push("/signin"), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Signup failed!");
    }
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] sm:min-h-screen overflow-hidden text-white px-6">
      <ToastContainer />

      {/* === Aurora Background === */}
      <div className="absolute inset-0 -z-10 bg-[#050505]">
        <Aurora
          colorStops={[
            "#7dff67", // violet
            "#b1a0e7", // indigo
            "#5226ff", // pink
          ]}
          blend={0.9}
          amplitude={1}
          speed={0.5}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
      </div>

      {/* === Signup Details Card === */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md p-8 md:p-10
          bg-white/10 backdrop-blur-2xl border border-white/10 rounded-2xl
          shadow-[0_0_50px_rgba(56,189,248,0.15)] transition-all duration-500 space-y-5"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-white mb-2">
            {role === "alumni" ? "Alumni Details" : "Student Details"}
          </h1>
          <p className="text-gray-400 text-sm">
            Complete your profile to join the ReUnion network
          </p>
        </div>

        {/* Dynamic Inputs */}
        {role === "alumni" ? (
          <>
            <input
              name="graduation_year"
              placeholder="Graduation Year"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60 transition-all duration-200"
              onChange={handleChange}
            />
            <input
              name="degree"
              placeholder="Degree"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60 transition-all duration-200"
              onChange={handleChange}
            />
            <input
              name="department"
              placeholder="Department"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60 transition-all duration-200"
              onChange={handleChange}
            />
            <input
              name="current_position"
              placeholder="Current Position"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60 transition-all duration-200"
              onChange={handleChange}
            />
            <input
              name="company"
              placeholder="Company"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60 transition-all duration-200"
              onChange={handleChange}
            />
            <input
              name="location"
              placeholder="Location"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60 transition-all duration-200"
              onChange={handleChange}
            />
          </>
        ) : (
          <>
            <input
              name="enrollment_year"
              placeholder="Enrollment Year"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60 transition-all duration-200"
              onChange={handleChange}
            />
            <input
              name="degree"
              placeholder="Degree"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60 transition-all duration-200"
              onChange={handleChange}
            />
            <input
              name="department"
              placeholder="Department"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60 transition-all duration-200"
              onChange={handleChange}
            />
            <input
              name="expected_graduation"
              placeholder="Expected Graduation Year"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60 transition-all duration-200"
              onChange={handleChange}
            />
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-4 flex items-center justify-center gap-2
px-6 py-3 rounded-full bg-white text-gray-900 font-semibold text-base 
hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.3)]
transition-transform duration-200 ease-out hover:scale-[1.03]"
        >
          Submit & Sign Up
        </button>
      </form>
    </section>
  );
}
