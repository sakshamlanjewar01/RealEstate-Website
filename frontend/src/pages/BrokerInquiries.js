import { useEffect, useState } from "react";
import { BASE_URL } from "../api";
import { getToken } from "../auth";
import { useNavigate, Link } from "react-router-dom";

function BrokerInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) return navigate("/login");

    fetch(`${BASE_URL}/api/broker/inquiries/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
          ? data.results
          : [];

        setInquiries(list);
        setFiltered(list);
        setLoading(false);
      });
  }, [navigate]);

  useEffect(() => {
    let temp = [...inquiries];

    if (search) {
      temp = temp.filter(
        (inq) =>
          inq.name.toLowerCase().includes(search.toLowerCase()) ||
          inq.property_title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      temp = temp.filter((inq) => inq.status === statusFilter);
    }

    setFiltered(temp);
  }, [search, statusFilter, inquiries]);

  const updateStatus = async (id, status) => {
    await fetch(`${BASE_URL}/api/inquiry/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status }),
    });

    setInquiries((prev) =>
      prev.map((inq) =>
        inq.id === id ? { ...inq, status } : inq
      )
    );
  };

  const total = inquiries.length;
  const newCount = inquiries.filter(i => i.status === "new").length;
  const replied = inquiries.filter(i => i.status === "replied").length;
  const closed = inquiries.filter(i => i.status === "closed").length;

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-indigo-600 text-xl">
        Loading inquiries...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-28 px-4">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-gray-800">
          Inquiry Management
        </h1>
        <p className="text-gray-500 mt-1">
          Manage and respond to customer inquiries
        </p>
      </div>

      {/* STATS */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total" value={total} />
        <StatCard label="New" value={newCount} color="yellow" />
        <StatCard label="Replied" value={replied} color="green" />
        <StatCard label="Closed" value={closed} color="red" />
      </div>

      {/* FILTERS */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 mb-10">
        <input
          placeholder="Search by name or property..."
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 border p-3 rounded-lg"
        />

        <select
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-3 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="replied">Replied</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          No inquiries found.
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-6">
          {filtered.map((inq) => (
            <div
              key={inq.id}
              className="bg-white shadow-md rounded-2xl p-6 hover:shadow-xl transition"
            >
              <div className="flex justify-between items-center mb-3">
                <Link
                  to={`/property/${inq.property}`}
                  className="font-semibold text-lg text-indigo-600"
                >
                  {inq.property_title}
                </Link>

                <StatusBadge status={inq.status} />
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>👤 {inq.name}</p>
                <p>📧 {inq.email}</p>
                <p>📞 {inq.phone}</p>
              </div>

              <p className="mt-4 text-gray-700">
                {inq.message}
              </p>

              <div className="mt-5 flex gap-3">
                {inq.status !== "replied" && (
                  <button
                    onClick={() => updateStatus(inq.id, "replied")}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    Mark Replied
                  </button>
                )}

                {inq.status !== "closed" && (
                  <button
                    onClick={() => updateStatus(inq.id, "closed")}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
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

function StatusBadge({ status }) {
  const styles = {
    new: "bg-yellow-100 text-yellow-600",
    replied: "bg-green-100 text-green-600",
    closed: "bg-red-100 text-red-600",
  };

  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status?.toUpperCase()}
    </span>
  );
}

export default BrokerInquiries;
