import { useEffect, useState } from "react";
import PropertyCard from "../components/PropertyCard";
import { BASE_URL } from "../api";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [type, setType] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setLoading(true);

    fetch(
      `${BASE_URL}/api/properties/?page=${page}&search=${search}&min_price=${minPrice}&max_price=${maxPrice}&type=${type}&bedrooms=${bedrooms}&ordering=${ordering}`,
    )
      .then((res) => res.json())
      .then((data) => {
        setProperties(data.results || []);
        setPagination(data);
        setLoading(false);
      });
  }, [search, minPrice, maxPrice, type, bedrooms, ordering, page]);

  return (
    <div className="bg-white min-h-screen pt-28 px-6 text-gray-800">
      <div className="max-w-6xl mx-auto text-center mb-14">
        <h1 className="text-4xl font-bold text-yellow-500">
          Explore Properties
        </h1>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-6 mb-14">
        <div className="grid md:grid-cols-6 gap-4">
          <input
            placeholder="Search"
            onChange={(e) => setQuery(e.target.value)}
            className="border p-3 rounded-lg"
          />

          <input
            placeholder="Min Price"
            onChange={(e) => setMinPrice(e.target.value)}
            className="border p-3 rounded-lg"
          />

          <input
            placeholder="Max Price"
            onChange={(e) => setMaxPrice(e.target.value)}
            className="border p-3 rounded-lg"
          />

          <select
            onChange={(e) => setType(e.target.value)}
            className="border p-3 rounded-lg"
          >
            <option value="">Type</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
          </select>

          <select
            onChange={(e) => setBedrooms(e.target.value)}
            className="border p-3 rounded-lg"
          >
            <option value="">Bedrooms</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4+</option>
          </select>

          <select
            onChange={(e) => setOrdering(e.target.value)}
            className="border p-3 rounded-lg"
          >
            <option value="">Sort By</option>
            <option value="price">Price Low → High</option>
            <option value="-price">Price High → Low</option>
            <option value="-created_at">Newest</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-yellow-500 text-xl">Loading...</div>
      ) : (
        <>
          <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-6 mt-10">
            {pagination.previous && (
              <button
                onClick={() => setPage(page - 1)}
                className="px-6 py-2 bg-gray-200 rounded"
              >
                Previous
              </button>
            )}

            {pagination.next && (
              <button
                onClick={() => setPage(page + 1)}
                className="px-6 py-2 bg-yellow-500 text-white rounded"
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

export default Properties;
