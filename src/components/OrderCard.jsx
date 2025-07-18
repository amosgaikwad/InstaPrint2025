import React from 'react';

const OrderCard = ({ order, onStatusChange, onDownload }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4 border">
      <h2 className="text-lg font-semibold text-gray-800">🆔 Order ID: {order.id}</h2>
      <p className="text-gray-600"><strong>Student:</strong> {order.studentName || "Unknown"}</p>
      <p className="text-gray-600"><strong>Status:</strong> {order.status}</p>

      <div className="mt-3 flex items-center gap-4">
        <button
          onClick={() => onDownload(order)}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition"
        >
          Download File
        </button>

        <select
          value={order.status}
          onChange={(e) => onStatusChange(order.id, e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option>In Queue</option>
          <option>Printing</option>
          <option>Ready</option>
        </select>
      </div>
    </div>
  );
};

export default OrderCard;
