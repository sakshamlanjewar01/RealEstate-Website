import { useEffect, useState } from "react";
import { BASE_URL } from "../api";
import { getToken } from "../auth";
import { Link, useNavigate } from "react-router-dom";

function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const token = getToken();
    if (!token) return navigate("/login");

    fetch(`${BASE_URL}/api/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.is_broker) return navigate("/");

        fetch(
          `${BASE_URL}/api/properties/?my_properties=true&page=${page}&search=${search}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
          .then((res) => res.json())
          .then((data) => {
            setProperties(data.results || []);
            setPagination(data);
            setLoading(false);
          });
      });
  }, [search, page, navigate]);

  const deleteProperty = async (id) => {
    if (!window.confirm("Delete this property?")) return;

    const token = getToken();
    await fetch(`${BASE_URL}/api/properties/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

const toggleAvailability = async (property) => {
  const token = getToken();

  const formData = new FormData();
  formData.append("is_available", !property.is_available);

  await fetch(`${BASE_URL}/api/properties/${property.id}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      // ❌ DO NOT set Content-Type
    },
    body: formData,
  });

  setProperties((prev) =>
    prev.map((p) =>
      p.id === property.id
        ? { ...p, is_available: !p.is_available }
        : p
    )
  );
};


  const total = properties.length;
  const available = properties.filter(p => p.is_available).length;
  const sold = total - available;

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-indigo-600 text-xl">
        Loading your listings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-28 px-4">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-gray-800">
          My Property Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Manage, edit and track your property listings
        </p>
      </div>

      {/* STATS */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Total Listings" value={total} />
        <StatCard label="Available" value={available} color="green" />
        <StatCard label="Sold" value={sold} color="red" />
      </div>

      {/* SEARCH + ADD */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
        <input
          placeholder="Search property..."
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-96 border rounded-lg p-3"
        />

        <button
          onClick={() => navigate("/add-property")}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          + Add New Property
        </button>
      </div>

      {/* PROPERTIES GRID */}
      {properties.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          No properties found.
        </div>
      ) : (
        <>
          <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
              >
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-52 w-full object-cover"
                  />
                )}

                <div className="p-6 space-y-3">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-lg">{p.title}</h3>

                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        p.is_available
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {p.is_available ? "Available" : "Sold"}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm">
                    📍 {p.location}
                  </p>

                  <p className="text-indigo-600 font-bold text-xl">
                    ₹{p.price}
                  </p>

                  <div className="flex gap-2 pt-4">
                    <Link
                      to={`/property/${p.id}`}
                      className="flex-1 text-center border py-2 rounded-lg hover:bg-gray-100"
                    >
                      View
                    </Link>

                    <Link
                      to={`/add-property/${p.id}`}
                      className="flex-1 text-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => toggleAvailability(p)}
                      className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600"
                    >
                      {p.is_available ? "Mark Sold" : "Mark Available"}
                    </button>
                  </div>

                  <button
                    onClick={() => deleteProperty(p.id)}
                    className="w-full mt-3 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                  >
                    Delete Property
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          <div className="flex justify-center gap-6 mt-12">
            {pagination.previous && (
              <button
                onClick={() => setPage(page - 1)}
                className="px-6 py-2 bg-gray-200 rounded-lg"
              >
                Previous
              </button>
            )}

            {pagination.next && (
              <button
                onClick={() => setPage(page + 1)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Next
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color = "indigo" }) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-md border-l-4 border-${color}-500`}>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
    </div>
  );
}

export default MyProperties;
