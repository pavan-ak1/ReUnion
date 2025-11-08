"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      alert("Please fill all required fields");
      return;
    }

    // Store in sessionStorage for next step
    sessionStorage.setItem("signup_basic", JSON.stringify(formData));

    router.push("/signup/details");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleNext}
        className="bg-white p-8 rounded-2xl shadow-md w-96 space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center text-blue-700">
          Create Account
        </h1>

        <input
          name="name"
          placeholder="Full Name"
          className="w-full p-2 border rounded"
          onChange={handleChange}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone"
          className="w-full p-2 border rounded"
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          onChange={handleChange}
        />

        <select
          name="role"
          className="w-full p-2 border rounded"
          onChange={handleChange}
        >
          <option value="student">Student</option>
          <option value="alumni">Alumni</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white w-full p-2 rounded hover:bg-blue-700"
        >
          Next →
        </button>
      </form>
    </div>
  );
}
