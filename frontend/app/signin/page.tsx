"use client";
import { useState } from "react";
import api from "@/app/lib/api";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SigninPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.password.trim()) newErrors.password = "Password is required.";
    return newErrors;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors before submitting");
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const res = await api.post("/signin", formData);
      Cookies.set("token", res.data.token, { expires: 1 }); // store for 1 day
      toast.success("Login successful!");
      setTimeout(() => (window.location.href = "/dashboard"), 1000);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Invalid credentials or server error.";
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />

      <div className="w-96 bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-semibold mb-6 text-center text-blue-700">Sign In</h1>

        {errors.general && (
          <div className="text-red-600 text-sm text-center mb-3">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              className={`w-full p-2 border rounded focus:outline-none ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className={`w-full p-2 border rounded focus:outline-none ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 text-white rounded transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
