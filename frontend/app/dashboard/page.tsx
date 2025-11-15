"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCookie } from "@/lib/cookies";

export default function DashboardRedirect() {
  const [status, setStatus] = useState("Checking authentication...");

  useEffect(() => {
    const checkAuth = async () => {
      const token = getCookie("token");
      const userString = getCookie("user");

      if (!token || !userString) {
        console.warn("[Auth] No token or user found → redirecting to /signin");
        window.location.replace("/signin");
        return;
      }

      try {
        const userData = JSON.parse(userString);
        if (!userData?.role) throw new Error("Missing role in user data");

        // --- Verify session with backend ---
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          method: "GET",
          credentials: "include", // for cookie-based auth
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}), // for header-based auth
          },
        });

        console.log("[Auth] Response status:", response.status);

        let role: string | undefined = userData.role;

        if (response.ok) {
          const serverUserData = await response.json();
          role = serverUserData.role || role;
          console.log("[Auth] Verified server role:", role);
        } else {
          console.warn("[Auth] Server verification failed, using stored role");
        }

        if (role === "alumni" || role === "student") {
          console.log(`[Auth] Redirecting to /${role}/dashboard`);
          setStatus(`Redirecting to ${role} dashboard...`);
          window.location.replace(`/${role}/dashboard`);
        } else {
          throw new Error("Invalid or missing role");
        }
      } catch (err) {
        console.error("[Auth] Error verifying token:", err);
        setStatus("Authentication failed. Redirecting...");
        window.location.replace("/signin");
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0B0B] text-white">
      <div className="p-8 text-center bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(56,189,248,0.15)]">
        <h1 className="text-2xl font-semibold mb-2">{status}</h1>
        <p className="text-gray-400">Please wait while we redirect you...</p>
      </div>
    </div>
  );
}
