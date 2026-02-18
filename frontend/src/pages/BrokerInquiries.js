import { useEffect, useState } from "react";
import { BASE_URL } from "../api";
import { getToken } from "../auth";
import { useNavigate } from "react-router-dom";

function BrokerInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

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
      });
  }, [navigate]);

  const updateStatus = async (id, status) => {
    await fetch(`${BASE_URL}/api/inquiry/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status }),
    });

    window.location.reload();
  };

  return (
    <div className="bg-white min-h-screen pt-28 px-6">
      <h1 className="text-3xl font-bold text-center mb-10 text-yellow-500">
        Customer Inquiries
      </h1>

      {inquiries.map((inq) => (
        <div key={inq.id} className="shadow-lg p-6 mb-6 rounded-lg">
          <h2 className="text-xl font-bold">{inq.property_title}</h2>
          <p>👤 {inq.name}</p>
          <p>📧 {inq.email}</p>
          <p>📞 {inq.phone}</p>
          <p className="mt-3">{inq.message}</p>

          <p className="mt-3 font-semibold">
            Status: <span className="text-yellow-500">{inq.status}</span>
          </p>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => updateStatus(inq.id, "replied")}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Mark Replied
            </button>

            <button
              onClick={() => updateStatus(inq.id, "closed")}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default BrokerInquiries;
