"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const colors = ["#E8932B", "#D97A1E"];

export default function WeightChart({ chartData, cats, selectedCat }: {
  chartData: Record<string, string | number>[];
  cats: { id: string; name: string }[];
  selectedCat: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3E8D8" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9C8B7A" />
        <YAxis tick={{ fontSize: 10 }} stroke="#9C8B7A" unit="kg" />
        <Tooltip contentStyle={{ background: "white", border: "1px solid #F3E8D8", borderRadius: "0.75rem", fontSize: "12px" }} />
        <Legend wrapperStyle={{ fontSize: "11px" }} />
        {cats.filter(c => selectedCat === "all" || selectedCat === c.id).map((cat, i) => (
          <Line key={cat.id} type="monotone" dataKey={cat.name} stroke={colors[i % colors.length]} strokeWidth={2.5} dot={{ r: 4, fill: colors[i % colors.length] }} activeDot={{ r: 6 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
