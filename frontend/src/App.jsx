import React from "react";
import Dashboard from "./components/Dashboard";
import ReportsTable from "./components/ReportsTable";
import logo from "./assets/logo.png";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white flex items-center p-4 text-2xl font-bold shadow-lg">
        <img src={logo} alt="HAP-EB Logo" className="h-10 w-10 mr-3" />
        ⚡ HAP-EB Electricity Bill Manager
      </header>
      <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <Dashboard />
        </section>
        <aside>
          <ReportsTable />
        </aside>
      </main>
    </div>
  );
}
