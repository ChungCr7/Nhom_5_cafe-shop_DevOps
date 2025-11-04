import { useState } from "react";
import AdminTablesPage from "./AdminTablesPage";
import AdminReservationsPage from "./AdminReservationsPage";

export default function AdminManagePage() {
  const [activeTab, setActiveTab] = useState<"tables" | "reservations">("tables");

  return (
    <section className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-6">
        {/* 🔹 Tiêu đề */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🏠 Quản lý Bàn & Đặt Bàn
        </h2>

        {/* 🔹 Tabs */}
        <div className="flex justify-center mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab("tables")}
            className={`px-6 py-3 font-semibold transition border-b-4 ${
              activeTab === "tables"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-500"
            }`}
          >
            🪑 Bàn Cafe
          </button>

          <button
            onClick={() => setActiveTab("reservations")}
            className={`px-6 py-3 font-semibold transition border-b-4 ${
              activeTab === "reservations"
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-500 hover:text-green-500"
            }`}
          >
            📅 Đặt Bàn
          </button>
        </div>

        {/* 🔹 Nội dung từng tab */}
        <div className="mt-4">
          {activeTab === "tables" ? <AdminTablesPage /> : <AdminReservationsPage />}
        </div>
      </div>
    </section>
  );
}
