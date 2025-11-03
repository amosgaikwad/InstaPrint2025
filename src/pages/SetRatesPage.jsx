import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

function SetRatesPage() {
  const [rates, setRates] = useState({ color: "", bw: "", binding: "" });
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    const uid = auth.currentUser?.uid;
    const docRef = doc(db, "shopkeepers", uid);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      setRates({
        color: data.rates?.color_single_page_price || "",
        bw: data.rates?.bw_single_page_price || "",
        binding: data.rates?.binding_price || "",
      });
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    const uid = auth.currentUser?.uid;
    const docRef = doc(db, "shopkeepers", uid);
    await updateDoc(docRef, {
      rates: {
        color_single_page_price: parseInt(rates.color),
        bw_single_page_price: parseInt(rates.bw),
        binding_price: parseInt(rates.binding),
      },
      setrates: true,
    });
    alert("Rates updated!");
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-xl font-bold mb-4 text-center">Set Your Rates</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Color Page Price (₹)</label>
            <input
              type="number"
              value={rates.color}
              onChange={(e) => setRates({ ...rates, color: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">B/W Page Price (₹)</label>
            <input
              type="number"
              value={rates.bw}
              onChange={(e) => setRates({ ...rates, bw: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Binding Price (₹)</label>
            <input
              type="number"
              value={rates.binding}
              onChange={(e) => setRates({ ...rates, binding: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={handleUpdate}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            Save Rates
          </button>
        </div>
      )}
    </div>
  );
}

export default SetRatesPage;
