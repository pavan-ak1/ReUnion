"use client";
import { useEffect, useState } from "react";
import api from "@/app/lib/api";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <ToastContainer />
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-96 space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center text-blue-700">
          {role === "alumni" ? "Alumni Details" : "Student Details"}
        </h1>

        {role === "alumni" ? (
          <>
            <input
              name="graduation_year"
              placeholder="Graduation Year"
              className="w-full p-2 border rounded"
              onChange={handleChange}
            />
            <input
              name="degree"
              placeholder="Degree"
              className="w-full p-2 border rounded"
              onChange={handleChange}
            />
            <input
              name="department"
              placeholder="Department"
              className="w-full p-2 border rounded"
              onChange={handleChange}
            />
            <input
              name="current_position"
              placeholder="Current Position"
              className="w-full p-2 border rounded"
              onChange={handleChange}
            />
            <input
              name="company"
              placeholder="Company"
              className="w-full p-2 border rounded"
              onChange={handleChange}
            />
            <input
              name="location"
              placeholder="Location"
              className="w-full p-2 border rounded"
              onChange={handleChange}
            />
          </>
        ) : (
          <>
            <input
              name="enrollment_year"
              placeholder="Enrollment Year"
              className="w-full p-2 border rounded"
              onChange={handleChange}
            />
            <input
              name="degree"
              placeholder="Degree"
              className="w-full p-2 border rounded"
              onChange={handleChange}
            />
            <input
              name="department"
              placeholder="Department"
              className="w-full p-2 border rounded"
              onChange={handleChange}
            />
            <input
              name="expected_graduation"
              placeholder="Expected Graduation Year"
              className="w-full p-2 border rounded"
              onChange={handleChange}
            />
          </>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white w-full p-2 rounded hover:bg-blue-700"
        >
          Submit & Sign Up ✅
        </button>
      </form>
    </div>
  );
}
