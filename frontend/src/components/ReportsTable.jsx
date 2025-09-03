import React, { useState } from "react";
import reportIcon from "../assets/report-icon.png";

export default function ReportsTable() {
  const [reports, setReports] = useState([
    { id: 1, name: "Jan Report", url: "#" },
    { id: 2, name: "Feb Report", url: "#" }
  ]);

  const deleteReport = (id) => setReports(reports.filter(r => r.id !== id));

  return (
    <div className="bg-white shadow-lg rounded-2xl p-4">
      <h2 className="text-lg font-semibold mb-4">📂 Reports</h2>
      <ul>
        {reports.map(r => (
          <li key={r.id} className="flex justify-between p-2 border-b items-center">
            <div className="flex items-center">
              <img src={reportIcon} alt="report" className="h-6 w-6 mr-2" />
              <a href={r.url} className="text-blue-600 underline">{r.name}</a>
            </div>
            <button
              className="text-red-500 hover:underline"
              onClick={() => deleteReport(r.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
