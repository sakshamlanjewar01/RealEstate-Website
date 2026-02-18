import { useEffect, useState } from "react";
import { BASE_URL } from "../api";
import { getToken } from "../auth";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${BASE_URL}/api/admin/dashboard/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          navigate("/");
          return;
        }
        return res.json();
      })
      .then((d) => setData(d));
  }, [navigate]);

  if (!data) {
    return (
      <div className="pt-28 text-center text-yellow-500 text-xl">
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div className="pt-28 px-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-10">Admin Super Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <Card title="Total Users" value={data.total_users} />
        <Card title="Total Brokers" value={data.total_brokers} />
        <Card title="Total Properties" value={data.total_properties} />
        <Card title="Total Inquiries" value={data.total_inquiries} />
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Recent Contact Messages</h2>

        {data.recent_contacts?.map((msg) => (
          <div key={msg.id} className="border-b py-2">
            <p className="font-semibold">{msg.name}</p>
            <p className="text-gray-500 text-sm">{msg.email}</p>
            <p className="text-sm">{msg.subject}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-black text-white p-6 rounded-xl shadow">
      <p>{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );
}

export default AdminDashboard;
