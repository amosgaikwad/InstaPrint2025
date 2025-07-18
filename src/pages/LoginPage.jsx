import React, { useState } from "react";
import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";


export default function LoginPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const navigate = useNavigate();

  const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);

        // 🌍 Reverse Geocode
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );
          const data = await res.json();
          const address = data.display_name;
          setLocation(address);
        } catch (error) {
          console.error("Reverse geocoding failed", error);
          alert("Could not retrieve address.");
        }
      },
      (error) => {
        alert("Location access denied or unavailable.");
        console.error(error);
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "shopkeepers", uid), {
        name,
        email,
        location,
        paymentId,
        latitude,
        longitude,
        registeredAt: new Date(),
        status: "Available",
        hasSetRates: false,
      });

      navigate("/SetRatesPage");
    } catch (error) {
      alert("Error registering shopkeeper: " + error.message);
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Register Shopkeeper</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Owner Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Shop Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Payment ID (UPI, PhonePe, etc)"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <button
          type="button"
          onClick={getLocation}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          📍 Get Current Location
        </button>

        {latitude && longitude && (
          <p className="text-sm text-gray-600">
            Location captured: <strong>{latitude}</strong>, <strong>{longitude}</strong>
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white px-4 py-2 rounded"
        >
          Register
        </button>
      </form>
    </div>
  );
}
