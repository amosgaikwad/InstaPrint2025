// src/layouts/MainLayout.jsx
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function MainLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 shadow px-4 py-6">
        <h1 className="text-lg font-bold mb-6">Shopkeeper Panel</h1>
        <nav className="space-y-4">
          {[
            { label: "Home", route: "/dashboard/new-requests" },
            { label: "Payment Collection", route: "/payment" },
            { label: "Set Rates", route: "/set-rates" },
            { label: "Set Material", route: "/set-material" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.route)}
              className="w-full text-center bg-white text-black px-4 py-3 rounded-lg border border-gray-300 text-sm font-semibold shadow"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Dynamic Page Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
