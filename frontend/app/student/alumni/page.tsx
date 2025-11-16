"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import Header from "@/components/Header";
import Aurora from "@/components/Aurora";

import AlumniYearChart from "@/components/AlumniYearChart";

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

  const debounceRef = useRef<number | null>(null);

  // YEAR STATS FOR CHART
  const [yearStats, setYearStats] = useState<any[]>([]);

  useEffect(() => {
  const fetchYearStats = async () => {
    try {
      const res = await api.get("/alumni/year-stats", {
        withCredentials: true,
      });

      console.log("YEAR STATS:", res.data.data);
      setYearStats(res.data.data || []);
    } catch (err) {
      console.error("Failed to load year stats:", err);
    }
  };

  fetchYearStats();
}, []);



  // Fetch alumni with filters
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

  // Initial fetch
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

  // Build params
  const buildParams = () => {
    const params: Record<string, string | undefined> = {};
    if (search) params.search = search;
    if (company) params.company = company;
    if (department) params.department = department;
    if (degree) params.degree = degree;
    if (location) params.location = location;
    return params;
  };

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(() => {
      fetchAlumni(buildParams());
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line
  }, [search]);

  // Normalize ("all" -> "")
  const normalize = (val: string) => (val === "all" ? "" : val);

  // Filter handlers
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

  // Clear everything
  const clearAll = () => {
    setSearch("");
    setCompany("");
    setDepartment("");
    setDegree("");
    setLocation("");
    fetchAlumni({});
  };

  // Unique dropdown values
  const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));
  const companyOptions = uniq(allAlumniSnapshot.map(a => a.company)).sort();
  const departmentOptions = uniq(allAlumniSnapshot.map(a => a.department)).sort();
  const degreeOptions = uniq(allAlumniSnapshot.map(a => a.degree)).sort();
  const locationOptions = uniq(allAlumniSnapshot.map(a => a.location)).sort();

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

      <Header
        logoText="ReUnion Student"
        accent="from-cyan-400 to-blue-500"
        dashboardLinks
      />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-24 sm:py-32 space-y-12">
        
        {/* PAGE TITLE */}
        <h1 className="text-4xl sm:text-5xl font-bold text-center">
          Alumni Directory
        </h1>
        <p className="text-gray-400 text-center max-w-2xl mx-auto">
          Explore the registered alumni and their academic & professional background.
        </p>

        {/* ⭐ NEW: YEAR-WISE BAR CHART */}
        <AlumniYearChart data={yearStats} />

        {/* SEARCH + FILTERS */}
        <div className="space-y-6 mt-10">
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
              className="px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-sm 
              hover:bg-white/20 transition w-full md:w-auto"
            >
              Clear Filters
            </button>
          </div>

          {/* FILTER DROPDOWNS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* COMPANY */}
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Company</label>
              <Select value={company || "all"} onValueChange={onCompanyChange}>
                <SelectTrigger className="bg-white/5 border border-white/10 text-white p-3 rounded-lg">
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F0F] text-white border border-white/10">
                  <SelectItem value="all">All Companies</SelectItem>
                  {companyOptions.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* DEPARTMENT */}
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Department</label>
              <Select value={department || "all"} onValueChange={onDepartmentChange}>
                <SelectTrigger className="bg-white/5 border border-white/10 text-white p-3 rounded-lg">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departmentOptions.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* DEGREE */}
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Degree</label>
              <Select value={degree || "all"} onValueChange={onDegreeChange}>
                <SelectTrigger className="bg-white/5 border border-white/10 text-white p-3 rounded-lg">
                  <SelectValue placeholder="All Degrees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Degrees</SelectItem>
                  {degreeOptions.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* LOCATION */}
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Location</label>
              <Select value={location || "all"} onValueChange={onLocationChange}>
                <SelectTrigger className="bg-white/5 border border-white/10 text-white p-3 rounded-lg">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locationOptions.map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                  <td className="py-3 px-4">{al.current_position}</td>
                  <td className="py-3 px-4">{al.company}</td>
                  <td className="py-3 px-4">{al.location}</td>
                </tr>
              ))}

              {alumni.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No alumni found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-gray-400 text-center mt-6">
          Total Alumni: <span className="text-cyan-400 font-semibold">{alumni.length}</span>
        </p>

      </main>
    </div>
  );
}
