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

  // 🔹 Validate inputs
  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.password.trim()) newErrors.password = "Password is required.";
    return newErrors;
  };

  // 🔹 Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
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
      console.log('Attempting to sign in with:', formData.email);
      
      const res = await api.post("/signin", formData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });

      if (!res.data) {
        throw new Error('No response data received');
      }
      
      console.log('Sign in successful:', {
        status: res.status,
        data: res.data,
        hasToken: !!res.data.token,
        headers: Object.fromEntries(
          Object.entries(res.headers).filter(([key]) => 
            ['set-cookie', 'authorization'].includes(key.toLowerCase())
          )
        )
      });

      // Store user data in localStorage for quick access
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        // Store token if it's in the response
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
      }

      // Show success message
      toast.success("Login successful! Redirecting...");
      
      // Add a small delay to ensure toast is visible
      setTimeout(() => {
        // Redirect to dashboard - the dashboard will handle the role-based redirection
        window.location.href = "/dashboard";
      }, 1000);

    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Invalid credentials or server error.";
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
              name="email"
              type="email"
              placeholder="Email"
              className={`w-full p-2 border rounded focus:outline-none ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              onChange={handleChange}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              className={`w-full p-2 border rounded focus:outline-none ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              onChange={handleChange}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 text-white rounded transition ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
