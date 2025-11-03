// src/components/NewRequests.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase/config"; // Make sure this path is correct
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function NewRequests({ shopId }) {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("pending"); // default tab
  const navigate = useNavigate();

  useEffect(() => {
    if (!shopId) return;

    const fetchRequests = async () => {
      try {
        const ref = collection(db, "shopkeepers", shopId, "print_requests");
        const q = query(ref, orderBy("timestamp", "asc")); // oldest first
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("✅ Fetched print_requests for shopId:", shopId, data); // Debug log
        setRequests(data);
      } catch (error) {
        console.error("❌ Error fetching print requests:", error);
      }
    };

    fetchRequests();
  }, [shopId]);

  const handleView = (id) => {
    navigate(`/dashboard/request/${shopId}/${id}`);
  };

  // Filter requests by tab
  const filteredRequests =
    activeTab === "pending"
      ? requests.filter((req) => req.status !== "Done!")
      : requests.filter((req) => req.status === "Done!");

  return (
    <div className="bg-white shadow p-6 rounded-lg max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-indigo-700">Print Requests</h2>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "pending"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-indigo-600"
          }`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Orders
        </button>
        <button
          className={`ml-4 px-4 py-2 font-medium ${
            activeTab === "completed"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-gray-500 hover:text-indigo-600"
          }`}
          onClick={() => setActiveTab("completed")}
        >
          Completed Orders
        </button>
      </div>

      {/* Table */}
      {filteredRequests.length === 0 ? (
        <p className="text-gray-500 text-center">
          {activeTab === "pending"
            ? "No pending requests found."
            : "No completed requests found."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full bg-white text-sm text-left border-collapse">
            <thead className="bg-indigo-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 border">Request ID</th>
                <th className="px-4 py-3 border">Price (₹)</th>
                <th className="px-4 py-3 border">Status</th>
                <th className="px-4 py-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-indigo-50 transition duration-200"
                >
                  <td className="px-4 py-2 border">{req.id}</td>
                  <td className="px-4 py-2 border">₹{req.totalPrice ?? "N/A"}</td>
                  <td className="px-4 py-2 border">{req.status ?? "Pending"}</td>
                  <td className="px-4 py-2 border flex items-center space-x-4">
                    <button
                      onClick={() => handleView(req.id)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
