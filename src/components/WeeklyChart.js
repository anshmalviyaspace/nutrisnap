"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div
        style={{
          background: "rgba(13, 17, 23, 0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          padding: "10px 16px",
          fontSize: "13px",
        }}
      >
        <p style={{ color: "#8b8fa3", marginBottom: 4 }}>{label}</p>
        <p style={{ color: "#f0f0f5", fontWeight: 700, fontSize: 16 }}>
          {val > 0 ? `${val} kcal` : "No data"}
        </p>
      </div>
    );
  }
  return null;
};

export default function WeeklyChart({ data = [], calorieGoal = 2000 }) {
  return (
    <div id="weekly-chart" style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 4, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="day_label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#555870", fontSize: 11, fontWeight: 500 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#555870", fontSize: 10 }}
            domain={[0, Math.max(calorieGoal * 1.3, 500)]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)", radius: 8 }} />
          <ReferenceLine
            y={calorieGoal}
            stroke="rgba(108, 99, 255, 0.4)"
            strokeDasharray="4 4"
            label={{ value: "Goal", position: "right", fill: "#6c63ff", fontSize: 10 }}
          />
          <Bar dataKey="total_calories" radius={[6, 6, 0, 0]} maxBarSize={36}>
            {data.map((entry, index) => {
              const pct = entry.total_calories / calorieGoal;
              let fill = "#448aff";
              if (pct >= 0.9 && pct <= 1.2) fill = "url(#barGradientGreen)";
              else if (pct > 1.2) fill = "url(#barGradientRed)";
              else fill = "url(#barGradientBlue)";
              return <Cell key={`cell-${index}`} fill={entry.total_calories === 0 ? "rgba(255,255,255,0.06)" : fill} />;
            })}
          </Bar>
          <defs>
            <linearGradient id="barGradientGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00e676" />
              <stop offset="100%" stopColor="#00c853" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="barGradientBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6c63ff" />
              <stop offset="100%" stopColor="#448aff" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="barGradientRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff5252" />
              <stop offset="100%" stopColor="#ff9100" stopOpacity={0.7} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
