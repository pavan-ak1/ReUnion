"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StudentHeader() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/student/dashboard" },
    { name: "Events", href: "/student/events" },
    { name: "Jobs", href: "/student/jobs" },
    { name: "Mentorship", href: "/student/mentorship/mentors" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/student/dashboard" className="text-2xl font-bold text-blue-700">
          🎓 ReUnion Student
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition ${
                pathname.startsWith(item.href)
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-gray-600 hover:text-blue-700"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/student/profile"
            className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700"
          >
            Profile
          </Link>

          <button
            onClick={() => {
              document.cookie = "token=; Max-Age=0";
              window.location.href = "/signin";
            }}
            className="bg-red-500 text-white text-sm px-3 py-1.5 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
