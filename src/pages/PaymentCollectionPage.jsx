import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function PaymentCollectionPage({ user }) {
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [orders, setOrders] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [fromDate, toDate]);

  const fetchOrders = async () => {
    const q = query(
      collection(db, "orders"),
      where("shopId", "==", user.uid),
      where("timestamp", ">=", Timestamp.fromDate(new Date(fromDate))),
      where("timestamp", "<=", Timestamp.fromDate(new Date(toDate)))
    );

    const snapshot = await getDocs(q);
    let total = 0;
    const fetched = snapshot.docs.map((doc) => {
      const data = doc.data();
      total += data.totalPrice || 0;
      return {
        ...data,
        id: doc.id,
      };
    });

    setOrders(fetched);
    setTotalEarnings(total);
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Payment Collection</h1>

      <div className="flex space-x-4 items-center">
        <div>
          <p className="text-sm">From</p>
          <DatePicker
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <p className="text-sm">To</p>
          <DatePicker
            selected={toDate}
            onChange={(date) => setToDate(date)}
            className="border p-2 rounded"
          />
        </div>
      </div>

      <div className="bg-blue-100 p-4 rounded-lg shadow">
        <p className="text-lg font-semibold">Total Requests: {orders.length}</p>
        <p className="text-lg font-semibold">Total Earnings: ₹{totalEarnings}</p>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-gray-200 p-3 rounded-lg shadow-sm bg-white"
          >
            <p><b>Amount:</b> ₹{order.totalPrice}</p>
            <p><b>Time:</b> {new Date(order.timestamp?.toDate()).toLocaleString()}</p>
            <p><b>Status:</b> {order.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PaymentCollectionPage;
