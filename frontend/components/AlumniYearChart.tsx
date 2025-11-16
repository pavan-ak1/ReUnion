"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AlumniYearChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl mt-10">
      <h2 className="text-xl font-semibold text-white mb-4">
        Alumni Count by Graduation Year
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="year" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip
            wrapperStyle={{
              backgroundColor: "#111",
              borderRadius: "8px",
              border: "1px solid #444",
            }}
            labelStyle={{ color: "#fff" }}
            contentStyle={{ backgroundColor: "#222", color: "#fff" }}
          />
          <Bar dataKey="count" fill="#22d3ee" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
