import { useState, useEffect } from "react";
import { BASE_URL } from "../api";
import { getToken } from "../auth";
import { useNavigate, useParams } from "react-router-dom";

function AddProperty() {
  const [form, setForm] = useState({});
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    // 🔐 Check broker
    fetch(`${BASE_URL}/api/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.is_broker) navigate("/");
      });

    // 📝 Edit Mode
    if (isEdit) {
      fetch(`${BASE_URL}/api/properties/${id}/`)
        .then((res) => res.json())
        .then((data) => {
          const cleanedData = {
            ...data,
            amenities: data.amenities
              ? data.amenities.map((a) =>
                  typeof a === "object" ? a.id : a
                )
              : [],
          };

          setForm(cleanedData);
        })
        .catch(() => navigate("/my-properties"));
    }
  }, [id, isEdit, navigate]);

  const handleSubmit = async () => {
    setLoading(true);

    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    const data = new FormData();

    // ✅ ONLY ALLOWED FIELDS (FIXES 500 ERROR)
    const allowedFields = [
      "title",
      "description",
      "price",
      "location",
      "property_type",
      "bedrooms",
      "bathrooms",
      "area",
      "is_available",
      "latitude",
      "longitude",
      "amenities",
      "image",
    ];

    allowedFields.forEach((key) => {
  if (form[key] !== null && form[key] !== undefined) {

    // 🔥 DO NOT SEND IMAGE URL STRING
    if (key === "image") {
      if (form.image instanceof File) {
        data.append("image", form.image);
      }
      return;
    }

    if (Array.isArray(form[key])) {
      form[key].forEach((value) => {
        data.append(key, value);
      });
    } else {
      data.append(key, form[key]);
    }
  }
});


    // ✅ MULTIPLE IMAGE UPLOAD
    images.forEach((img) => {
      data.append("uploaded_images", img);
    });

    try {
      const res = await fetch(
        `${BASE_URL}/api/properties/${isEdit ? id + "/" : ""}`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      if (!res.ok) {
        // ✅ SAFE ERROR HANDLING (NO JSON CRASH)
        const text = await res.text();
        console.log("Backend Error:", text);
        alert("Error: " + text);
        setLoading(false);
        return;
      }

      navigate("/my-properties");
    } catch (error) {
      console.error(error);
      alert("Something went wrong while saving property.");
    }

    setLoading(false);
  };

  return (
    <div className="bg-white min-h-screen pt-28 px-6">
      <div className="max-w-3xl mx-auto bg-white shadow-2xl p-10 rounded-xl">
        <h2 className="text-3xl font-bold text-yellow-500 mb-8 text-center">
          {isEdit ? "Edit Property" : "Add Property"}
        </h2>

        <input
          className="input"
          placeholder="Title"
          value={form.title || ""}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          className="input"
          placeholder="Description"
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          type="number"
          className="input"
          placeholder="Price"
          value={form.price || ""}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input
          className="input"
          placeholder="Location"
          value={form.location || ""}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />

        <select
          className="input"
          value={form.property_type || ""}
          onChange={(e) =>
            setForm({ ...form, property_type: e.target.value })
          }
        >
          <option value="">Property Type</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="villa">Villa</option>
          <option value="plot">Plot</option>
        </select>

        <input
          type="number"
          className="input"
          placeholder="Bedrooms"
          value={form.bedrooms || ""}
          onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
        />

        <input
          type="number"
          className="input"
          placeholder="Bathrooms"
          value={form.bathrooms || ""}
          onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
        />

        <input
          type="number"
          className="input"
          placeholder="Area (sqft)"
          value={form.area || ""}
          onChange={(e) => setForm({ ...form, area: e.target.value })}
        />

        <input
          type="file"
          className="mb-4"
          onChange={(e) =>
            setForm({ ...form, image: e.target.files[0] })
          }
        />

        <input
          type="file"
          multiple
          className="mb-6"
          onChange={(e) => setImages([...e.target.files])}
        />

        <label className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            checked={form.is_available || false}
            onChange={(e) =>
              setForm({ ...form, is_available: e.target.checked })
            }
          />
          Available
        </label>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-black transition"
        >
          {loading
            ? "Saving..."
            : isEdit
            ? "Update Property"
            : "Add Property"}
        </button>
      </div>
    </div>
  );
}

export default AddProperty;
