"use client";

import Link from "next/link";
import { getUserName } from "@/lib/auth";

export default function AlumniHeader() {
  const name = getUserName();

  return (
    <header className="p-6 bg-white shadow flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-700">👩‍💼 Alumni Dashboard</h1>

      <div className="flex items-center gap-6">
        <span className="text-gray-700">Welcome, {name}</span>

        <Link
          href="/alumni/profile"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Profile
        </Link>
      </div>
    </header>
  );
}
