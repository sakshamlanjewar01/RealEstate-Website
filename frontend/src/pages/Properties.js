import { useEffect, useState, useRef } from "react";
import PropertyCard from "../components/PropertyCard";
import { BASE_URL } from "../api";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  /* ================= FILTER STATE ================= */

const [filters, setFilters] = useState({
  search: "",
  min_price: 0,
  max_price: 10000000,
  type: "",
  bedrooms: "",
  ordering: "-created_at",
  location: "",
  purpose: "", // ✅ NEW
});



  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const abortControllerRef = useRef(null);

  /* ================= DEBOUNCE ================= */

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1); // reset page when filters change
    }, 500);

    return () => clearTimeout(timeout);
  }, [filters]);

  /* ================= FETCH PROPERTIES ================= */

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const params = new URLSearchParams();

        Object.entries(debouncedFilters).forEach(([key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
            params.append(key, value);
          }
        });

        params.append("page", page);

        const res = await fetch(
          `${BASE_URL}/api/properties/?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch properties");
        }

        const data = await res.json();

        setProperties(data.results || []);
        setPagination(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Fetch error:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedFilters, page]);

  /* ================= RESET ================= */

  const resetFilters = () => {
    setFilters({
      search: "",
      min_price: 0,
      max_price: 10000000,
      type: "",
      bedrooms: "",
      ordering: "-created_at",
      location: "",
    });
    setPage(1);
  };

  return (
    <div className="bg-gray-100 min-h-screen pt-24 px-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

        {/* ================= LEFT SIDEBAR ================= */}
        <div className="lg:w-1/4 bg-white p-6 rounded-2xl shadow-lg space-y-6 sticky top-28 h-fit">

          <h2 className="text-xl font-bold">Filters</h2>

          {/* Search */}
          <input
            placeholder="Search property..."
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="w-full border p-3 rounded-lg"
          />

          {/* Location */}
          <input
            placeholder="Mumbai, Pune..."
            value={filters.location}
            onChange={(e) =>
              setFilters({ ...filters, location: e.target.value })
            }
            className="w-full border p-3 rounded-lg"
          />
          <select
  value={filters.purpose}
  onChange={(e) =>
    setFilters({ ...filters, purpose: e.target.value })
  }
  className="w-full border p-3 rounded-lg"
>
  <option value="">Buy or Rent</option>
  <option value="buy">Buy</option>
  <option value="rent">Rent</option>
</select>


          {/* Price */}
          <div>
            <label className="text-sm text-gray-500">Max Price</label>
            <input
              type="range"
              min="0"
              max="20000000"
              step="50000"
              value={filters.max_price}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  max_price: Number(e.target.value),
                })
              }
              className="w-full mt-2"
            />
            <p className="text-sm mt-1">
              ₹{Number(filters.max_price).toLocaleString()}
            </p>
          </div>

          {/* Type */}
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters({ ...filters, type: e.target.value })
            }
            className="w-full border p-3 rounded-lg"
          >
            <option value="">All Types</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
          </select>

          {/* Bedrooms */}
          <select
            value={filters.bedrooms}
            onChange={(e) =>
              setFilters({ ...filters, bedrooms: e.target.value })
            }
            className="w-full border p-3 rounded-lg"
          >
            <option value="">Any Bedrooms</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>

          <button
            onClick={resetFilters}
            className="w-full bg-gray-200 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            Reset Filters
          </button>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="lg:w-3/4">

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {pagination.count || 0} Properties Found
            </h1>

            <select
              value={filters.ordering}
              onChange={(e) =>
                setFilters({ ...filters, ordering: e.target.value })
              }
              className="border p-2 rounded-lg"
            >
              <option value="-created_at">Newest</option>
              <option value="price">Price Low → High</option>
              <option value="-price">Price High → Low</option>
              <option value="-views_count">Most Popular</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center text-indigo-600 text-xl">
              Loading...
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              No properties found.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center gap-6 mt-10">
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

        </div>
      </div>
    </div>
  );
}

export default Properties;
