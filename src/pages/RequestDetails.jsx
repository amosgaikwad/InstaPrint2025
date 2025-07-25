import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function RequestDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.request;

  if (!order) {
    return <p>Request details not available.</p>;
  }

  const settings = order.perPageSettings || [];

  const intOrZero = val => {
    const x = parseInt(val);
    return isNaN(x) ? 0 : x;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 underline hover:text-blue-800"
      >
        ← Back
      </button>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">📄 Request Details</h2>
        <p><strong>ID:</strong> <code>{order.id}</code></p>
        <p><strong>Student:</strong> {order.studentName || "Unknown"}</p>
        <p><strong>Submitted:</strong> {order.timestamp ? new Date(order.timestamp.seconds * 1000).toLocaleString() : "Unknown"}</p>
        <p><strong>Status:</strong> {order.status}</p>

        <div className="mt-4">
          <strong>File:</strong>{" "}
          <a
            href={order.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            View / Download
          </a>
        </div>

        <section className="mt-6">
          <h3 className="text-lg font-semibold mb-3">🖨️ Manual Print Page Settings</h3>

          {settings.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {settings.map((s, idx) => {
                const isColor = s.type === "Color";
                return (
                  <div
                    key={idx}
                    className={`rounded-lg shadow-md p-3 text-center text-white transition-all duration-300 ${
                      isColor ? "bg-red-500" : "bg-gray-600"
                    }`}
                  >
                    <div className="text-lg font-bold">Page {s.page}</div>
                    <div className="text-sm">📄 {s.type}</div>
                    <div className="text-sm">🧾 {s.copies} copies</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic">No manual settings given.</p>
          )}
        </section>

        <div className="mt-6 border-t pt-4 space-y-2 text-sm">
          <div><strong>Total Pages:</strong> {order.pages ?? "N/A"}</div>
          <div><strong>Copies (default):</strong> {order.copies ?? "N/A"}</div>
          <div><strong>Print Type:</strong> {order.printType ?? "N/A"}</div>
          <div><strong>Color Option:</strong> {order.color ?? "N/A"}</div>
          <div><strong>Binding:</strong> {order.binding ? "Yes" : "No"}</div>
          <div><strong>Punch:</strong> {order.punch ? "Yes" : "No"}</div>
          <div><strong>Staple:</strong> {order.staple ? "Yes" : "No"}</div>
          <div className="text-lg font-semibold mt-2">
            💰 Total Price: ₹{intOrZero(order.price)}
          </div>
        </div>
      </div>
    </div>
  );
}
