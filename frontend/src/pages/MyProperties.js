import { useEffect, useState } from "react";
import { BASE_URL } from "../api";
import { getToken } from "../auth";
import { Link, useNavigate } from "react-router-dom";

function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    // 🔐 Check if user is broker
    fetch(`${BASE_URL}/api/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.is_broker) {
          navigate("/");
          return;
        }

        // 🏠 Fetch broker properties
        fetch(`${BASE_URL}/api/properties/?my_properties=true`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            setProperties(data.results || data);
            setLoading(false);
          })
          .catch(() => {
            setProperties([]);
            setLoading(false);
          });
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate]);

  const deleteProperty = async (id) => {
    const token = getToken();
    if (!token) return;

    await fetch(`${BASE_URL}/api/properties/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // ✅ Safe state update
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-yellow-500 text-xl">
        Loading your properties...
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-28 px-6">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto text-center mb-14">
        <h1 className="text-4xl font-bold text-yellow-500 tracking-widest">
          My Properties
        </h1>
        <p className="text-gray-500 mt-3">
          Manage your listings, update details, or mark them as sold.
        </p>
      </div>

      {/* EMPTY STATE */}
      {properties.length === 0 ? (
        <div className="text-center mt-20">
          <h2 className="text-2xl text-gray-600">No properties added yet</h2>

          <button
            onClick={() => navigate("/add-property")}
            className="mt-6 px-8 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-black transition"
          >
            Add Your First Property
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {properties.map((p) => (
            <div
              key={p.id}
              className="bg-white shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition"
            >
              {/* IMAGE */}
              {p.image && (
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-52 w-full object-cover"
                />
              )}

              {/* CONTENT */}
              <div className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{p.title}</h3>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      p.is_available
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {p.is_available ? "Available" : "Sold"}
                  </span>
                </div>

                <p className="text-gray-500 text-sm mb-2">📍 {p.location}</p>

                <p className="text-yellow-500 font-bold text-xl mb-4">
                  ₹{p.price}
                </p>

                {/* ACTIONS */}
                <div className="flex gap-3">
                  <Link
                    to={`/property/${p.id}`}
                    className="flex-1 text-center border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    View
                  </Link>

                  <Link
                    to={`/add-property/${p.id}`}
                    className="flex-1 text-center bg-yellow-500 text-white py-2 rounded-lg hover:bg-black transition"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => deleteProperty(p.id)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyProperties;
