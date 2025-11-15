"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import Aurora from "@/components/Aurora";
import api from "@/lib/api";
import { toast, ToastContainer } from "react-toastify";
import { setAuthToken, setCookie } from "@/lib/cookies";
import "react-toastify/dist/ReactToastify.css";

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Get return URL from query params
  const getReturnUrl = () => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("returnUrl") || "";
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/signin", formData);

      if (res.data?.user) {
        const { token, user } = res.data;

        // ✅ Store authentication details in cookies
        setAuthToken(token);
        setCookie("user", JSON.stringify(user));

        // ✅ NEW: store role separately for Header-based redirects
        if (user.role) {
          setCookie("role", user.role);
        }

        toast.success("Signed in successfully!");

        // Redirect based on returnUrl or role
        const role = user.role;
        const returnUrl = getReturnUrl();

        setTimeout(() => {
          if (returnUrl) {
            window.location.href = returnUrl;
          } else if (role === "alumni") {
            router.push("/alumni/dashboard");
          } else if (role === "student") {
            router.push("/student/dashboard");
          } else {
            router.push("/dashboard");
          }
        }, 1000);
      } else {
        toast.error("Invalid server response");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] sm:min-h-screen overflow-hidden text-white px-6">
      <ToastContainer />

      {/* Aurora Background */}
      <div className="absolute inset-0 -z-10 bg-[#050505]">
        <Aurora
          colorStops={[ "#7dff67", // violet
            "#b1a0e7", // indigo
            "#5226ff",]}
          blend={0.9}
          amplitude={1}
          speed={0.5}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
      </div>

      {/* Sign-In Card */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md p-8 md:p-10
        bg-white/10 backdrop-blur-2xl border border-white/10 rounded-2xl
        shadow-[0_0_50px_rgba(56,189,248,0.15)] transition-all duration-500"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-sm">
            Sign in to reconnect with your ReUnion network
          </p>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email Address
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-md
              text-gray-100 placeholder-gray-500 focus:outline-none
              focus:ring-2 focus:ring-gray-400/60 transition-all duration-200"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-md
                text-gray-100 placeholder-gray-500 focus:outline-none
                focus:ring-2 focus:ring-gray-400/60 transition-all duration-200 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2
            px-6 py-3 rounded-full bg-white text-gray-900 font-semibold text-base 
            hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.3)]
            transition-transform duration-200 ease-out hover:scale-[1.03]
            ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          <LogIn size={18} />
          {loading ? "Signing In..." : "Sign In"}
        </button>

        {/* Divider */}
        <div className="my-6 border-t border-white/10" />

        {/* Signup Link */}
        <p className="text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="text-white hover:text-blue-300 font-semibold transition-colors"
          >
            Join Now
          </Link>
        </p>
      </form>
    </section>
  );
}
