import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { BASE_URL } from "./api";
import { getAccessToken, refreshAccessToken } from "./auth";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Wishlist from "./pages/Wishlist";
import AddProperty from "./pages/AddProperty";
import MyProperties from "./pages/MyProperties";
import BrokerAnalytics from "./pages/BrokerAnalytics";
import BrokerInquiries from "./pages/BrokerInquiries";
import Chat from "./pages/Chat";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    let token = getAccessToken();

    if (!token) {
      setLoading(false);
      return;
    }

    let res = await fetch(`${BASE_URL}/api/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      token = await refreshAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      res = await fetch(`${BASE_URL}/api/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    const data = await res.json();
    setUser(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-yellow-500 text-xl">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {!user?.is_broker ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/broker-dashboard" />} />
            <Route path="/broker-dashboard" element={<BrokerAnalytics />} />
            <Route path="/my-properties" element={<MyProperties />} />
            <Route path="/add-property" element={<AddProperty />} />
            <Route path="/add-property/:id" element={<AddProperty />} />
            <Route path="/broker-inquiries" element={<BrokerInquiries />} />
          </>
        )}

        <Route path="*" element={<Navigate to="/" />} />

        <Route path="/chat" element={<Chat />} />

{user?.is_superuser && (
  <Route path="/admin-dashboard" element={<AdminDashboard />} />
)}

      </Routes>

      {/* Floating WhatsApp Support */}
      <a
        href="https://wa.me/919999999999"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg z-50 hover:scale-110 transition"
      >
        💬
      </a>
    </>
  );
}

export default App;
