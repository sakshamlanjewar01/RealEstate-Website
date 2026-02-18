import { useEffect, useState } from "react";
import { BASE_URL } from "../api";
import { getToken } from "../auth";
import PropertyCard from "../components/PropertyCard";
import { useNavigate } from "react-router-dom";

function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${BASE_URL}/api/wishlist/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : [];

        // filter invalid properties
        const clean = list.filter((item) => item.property && item.property.id);

        setItems(clean);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-white min-h-screen pt-28 px-6 text-gray-800">
      <div className="max-w-4xl mx-auto text-center mb-14">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-500 tracking-widest">
          My Wishlist
        </h1>
      </div>

      {loading ? (
        <div className="text-center text-yellow-500 text-xl">
          Loading your wishlist...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center mt-20">
          <h2 className="text-2xl font-semibold text-gray-600">
            ❤️ No saved properties yet
          </h2>

          <button
            onClick={() => navigate("/properties")}
            className="mt-8 px-8 py-3 bg-yellow-500 text-white font-semibold rounded-md"
          >
            Explore Properties
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {items.map((item) => (
            <PropertyCard key={item.property.id} property={item.property} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
