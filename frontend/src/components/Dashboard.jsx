import React from "react";
import { Line } from "react-chartjs-2";

export default function Dashboard() {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr"],
    datasets: [
      { label: "Total Cost", data: [1200, 1500, 1400, 1800], borderWidth: 2 },
      { label: "PF Penalty", data: [100, 80, 120, 90], borderWidth: 2 }
    ]
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-4">
      <h2 className="text-xl font-semibold mb-4">📈 Monthly Analysis</h2>
      <Line data={data} />
    </div>
  );
}
