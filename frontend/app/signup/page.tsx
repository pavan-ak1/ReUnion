"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Aurora from "@/components/Aurora";

export default function SignupStepOne() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "student",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: any) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      alert("Please fill all required fields");
      return;
    }
    sessionStorage.setItem("signup_basic", JSON.stringify(formData));
    router.push("/signup/details");
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] sm:min-h-screen overflow-hidden text-white px-6">
      {/* === Aurora Background (Same as Sign-In) === */}
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

      {/* === Signup Card === */}
      <form
        onSubmit={handleNext}
        className="relative z-10 w-full max-w-md p-8 md:p-10
          bg-white/10 backdrop-blur-2xl border border-white/10 rounded-2xl
          shadow-[0_0_50px_rgba(56,189,248,0.15)] transition-all duration-500 space-y-5"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-400 text-sm">
            Join ReUnion and start connecting today
          </p>
        </div>

        {/* Form Fields */}
        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-md
            text-gray-100 placeholder-gray-500 focus:outline-none
            focus:ring-2 focus:ring-gray-400/60 transition-all duration-200"
        />

        <input
          name="email"
          type="email"
          placeholder="Email Address"
          onChange={handleChange}
          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-md
            text-gray-100 placeholder-gray-500 focus:outline-none
            focus:ring-2 focus:ring-gray-400/60 transition-all duration-200"
        />

        <input
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-md
            text-gray-100 placeholder-gray-500 focus:outline-none
            focus:ring-2 focus:ring-gray-400/60 transition-all duration-200"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-md
            text-gray-100 placeholder-gray-500 focus:outline-none
            focus:ring-2 focus:ring-gray-400/60 transition-all duration-200"
        />

        <select
          name="role"
          onChange={handleChange}
          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-md
            text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400/60 transition-all duration-200"
        >
          <option value="student" className="bg-black text-gray-100">
            Student
          </option>
          <option value="alumni" className="bg-black text-gray-100">
            Alumni
          </option>
        </select>

        {/* Next Button */}
        <button
          type="submit"
          className="w-full mt-4 flex items-center justify-center gap-2
px-6 py-3 rounded-full bg-white text-gray-900 font-semibold text-base 
hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.3)]
transition-transform duration-200 ease-out hover:scale-[1.03]"
        >
          Next →
        </button>

        {/* Divider */}
        <div className="my-4 border-t border-white/10" />

        {/* Sign In Link */}
        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <a
            href="/signin"
            className="text-white hover:text-blue-300 font-semibold transition-colors"
          >
            Sign In
          </a>
        </p>
      </form>
    </section>
  );
}
