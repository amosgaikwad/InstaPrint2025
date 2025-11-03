// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate, Outlet } from "react-router-dom";
import NewRequests from "../pages/NewRequests";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Unavailable");
  const navigate = useNavigate();

  // Track logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else setUser(null);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user's status
  useEffect(() => {
    if (!user) return;

    const fetchStatus = async () => {
      try {
        const snap = await doc(db, "shopkeepers", user.uid).get();
        setStatus(snap.data()?.status || "Unavailable");
      } catch (err) {
        console.error("Error fetching status:", err);
      }
    };

    fetchStatus();
  }, [user]);

  const toggleStatus = async () => {
    if (!user) return;

    try {
      const newStatus = status === "Available" ? "Unavailable" : "Available";
      await updateDoc(doc(db, "shopkeepers", user.uid), { status: newStatus });
      setStatus(newStatus);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-600">
          Please log in to access the dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-amber-500 text-white shadow-md border-r border-amber-300 flex-shrink-0">
        <div className="p-6 text-2xl font-extrabold tracking-wide border-b border-white/30 text-center">
          Shopkeeper Panel
        </div>
        <nav className="mt-6 space-y-4 px-4">
          {[
            { label: "Home", route: "/dashboard/new-requests" },
            { label: "Payment Collection", route: "/dashboard/payment" },
            { label: "Set Rates", route: "/dashboard/set-rates" },
            { label: "Set Material", route: "/dashboard/set-material" },
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

        {/* Status Box */}
        <div className="mt-8 px-4">
          <div className="bg-white/10 border border-white rounded-lg p-4 shadow-sm text-center">
            <div className="text-sm mb-1 text-white/80 font-semibold">Status</div>
            <div className="text-lg font-bold mb-3 text-white">{status}</div>
            <button
              onClick={toggleStatus}
              className={`w-full py-2 text-sm rounded-lg font-semibold ${
                status === "Available" ? "bg-green-500" : "bg-red-500"
              } text-white`}
            >
              {status === "Available" ? "Turn OFF Service" : "Turn ON Service"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-right text-sm">
              <div className="font-semibold text-gray-700">{user.displayName || "Shopkeeper"}</div>
              <div className="text-gray-500">{user.email}</div>
            </div>
            <button
              onClick={() => signOut(auth)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 bg-gray-100 flex-1 overflow-auto">
        {/* Pass user.uid to nested routes */}
        <Outlet context={{ shopId: user.uid }} />
      </main>
      </div>
    </div>
  );
}
