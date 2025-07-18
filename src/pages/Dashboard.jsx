import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { getDoc, doc, collection, query, where, onSnapshot, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function Dashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("Unavailable");

  // Fetch shopkeeper status
  useEffect(() => {
    const fetchShopStatus = async () => {
      const shopRef = doc(db, "shopkeepers", user.uid);
      const docSnap = await getDoc(shopRef);
      if (docSnap.exists()) {
        setStatus(docSnap.data().status || "Unavailable");
      }
    };

    fetchShopStatus();
  }, [user.uid]);

  // Fetch orders for this shopkeeper
  useEffect(() => {
    const q = query(collection(db, "orders"), where("shopId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(orderList);
    });

    return () => unsubscribe();
  }, [user.uid]);

  // Toggle availability status
  const toggleStatus = async () => {
    const newStatus = status === "Available" ? "Unavailable" : "Available";
    await updateDoc(doc(db, "shopkeepers", user.uid), {
      status: newStatus,
    });
    setStatus(newStatus);
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">📋 Print Orders</h2>
        <button
          onClick={() => signOut(auth)}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* ✅ Availability Toggle Section */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold mb-2">🔌 Service Availability</h3>
        <button
          onClick={toggleStatus}
          className={`px-4 py-2 rounded text-white ${
            status === "Available" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {status === "Available" ? "Turn OFF Service" : "Turn ON Service"}
        </button>
        <p className="mt-2 text-gray-700">
          Current Status: <strong>{status}</strong>
        </p>
      </div>

      {/* ✅ Orders Section */}
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow p-4 border border-gray-200"
            >
              <div className="mb-2">
                <strong>Student:</strong> {order.studentName || "Unknown"}
              </div>
              <div className="mb-2">
                <strong>Status:</strong>{" "}
                <span className="text-blue-600 font-semibold">
                  {order.status}
                </span>
              </div>
              <div className="mb-2">
                <strong>Pickup Code:</strong>{" "}
                <code>{order.pickupCode || "N/A"}</code>
              </div>
              <div className="mb-4">
                <strong>File:</strong>{" "}
                <a
                  href={order.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View / Download
                </a>
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-yellow-400 text-white px-3 py-1 rounded"
                  onClick={() => updateOrderStatus(order.id, "In Queue")}
                >
                  In Queue
                </button>
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => updateOrderStatus(order.id, "Printing")}
                >
                  Printing
                </button>
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => updateOrderStatus(order.id, "Ready")}
                >
                  Ready
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
