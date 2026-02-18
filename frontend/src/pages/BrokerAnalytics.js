import { useEffect, useState } from "react";
import { BASE_URL } from "../api";
import { getToken } from "../auth";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function BrokerAnalytics() {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);

    fetch(`${BASE_URL}/api/broker/analytics/?period=${period}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setStats(null);
        setLoading(false);
      });
  }, [navigate, period]);

  if (loading) {
    return (
      <div className="pt-28 text-center text-yellow-500 text-xl">
        Loading Analytics...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="pt-28 text-center text-red-500 text-xl">
        Failed to load analytics.
      </div>
    );
  }

  const viewTrend = stats?.view_trend || [];
  const inquiryTrend = stats?.inquiry_trend || [];

  const chartData = {
    labels: viewTrend.map((item) =>
      new Date(item.period).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Views",
        data: viewTrend.map((item) => item.count),
        backgroundColor: "#facc15",
      },
      {
        label: "Inquiries",
        data: inquiryTrend.map((item) => item.count),
        backgroundColor: "#000000",
      },
    ],
  };

  return (
    <div className="pt-28 px-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-10">Broker CRM Dashboard</h1>

      {/* PERIOD TOGGLE */}
      <div className="mb-8 flex gap-4">
        {["daily", "weekly", "monthly"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded ${
              period === p
                ? "bg-black text-white"
                : "bg-yellow-500 text-white"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <Stat title="Properties" value={stats.total_properties} />
        <Stat title="Inquiries" value={stats.total_inquiries} />
        <Stat title="Views" value={stats.total_views} />
        <Stat title="Conversion %" value={stats.conversion_rate + "%"} />
      </div>

      {/* TOP PROPERTY */}
      {stats?.top_property && (
        <div className="bg-white p-6 rounded-xl shadow mb-10">
          <h2 className="text-xl font-bold mb-2">Top Performing Property</h2>
          <p className="font-semibold">{stats.top_property.title}</p>
          <p className="text-yellow-500">
            {stats.top_property.views} views
          </p>
        </div>
      )}

      {/* RECENT INQUIRIES */}
      {stats?.recent_inquiries && (
        <div className="bg-white p-6 rounded-xl shadow mb-10">
          <h2 className="text-xl font-bold mb-4">Recent Inquiries</h2>
          {stats.recent_inquiries.map((inq) => (
            <div key={inq.id} className="border-b py-2">
              <p className="font-semibold">{inq.name}</p>
              <p className="text-gray-500 text-sm">
                {inq.property_title}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* PERFORMANCE CHART */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Performance Trend</h2>
        <Bar data={chartData} />
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-yellow-400 text-white p-6 rounded-xl shadow">
      <p>{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );
}

export default BrokerAnalytics;
