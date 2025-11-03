import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase/config";

export default function RequestData() {
  const { shopId, reqId } = useParams();
  const navigate = useNavigate();

  const [requestData, setRequestData] = useState(null);
  const [extraMaterials, setExtraMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optionImages, setOptionImages] = useState({});

  const fetchOptionImages = async () => {
    const types = ["color", "staple", "punch", "binding", "double_sided"];
    const promises = types.map(async (type) => {
      const url = await getDownloadURL(ref(storage, `options/${type}.png`));
      return { [type]: url };
    });

    const results = await Promise.all(promises);
    const imageMap = Object.assign({}, ...results);
    setOptionImages(imageMap);
  };

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const refDoc = doc(db, "shopkeepers", shopId, "print_requests", reqId);
        const snap = await getDoc(refDoc);

        if (snap.exists()) {
          const data = snap.data();
          setRequestData(data);

          if (Array.isArray(data.extraMaterials) && data.extraMaterials.length > 0) {
            const q = query(
              collection(db, "materials"),
              where("__name__", "in", data.extraMaterials.map((mat) => mat.id || mat))
            );
            const matSnap = await getDocs(q);
            const materialList = matSnap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setExtraMaterials(materialList);
          }
        } else {
          console.error("Request not found");
        }
      } catch (error) {
        console.error("Error fetching request:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptionImages().then(fetchRequest);
  }, [shopId, reqId]);

  const intOrZero = (val) => {
    const x = parseInt(val);
    return isNaN(x) ? 0 : x;
  };

  const renderOptionBox = (key, label) => (
    <div className="border rounded-lg p-2 flex flex-col items-center shadow bg-white">
      <img
        src={optionImages[key]}
        alt={label}
        className="h-12 w-12 object-contain mb-1"
      />
      <span className="text-xs text-center">{label}</span>
    </div>
  );

  // 🔹 Status Toggle Handler
  const handleStatusToggle = async () => {
    if (!requestData) return;

    let newStatus = "Pending";
    if (requestData.status === "Pending") newStatus = "Printing";
    else if (requestData.status === "Printing") newStatus = "Done!";
    else newStatus = "Pending"; // loop back if clicked again

    try {
      const refDoc = doc(db, "shopkeepers", shopId, "print_requests", reqId);
      await updateDoc(refDoc, { status: newStatus });
      setRequestData((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // 🔹 Delete Request Handler
  const handleDeleteRequest = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this request? This action cannot be undone."
      )
    )
      return;

    try {
      // Optionally delete files in Storage
      if (Array.isArray(requestData.batches)) {
        for (const batch of requestData.batches) {
          if (batch.fileUrl) {
            const fileRef = ref(storage, batch.fileUrl.split("/o/")[1].split("?")[0]);
            await deleteObject(fileRef).catch(() => {
              console.warn("Could not delete file:", batch.fileUrl);
            });
          }
        }
      }

      await deleteDoc(doc(db, "shopkeepers", shopId, "print_requests", reqId));
      alert("Request deleted successfully!");
      navigate(-1); // go back to previous page (NewRequests list)
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("Failed to delete request. Check console for details.");
    }
  };

  if (loading)
    return <p className="text-center mt-8 text-gray-500">Loading...</p>;
  if (!requestData)
    return (
      <p className="text-center mt-8 text-red-500">Request not found.</p>
    );

  // 🔹 Dynamic button colors
  const statusColors = {
    Pending: "bg-yellow-500 hover:bg-yellow-600",
    Printing: "bg-blue-500 hover:bg-blue-600",
    "Done!": "bg-green-600 hover:bg-green-700",
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

        {/* 🔹 Big Order ID Box */}
        <div className="flex justify-between items-center mb-6">
          <div className="bg-indigo-100 border-2 border-indigo-600 text-indigo-800 font-bold text-2xl px-6 py-4 rounded-lg shadow">
            Order ID: <span className="text-3xl">{reqId}</span>
          </div>

          {/* 🔹 Big Status Button */}
          <button
            onClick={handleStatusToggle}
            className={`text-white font-bold px-6 py-4 rounded-lg shadow-lg text-xl transition ${
              statusColors[requestData.status ?? "Pending"]
            }`}
          >
            {requestData.status ?? "Pending"}
          </button>
        </div>

        {/* 🔹 Delete Button */}
        <button
          onClick={handleDeleteRequest}
          className="mb-6 bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-lg shadow"
        >
          🗑️ Delete Request
        </button>

        <p>
          <strong>Student:</strong> {requestData.userName || "Unknown"}
        </p>
        <p>
          <strong>Submitted:</strong>{" "}
          {requestData.timestamp
            ? new Date(requestData.timestamp.seconds * 1000).toLocaleString()
            : "Unknown"}
        </p>
        <p>
          <strong>Status:</strong> {requestData.status ?? "Pending"}
        </p>

        {/* Batches */}
        <section className="mt-6">
          <h3 className="text-xl font-semibold mb-3">🗂️ Files / Batches</h3>
          {Array.isArray(requestData.batches) &&
          requestData.batches.length > 0 ? (
            requestData.batches.map((batch, idx) => (
              <div key={idx} className="border rounded-lg p-4 mb-6 bg-gray-50">
                <h4 className="text-lg font-bold mb-2">
                  📄 Batch {idx + 1}: {batch.fileName}
                </h4>
                <a
                  href={batch.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm mb-2 inline-block"
                >
                  View / Download PDF
                </a>
                <p>
                  <strong>Pages:</strong> {batch.pages}
                </p>
                <p>
                  <strong>Copies:</strong> {batch.copies}
                </p>
                <p>
                  <strong>Price:</strong> ₹{batch.price}
                </p>
                <p>
                  <strong>Print Type:</strong> {batch.printType}
                </p>

                {/* Icon-based Display */}
                <div className="mt-4">
                  <h5 className="text-md font-semibold mb-2">
                    ⚙️ Print Settings (Visual)
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {batch.color === "Color" && renderOptionBox("color", "Color")}
                    {batch.staple && renderOptionBox("staple", "Staple")}
                    {batch.punch && renderOptionBox("punch", "Punch")}
                    {batch.binding && renderOptionBox("binding", "Binding")}
                    {batch.doubleSided &&
                      renderOptionBox("double_sided", "Double-Sided")}
                  </div>
                </div>

                {/* Manual Page Settings */}
                {Array.isArray(batch.manualPages) && batch.manualPages.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-md font-semibold mb-2">
                      🖨️ Manual Page Settings
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {batch.manualPages.map((pageSetting, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg shadow p-2 text-center text-white ${
                            pageSetting.color === "Color"
                              ? "bg-red-500"
                              : "bg-gray-600"
                          }`}
                        >
                          <div className="text-md font-bold">Page {pageSetting.page}</div>
                          <div className="text-sm">📄 {pageSetting.color}</div>
                          <div className="text-sm">🧾 {pageSetting.count} copies</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600 italic">No batches uploaded.</p>
          )}
        </section>

        {/* Extra Materials */}
        {extraMaterials.length > 0 && (
          <section className="mt-6">
            <h3 className="text-lg font-semibold mb-3">🧰 Extra Materials Used</h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {extraMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-white shadow rounded p-3 border flex flex-col items-center"
                >
                  <img
                    src={mat.imageUrl}
                    alt={mat.name}
                    className="w-24 h-24 object-cover rounded mb-2"
                  />
                  <div className="text-center">
                    <div className="font-medium">{mat.name}</div>
                    <div className="text-sm text-gray-600">₹{mat.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Summary */}
        <div className="mt-8 border-t pt-4 space-y-2 text-sm">
          <div>
            <strong>Total Price (including materials):</strong> ₹
            {intOrZero(requestData.totalPrice)}
          </div>
        </div>
      </div>
    </div>
  );
}
