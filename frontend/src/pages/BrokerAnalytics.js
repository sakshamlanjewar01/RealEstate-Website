import { useEffect, useState, useRef, useMemo } from "react";
import { BASE_URL } from "../api";
import { getToken } from "../auth";
import { useNavigate } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
);

function BrokerAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [minViews, setMinViews] = useState("");
  const [minInquiries, setMinInquiries] = useState("");
  const [sortBy, setSortBy] = useState("");

  const navigate = useNavigate();
  const dashboardRef = useRef();

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);

    fetch(
      `${BASE_URL}/api/broker/analytics/?start=${startDate}&end=${endDate}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setStats(null);
        setLoading(false);
      });
  }, [navigate, startDate, endDate]);

  /* ---------------- PDF DOWNLOAD ---------------- */

  const downloadPDF = async () => {
    const element = dashboardRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("broker_analytics.pdf");
  };

  /* ---------------- EXCEL DOWNLOAD ---------------- */

  const downloadExcel = () => {
    if (!filteredRanking.length) return;

    const worksheet = XLSX.utils.json_to_sheet(filteredRanking);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analytics");
    XLSX.writeFile(workbook, "broker_analytics.xlsx");
  };

  /* ---------------- FILTER LOGIC ---------------- */

  const filteredRanking = useMemo(() => {
    if (!stats?.property_ranking) return [];

    let data = stats.property_ranking.map((item, index) => ({
      id: item.id || index,
      title: item.title || item.property_title || "Untitled",
      views: Number(item.views) || 0,
      inquiries: Number(item.inquiries) || 0,
    }));

    if (searchTitle)
      data = data.filter((p) =>
        p.title.toLowerCase().includes(searchTitle.toLowerCase())
      );

    if (minViews) data = data.filter((p) => p.views >= Number(minViews));
    if (minInquiries)
      data = data.filter((p) => p.inquiries >= Number(minInquiries));

    if (sortBy === "views") data.sort((a, b) => b.views - a.views);
    if (sortBy === "inquiries")
      data.sort((a, b) => b.inquiries - a.inquiries);

    return data;
  }, [stats, searchTitle, minViews, minInquiries, sortBy]);

  if (loading) {
    return (
      <div className="pt-28 text-center text-indigo-600 text-xl">
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

  const performanceChart = {
    labels: stats.view_trend?.map((i) =>
      new Date(i.period).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Views",
        data: stats.view_trend?.map((i) => i.count),
        backgroundColor: "#6366f1",
      },
      {
        label: "Inquiries",
        data: stats.inquiry_trend?.map((i) => i.count),
        backgroundColor: "#f59e0b",
      },
    ],
  };

  const conversionChart = {
    labels: ["Inquiries", "Remaining Views"],
    datasets: [
      {
        data: [
          stats.total_inquiries,
          stats.total_views - stats.total_inquiries,
        ],
        backgroundColor: ["#6366f1", "#e5e7eb"],
      },
    ],
  };

  return (
    <motion.div
      ref={dashboardRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`pt-28 px-6 min-h-screen transition ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-bold">
            Broker Performance Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            Track property performance & lead conversion
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Export PDF
          </button>

          <button
            onClick={downloadExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Export Excel
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Properties" value={stats.total_properties} />
        <StatCard title="Total Inquiries" value={stats.total_inquiries} />
        <StatCard title="Total Views" value={stats.total_views} />
        <StatCard
          title="Conversion Rate"
          value={stats.conversion_rate}
          suffix="%"
        />
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-10">
        <div className="grid md:grid-cols-6 gap-4">
          <input type="date" onChange={(e) => setStartDate(e.target.value)} className="border p-2 rounded"/>
          <input type="date" onChange={(e) => setEndDate(e.target.value)} className="border p-2 rounded"/>
          <input placeholder="Search Title" onChange={(e)=>setSearchTitle(e.target.value)} className="border p-2 rounded"/>
          <input placeholder="Min Views" onChange={(e)=>setMinViews(e.target.value)} className="border p-2 rounded"/>
          <input placeholder="Min Inquiries" onChange={(e)=>setMinInquiries(e.target.value)} className="border p-2 rounded"/>
          <select onChange={(e)=>setSortBy(e.target.value)} className="border p-2 rounded">
            <option value="">Sort By</option>
            <option value="views">Views</option>
            <option value="inquiries">Inquiries</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mb-12 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="py-3 text-left">Property</th>
              <th className="text-left">Views</th>
              <th className="text-left">Inquiries</th>
            </tr>
          </thead>
          <tbody>
            {filteredRanking.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="py-3">{p.title}</td>
                <td>{p.views}</td>
                <td>{p.inquiries}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <Bar data={performanceChart} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <Doughnut data={conversionChart} />
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({ title, value, suffix = "" }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }}
      className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-indigo-500">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold mt-2">
        <CountUp end={value} duration={1.5} />{suffix}
      </h2>
    </motion.div>
  );
}

export default BrokerAnalytics;
