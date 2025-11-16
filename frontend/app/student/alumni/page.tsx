"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import Header from "@/components/Header";
import Aurora from "@/components/Aurora";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function AlumniList() {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [allAlumniSnapshot, setAllAlumniSnapshot] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // search + filters
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("");
  const [department, setDepartment] = useState("");
  const [degree, setDegree] = useState("");
  const [location, setLocation] = useState("");
  const [graduationYear, setGraduationYear] = useState("");

  const debounceRef = useRef<number | null>(null);

  // Fetch alumni with params
  const fetchAlumni = async (params: Record<string, string | undefined> = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/alumni", { params, withCredentials: true });
      setAlumni(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch alumni:", err);
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      try {
        const res = await api.get("/alumni", { withCredentials: true });
        const data = res.data.data || [];
        setAlumni(data);
        setAllAlumniSnapshot(data);
      } catch (err) {
        console.error("Failed initial fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    initialLoad();
  }, []);

  // Build query params
  const buildParams = () => {
    const params: Record<string, string | undefined> = {};
    if (search) params.search = search;
    if (company) params.company = company;
    if (department) params.department = department;
    if (degree) params.degree = degree;
    if (location) params.location = location;
    if (graduationYear) params.graduation_year = graduationYear;
    return params;
  };

  // Debounced search
 useEffect(() => {
  if (debounceRef.current !== null) {
    clearTimeout(debounceRef.current);
  }

  const timeout = window.setTimeout(() => {
    fetchAlumni(buildParams());
  }, 400);

  debounceRef.current = timeout;

  return () => {
    clearTimeout(timeout);
  };
}, [search]);


  // Convert "all" → "" for backend filters
  const normalize = (val: string) => (val === "all" ? "" : val);

  // Filter handlers (each triggers API)
  const onCompanyChange = (val: string) => {
    const v = normalize(val);
    setCompany(v);
    fetchAlumni({ ...buildParams(), company: v || undefined });
  };

  const onDepartmentChange = (val: string) => {
    const v = normalize(val);
    setDepartment(v);
    fetchAlumni({ ...buildParams(), department: v || undefined });
  };

  const onDegreeChange = (val: string) => {
    const v = normalize(val);
    setDegree(v);
    fetchAlumni({ ...buildParams(), degree: v || undefined });
  };

  const onLocationChange = (val: string) => {
    const v = normalize(val);
    setLocation(v);
    fetchAlumni({ ...buildParams(), location: v || undefined });
  };

  const onGraduationYearChange = (val: string) => {
    const v = normalize(val);
    setGraduationYear(v);
    fetchAlumni({ ...buildParams(), graduation_year: v || undefined });
  };

  // Reset all filters
  const clearAll = () => {
    setSearch("");
    setCompany("");
    setDepartment("");
    setDegree("");
    setLocation("");
    setGraduationYear("");
    fetchAlumni({});
  };

  // Unique filter options
  const uniq = (arr: any[]) => Array.from(new Set(arr.filter(Boolean)));

  const companyOptions = uniq(allAlumniSnapshot.map(a => a.company)).sort();
  const departmentOptions = uniq(allAlumniSnapshot.map(a => a.department)).sort();
  const degreeOptions = uniq(allAlumniSnapshot.map(a => a.degree)).sort();
  const locationOptions = uniq(allAlumniSnapshot.map(a => a.location)).sort();
  const graduationYearOptions = uniq(allAlumniSnapshot.map(a => a.graduation_year)).sort();

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-[#0B0B0B] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[#0B0B0B]">
        <Aurora
          colorStops={["#2563eb", "#6A5AE0", "#b5aada", "#FFFFFF"]}
          blend={0.85}
          amplitude={1.4}
          speed={0.25}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0B0B]/60 to-[#0B0B0B]" />
      </div>

      <Header logoText="ReUnion Student" accent="from-cyan-400 to-blue-500" dashboardLinks />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-24 sm:py-32 space-y-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-center">Alumni Directory</h1>
        <p className="text-gray-400 text-center max-w-2xl mx-auto">
          Explore the registered alumni and their academic & professional background.
        </p>

        {/* Search + Filters */}
        <div className="space-y-6 mt-10">

          {/* Search */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-300 mb-1 block">Search Alumni</label>
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 placeholder-gray-400 text-white 
                p-3 rounded-lg focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition"
              />
            </div>

            <button
              onClick={clearAll}
              className="px-4 py-3 mt-6 bg-white/10 border border-white/10 rounded-lg text-sm 
              hover:bg-white/20 transition w-full md:w-auto"
            >
              Clear Filters
            </button>
          </div>

          {/* Dropdown Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">

            {/* COMPANY */}
            <FilterBlock label="Company" value={company} onChange={onCompanyChange} options={companyOptions} />

            {/* DEPARTMENT */}
            <FilterBlock label="Department" value={department} onChange={onDepartmentChange} options={departmentOptions} />

            {/* DEGREE */}
            <FilterBlock label="Degree" value={degree} onChange={onDegreeChange} options={degreeOptions} />

            {/* LOCATION */}
            <FilterBlock label="Location" value={location} onChange={onLocationChange} options={locationOptions} />

            {/* GRAD YEAR */}
            <FilterBlock
              label="Graduation Year"
              value={graduationYear}
              onChange={onGraduationYearChange}
              options={graduationYearOptions}
            />

          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-xl mt-10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/10 text-gray-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="py-3 px-4 border-b border-white/10">Name</th>
                <th className="py-3 px-4 border-b border-white/10">Email</th>
                <th className="py-3 px-4 border-b border-white/10">Degree</th>
                <th className="py-3 px-4 border-b border-white/10">Department</th>
                <th className="py-3 px-4 border-b border-white/10">Grad Year</th>
                <th className="py-3 px-4 border-b border-white/10">Position</th>
                <th className="py-3 px-4 border-b border-white/10">Company</th>
                <th className="py-3 px-4 border-b border-white/10">Location</th>
              </tr>
            </thead>

            <tbody>
              {alumni.map((al, index) => (
                <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition">
                  <td className="py-3 px-4">{al.name}</td>
                  <td className="py-3 px-4 text-cyan-300">{al.email}</td>
                  <td className="py-3 px-4">{al.degree}</td>
                  <td className="py-3 px-4">{al.department}</td>
                  <td className="py-3 px-4">{al.graduation_year}</td>
                  <td className="py-3 px-4">{al.current_position}</td>
                  <td className="py-3 px-4">{al.company}</td>
                  <td className="py-3 px-4">{al.location}</td>
                </tr>
              ))}

              {alumni.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No alumni found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-gray-400 text-center mt-6">
          Total Alumni:{" "}
          <span className="text-cyan-400 font-semibold">{alumni.length}</span>
        </p>
      </main>
    </div>
  );
}

/** Helper for dropdown UI **/
function FilterBlock({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="text-sm text-gray-300 mb-1 block">{label}</label>
      <Select value={value || "all"} onValueChange={onChange}>
        <SelectTrigger className="bg-white/5 border border-white/10 text-white p-3 rounded-lg">
          <SelectValue placeholder={`All ${label}`} />
        </SelectTrigger>
        <SelectContent className="bg-[#0F0F0F] text-white border border-white/10">
          <SelectItem value="all">All {label}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
