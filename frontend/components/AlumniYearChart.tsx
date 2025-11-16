"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Rectangle, // Import Rectangle
} from "recharts";

// This function is no longer needed
// const TransparentActiveShape = (props: any) => { ... };

export default function AlumniYearChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl mt-10">
        <h2 className="text-xl font-semibold text-white mb-4">
          Alumni Count by Graduation Year
        </h2>
        <div className="text-gray-400 text-center py-8">
          No data available for the chart.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-xl mt-10">
      <h2 className="text-xl font-semibold text-white mb-4">
        Alumni Count by Graduation Year
      </h2>

      <ResponsiveContainer
        width="100%"
        height={350}
        style={{ background: "transparent" }}
      >
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />

          <XAxis
            dataKey="graduation_year"
            stroke="#ccc"
            tick={{ fill: "#ccc" }}
          />

          <YAxis stroke="#ccc" tick={{ fill: "#ccc" }} />

          <Tooltip
            // 1. This makes the background hover box invisible
            cursor={<Rectangle fill="transparent" stroke="transparent" />}
            wrapperStyle={{
              backgroundColor: "transparent",
              borderRadius: "8px",
              border: "1px solid #333",
            }}
            contentStyle={{
              backgroundColor: "#0B0B0B",
              border: "1px solid #444",
              color: "#fff",
            }}
            labelStyle={{
              color: "#fff",
              fontWeight: "bold",
            }}
            itemStyle={{ color: "#fff" }}
          />

          <Bar
            dataKey="total_alumni"
            fill="#22d3ee" // Original cyan color
            radius={[4, 4, 0, 0]}
            barSize={34}
            // 2. This sets the bar's hover color to a brighter cyan
            activeBar={<Rectangle fill="#5ef3ff" radius={[4, 4, 0, 0]} />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}