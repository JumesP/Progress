import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./SpiderGraph.scss";

const SpiderGraph = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="spider-graph-placeholder">
        <p>Add goals to see your stats!</p>
      </div>
    );
  }

  return (
    <div className="spider-graph-container">
      <h2>Your Stats</h2>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data} margin={{ top: 20, right: 80, left: 80, bottom: 20 }}>
          <PolarGrid stroke="#e0e0e0" />
          <PolarAngleAxis
            dataKey="category"
            angle={90}
            orientation="outer"
            tick={{ fontSize: 12, fill: "#666" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#999" }}
          />
          <Radar
            name="Progress (%)"
            dataKey="value"
            stroke="#007bff"
            fill="#007bff"
            fillOpacity={0.6}
            animationDuration={500}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #ddd",
              borderRadius: "4px",
              padding: "8px",
            }}
            formatter={(value, name) => {
              if (name === "Progress (%)") {
                return `${value}%`;
              }
              return value;
            }}
            labelStyle={{ color: "#333" }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpiderGraph;

