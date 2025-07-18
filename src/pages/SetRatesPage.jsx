import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function SetRatesPage({ user }) {
  const navigate = useNavigate();
  const [rates, setRates] = useState({
    bw_single: "",
    bw_double: "",
    color_single: "",
    color_double: "",
    a3_color: "",
    a3_bw: "",
    binding: "",
  });

  useEffect(() => {
    const checkRates = async () => {
      try {
        const ref = doc(db, "shopkeepers", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().hasSetRates) {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Error checking rates:", err);
      }
    };
    if (user?.uid) {
      checkRates();
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setRates({ ...rates, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ref = doc(db, "shopkeepers", user.uid);
    await updateDoc(ref, {
      rates: {
        bw_single: Number(rates.bw_single),
        bw_double: Number(rates.bw_double),
        color_single: Number(rates.color_single),
        color_double: Number(rates.color_double),
        a3_color: Number(rates.a3_color),
        a3_bw: Number(rates.a3_bw),
        binding: Number(rates.binding),
      },
      hasSetRates: true,
    });
    navigate("/dashboard");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🧾 Set Your Printing Rates</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {[
          { label: "Single-side (B&W)", name: "bw_single" },
          { label: "Double-side (B&W)", name: "bw_double" },
          { label: "Single-side (Color)", name: "color_single" },
          { label: "Double-side (Color)", name: "color_double" },
          { label: "A3 Color", name: "a3_color" },
          { label: "A3 B&W", name: "a3_bw" },
          { label: "Binding rate", name: "binding" },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-1">
              {field.label} (₹)
            </label>
            <input
              type="number"
              name={field.name}
              value={rates[field.name]}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
        ))}

        <button
          type="submit"
          className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded"
        >
          Save Rates
        </button>
      </form>
    </div>
  );
}
