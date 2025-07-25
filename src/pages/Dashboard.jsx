import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { signOut } from "firebase/auth";

import {
  getDoc,
  doc,
  collection,
  query,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ user }) {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("Unavailable");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStatus() {
      const snap = await getDoc(doc(db, "shopkeepers", user.uid));
      if (snap.exists()) {
        setStatus(snap.data().status || "Unavailable");
      }
    }
    fetchStatus();
  }, [user.uid]);

  useEffect(() => {
    const ref = collection(db, "shopkeepers", user.uid, "print_requests");
    const unsub = onSnapshot(query(ref), snapshot => {
      const arr = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setRequests(arr);
    });
    return () => unsub();
  }, [user.uid]);

  const toggleStatus = async () => {
    const newStatus = status === "Available" ? "Unavailable" : "Available";
    await updateDoc(doc(db, "shopkeepers", user.uid), { status: newStatus });
    setStatus(newStatus);
  };

  const intOrZero = v => {
    const x = parseInt(v);
    return isNaN(x) ? 0 : x;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">📋 Print Requests</h2>
        <button onClick={() => { signOut(auth); }} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      <div className="mb-6 p-4 bg-white rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold mb-2">🔌 Service Availability</h3>
        <button
          onClick={toggleStatus}
          className={`px-4 py-2 rounded text-white ${status === "Available" ? "bg-green-600" : "bg-red-600"}`}
        >
          {status === "Available" ? "Turn OFF Service" : "Turn ON Service"}
        </button>
        <p className="mt-2 text-gray-700">
          Current Status: <strong>{status}</strong>
        </p>
      </div>

      {requests.length === 0 ? (
        <p>No print requests yet.</p>
      ) : (
        <table className="w-full text-left border-collapse mb-6">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-3">Request ID</th>
              <th className="py-2 px-3">Student</th>
              <th className="py-2 px-3">Price (₹)</th>
              <th className="py-2 px-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3"><code>{req.id}</code></td>
                <td className="py-2 px-3">{req.studentName || "Unknown"}</td>
                <td className="py-2 px-3">{intOrZero(req.price)}</td>
                <td className="py-2 px-3">
                  <button
                    onClick={() => navigate(`/request/${req.id}`, { state: { request: req } })}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
