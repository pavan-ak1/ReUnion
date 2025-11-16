"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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


  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    recordsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
  const fetchFilterOptions = async () => {
    try {
      console.log("Fetching filter options from API...");
      const res = await api.get("/alumni/filter-options", {
        withCredentials: true,
      });

      console.log("Filter options API response:", res);
      const optionsData = res.data.data || {};
      setFilterOptions(optionsData);
    } catch (err: any) {
      console.error("Failed to load filter options:", err);
      console.error("Error details:", err.response?.data || err.message);
      // Set empty arrays to prevent errors
      setFilterOptions({
        companies: [],
        departments: [],
        degrees: [],
        locations: [],
        graduationYears: []
      });
    }
  };

  fetchFilterOptions();
}, []);



  // Fetch alumni with filters
  const fetchAlumni = useCallback(async (params: Record<string, string | number | undefined> = {}) => {
    setLoading(true);
    try {
      const res = await api.get("/alumni", { params, withCredentials: true });
      setAlumni(res.data.data || []);
      
      // Update pagination state if available
      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err: any) {
      console.error("Failed to fetch alumni:", err);
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
    if (graduationYear) params.graduation_year = graduationYear;
    return params;
  };

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

  const timeout = window.setTimeout(() => {
    fetchAlumni({ ...buildParams(), page: 1, limit: pagination.recordsPerPage });
  }, 400);

  debounceRef.current = timeout;

  return () => {
    clearTimeout(timeout);
  };
}, [search, pagination.recordsPerPage]);


  // Normalize ("all" -> "")
  const normalize = (val: string) => (val === "all" ? "" : val);

  // Filter handlers (each triggers API)
  const onCompanyChange = (val: string) => {
    const v = normalize(val);
    setCompany(v);
    fetchAlumni({ ...buildParams(), company: v || undefined, page: 1, limit: pagination.recordsPerPage });
  };

  const onDepartmentChange = (val: string) => {
    const v = normalize(val);
    setDepartment(v);
    fetchAlumni({ ...buildParams(), department: v || undefined, page: 1, limit: pagination.recordsPerPage });
  };

  const onDegreeChange = (val: string) => {
    const v = normalize(val);
    setDegree(v);
    fetchAlumni({ ...buildParams(), degree: v || undefined, page: 1, limit: pagination.recordsPerPage });
  };

  const onLocationChange = (val: string) => {
    const v = normalize(val);
    setLocation(v);
    fetchAlumni({ ...buildParams(), location: v || undefined, page: 1, limit: pagination.recordsPerPage });
  };

  const onGraduationYearChange = (val: string) => {
    const v = normalize(val);
    setGraduationYear(v);
    fetchAlumni({ ...buildParams(), graduation_year: v || undefined, page: 1, limit: pagination.recordsPerPage });
  };

  // Pagination handlers
  const onPageChange = (newPage: number) => {
    fetchAlumni({ ...buildParams(), page: newPage, limit: pagination.recordsPerPage });
  };

  const onLimitChange = (newLimit: number) => {
    fetchAlumni({ ...buildParams(), page: 1, limit: newLimit });
  };

  // Clear everything
  const clearAll = () => {
    setSearch("");
    setCompany("");
    setDepartment("");
    setDegree("");
    setLocation("");
    setGraduationYear("");
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalRecords: 0,
      recordsPerPage: 10,
      hasNextPage: false,
      hasPrevPage: false
    });
    fetchAlumni({ page: 1, limit: pagination.recordsPerPage });
  };

  // Filter options state
  const [filterOptions, setFilterOptions] = useState({
    companies: [] as string[],
    departments: [] as string[],
    degrees: [] as string[],
    locations: [] as string[],
    graduationYears: [] as number[]
  });

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
        <h1 className="text-4xl sm:text-5xl font-bold text-center">
          Alumni Directory
        </h1>
        <p className="text-gray-400 text-center max-w-2xl mx-auto">
          Explore the registered alumni and their academic & professional background.
        </p>

        {/* SEARCH + FILTERS */}
        <div className="space-y-6 mt-10">
          {/* Search */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-300 mb-1 block">Search Alumni</label>
              <input
                key="search-input"
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
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
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Company</label>
              <Select value={company || "all"} onValueChange={onCompanyChange}>
                <SelectTrigger className="bg-white/5 border border-white/10 text-white p-3 rounded-lg">
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F0F] text-white border border-white/10">
                  <SelectItem value="all">All Companies</SelectItem>
                  {filterOptions.companies.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
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
                <SelectContent className="bg-[#0F0F0F] text-white border border-white/10">
                  <SelectItem value="all">All Departments</SelectItem>
                  {filterOptions.departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
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
                <SelectContent className="bg-[#0F0F0F] text-white border border-white/10">
                  <SelectItem value="all">All Degrees</SelectItem>
                  {filterOptions.degrees.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
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
                <SelectContent className="bg-[#0F0F0F] text-white border border-white/10">
                  <SelectItem value="all">All Locations</SelectItem>
                  {filterOptions.locations.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* GRADUATION YEAR */}
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Graduation Year</label>
              <Select value={graduationYear || "all"} onValueChange={onGraduationYearChange}>
                <SelectTrigger className="bg-white/5 border border-white/10 text-white p-3 rounded-lg">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F0F] text-white border border-white/10">
                  <SelectItem value="all">All Years</SelectItem>
                  {filterOptions.graduationYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
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

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-sm">Records per page:</span>
              <select
                value={pagination.recordsPerPage}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="bg-white/10 border border-white/20 text-white px-3 py-1 rounded-lg text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition"
              >
                Previous
              </button>

              <span className="text-gray-300 text-sm px-3">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition"
              >
                Next
              </button>
            </div>

            <div className="text-gray-300 text-sm">
              Showing {((pagination.currentPage - 1) * pagination.recordsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.recordsPerPage, pagination.totalRecords)} of {pagination.totalRecords} records
            </div>
          </div>
        )}

        <p className="text-gray-400 text-center mt-6">
          Total Alumni: <span className="text-cyan-400 font-semibold">{pagination.totalRecords}</span>
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
