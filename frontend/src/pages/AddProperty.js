import { useState, useEffect } from "react";
import { BASE_URL } from "../api";
import { getToken } from "../auth";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ================= FIX LEAFLET ICON ================= */

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

/* ================= MAP CLICK PICKER ================= */

function LocationPicker({ setForm }) {
  useMapEvents({
    click(e) {
      setForm((prev) => ({
        ...prev,
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      }));
    },
  });
  return null;
}

/* ================= MAIN COMPONENT ================= */

function AddProperty() {
  const [form, setForm] = useState({
    purpose: "buy", // ✅ Default Buy
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  /* ================= AUTH + EDIT FETCH ================= */

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    // Check broker
    fetch(`${BASE_URL}/api/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.is_broker) navigate("/");
      });

    // Edit Mode
    if (isEdit) {
      fetch(`${BASE_URL}/api/properties/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setForm({
            ...data,
            purpose: data.purpose || "buy",
            latitude: data.latitude || "",
            longitude: data.longitude || "",
          });
        })
        .catch(() => navigate("/my-properties"));
    }
  }, [id, isEdit, navigate]);

  /* ================= SUBMIT ================= */

const handleSubmit = async () => {
  setLoading(true);
  const token = getToken();
  const data = new FormData();

  Object.keys(form).forEach((key) => {
    const value = form[key];

    if (
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      // ✅ If array (like amenities)
      if (Array.isArray(value)) {
        value.forEach((v) => {
          data.append(key, v);
        });
      } else {
        data.append(key, value);
      }
    }
  });

  // ✅ Multiple images
  images.forEach((img) => {
    data.append("uploaded_images", img);
  });

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

  const responseData = await res.json();

  if (!res.ok) {
    console.log("SERVER ERROR:", responseData);
    alert("Error saving property");
    setLoading(false);
    return;
  }

  navigate("/my-properties");
};



  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-100 py-24 px-4">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl p-10 space-y-10">

        <h2 className="text-3xl font-bold text-gray-800">
          {isEdit ? "Edit Property" : "Add New Property"}
        </h2>

        {/* ================= BASIC INFO ================= */}

        <Section title="Basic Information">
          <Input
            label="Title"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
          />

          <Textarea
            label="Description"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
          />

          <Input
            label="Price (₹)"
            type="number"
            value={form.price}
            onChange={(v) => setForm({ ...form, price: v })}
          />

          <Input
            label="Location Name"
            value={form.location}
            onChange={(v) => setForm({ ...form, location: v })}
          />
        </Section>

        {/* ================= PROPERTY DETAILS ================= */}

        <Section title="Property Details">
          <Select
            label="Property Type"
            value={form.property_type}
            onChange={(v) =>
              setForm({ ...form, property_type: v })
            }
            options={[
              { value: "apartment", label: "Apartment" },
              { value: "house", label: "House" },
              { value: "villa", label: "Villa" },
              { value: "plot", label: "Plot" },
            ]}
          />

          <Input
            label="Bedrooms"
            type="number"
            value={form.bedrooms}
            onChange={(v) => setForm({ ...form, bedrooms: v })}
          />

          <Input
            label="Bathrooms"
            type="number"
            value={form.bathrooms}
            onChange={(v) => setForm({ ...form, bathrooms: v })}
          />

          <Input
            label="Area (sqft)"
            type="number"
            value={form.area}
            onChange={(v) => setForm({ ...form, area: v })}
          />

          {/* ✅ BUY / RENT FIELD */}
          <Select
            label="Purpose"
            value={form.purpose}
            onChange={(v) => setForm({ ...form, purpose: v })}
            options={[
              { value: "buy", label: "Buy" },
              { value: "rent", label: "Rent" },
            ]}
          />
        </Section>

        {/* ================= MAP ================= */}

        <Section title="Geo Location (Click on Map)">
          <div className="h-80 rounded-xl overflow-hidden">
            <MapContainer
              center={[19.076, 72.8777]}
              zoom={13}
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker setForm={setForm} />
              {form.latitude && form.longitude && (
                <Marker
                  position={[form.latitude, form.longitude]}
                />
              )}
            </MapContainer>
          </div>

          {form.latitude && (
            <div className="text-sm text-gray-600 mt-2">
              Selected: {form.latitude}, {form.longitude}
            </div>
          )}
        </Section>

        {/* ================= IMAGES ================= */}

        <Section title="Images">
          <input
            type="file"
            onChange={(e) =>
              setForm({ ...form, image: e.target.files[0] })
            }
          />
          <input
            type="file"
            multiple
            onChange={(e) =>
              setImages([...e.target.files])
            }
          />
        </Section>

        {/* ================= AVAILABILITY ================= */}

        <Section title="Availability">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_available || false}
              onChange={(e) =>
                setForm({
                  ...form,
                  is_available: e.target.checked,
                })
              }
            />
            Available
          </label>
        </Section>

        {/* ================= SUBMIT ================= */}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
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

/* ================= REUSABLE COMPONENTS ================= */

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-700">
        {title}
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm text-gray-500 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <div className="md:col-span-2">
      <label className="block text-sm text-gray-500 mb-1">
        {label}
      </label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg p-3 h-28 focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

/* ✅ SAFE SELECT (No more .map crash) */
function Select({
  label,
  value,
  onChange,
  options = [],
}) {
  return (
    <div>
      <label className="block text-sm text-gray-500 mb-1">
        {label}
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg p-3"
      >
        <option value="">Select</option>

        {options?.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default AddProperty;
