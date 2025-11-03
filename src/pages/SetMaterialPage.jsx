import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { listAll, getDownloadURL, ref } from "firebase/storage";
import { db, storage, auth } from "../firebase/config";

const SetMaterialPage = () => {
  const [materialName, setMaterialName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [materials, setMaterials] = useState([]);
  const [availableImages, setAvailableImages] = useState([]);

  useEffect(() => {
    fetchMaterialList();
    fetchAvailableImages();
  }, []);

  const fetchMaterialList = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "materials"), where("shopId", "==", user.uid));
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    setMaterials(items);
  };

  const fetchAvailableImages = async () => {
    const folderRef = ref(storage, "materials/");
    const res = await listAll(folderRef);
    const urls = await Promise.all(
      res.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return { name: itemRef.name, url };
      })
    );
    setAvailableImages(urls);
  };

  const handleSubmit = async () => {
    if (!materialName || !price || !selectedImageUrl) {
      alert("Please fill all fields");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("User not logged in.");
      return;
    }

    const shopId = user.uid;

    await addDoc(collection(db, "materials"), {
      shopId,
      name: materialName,
      price: parseInt(price),
      available: true,
      imageUrl: selectedImageUrl,
      createdAt: new Date(),
    });

    alert("Material added successfully!");
    setMaterialName("");
    setPrice("");
    setSelectedImageUrl("");
    fetchMaterialList();
  };

  const toggleAvailability = async (material) => {
    const materialRef = doc(db, "materials", material.id);
    await updateDoc(materialRef, {
      available: !material.available,
    });
    fetchMaterialList();
  };

  const deleteMaterial = async (materialId) => {
    const materialRef = doc(db, "materials", materialId);
    await deleteDoc(materialRef);
    fetchMaterialList();
  };

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4 text-blue-600">📦 Add Material</h2>

      <div className="grid gap-4 mb-6 md:grid-cols-2">
        <input
          type="text"
          placeholder="Material Name"
          className="border p-2 rounded"
          value={materialName}
          onChange={(e) => setMaterialName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price (₹)"
          className="border p-2 rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* Dropdown with image previews */}
        <div className="md:col-span-2">
          <label className="block font-medium mb-1">Choose Image:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {availableImages.map((img) => (
              <div
                key={img.name}
                className={`cursor-pointer border rounded p-1 ${
                  selectedImageUrl === img.url ? "border-blue-500" : "border-gray-300"
                }`}
                onClick={() => setSelectedImageUrl(img.url)}
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-24 object-cover rounded"
                />
                <p className="text-xs text-center truncate mt-1">{img.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
        onClick={handleSubmit}
      >
        ✅ Add Material
      </button>

      <h3 className="text-lg font-semibold mt-10 mb-4 text-indigo-500">
        🗂️ Materials List
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        {materials.map((material) => (
          <div
            key={material.id}
            className="border rounded shadow p-4 flex flex-col items-center bg-white"
          >
            <img
              src={material.imageUrl}
              alt={material.name}
              className="w-24 h-24 object-cover rounded mb-2"
            />
            <h4 className="text-md font-medium">{material.name}</h4>
            <p className="text-sm text-gray-600">₹{material.price}</p>
            <p
              className={`text-xs mt-1 font-semibold ${
                material.available ? "text-green-500" : "text-red-500"
              }`}
            >
              {material.available ? "Available" : "Unavailable"}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                className="text-sm bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded"
                onClick={() => toggleAvailability(material)}
              >
                Toggle
              </button>
              <button
                className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white"
                onClick={() => deleteMaterial(material.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SetMaterialPage;
