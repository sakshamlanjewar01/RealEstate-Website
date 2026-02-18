import { useState } from "react";
import { BASE_URL } from "../api";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [data, setData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async () => {
    setLoading(true);

    await fetch(`${BASE_URL}/api/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="grid md:grid-cols-2 bg-white shadow-2xl rounded-2xl overflow-hidden max-w-5xl w-full">
        {/* LEFT SIDE */}
        <div className="hidden md:flex flex-col justify-center items-center bg-yellow-500 text-white p-12">
          <h1 className="text-4xl font-bold mb-4">Join DreamHomes</h1>
          <p className="text-center">
            Create your account and start saving your dream properties today.
          </p>
        </div>

        {/* FORM */}
        <div className="p-10">
          <h2 className="text-3xl font-bold text-yellow-500 mb-6 text-center">
            Signup
          </h2>

          <input
            placeholder="Username"
            className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:border-yellow-500"
            onChange={(e) => setData({ ...data, username: e.target.value })}
          />

          <input
            placeholder="Password"
            type="password"
            className="w-full border border-gray-300 p-3 rounded-lg mb-6 focus:outline-none focus:border-yellow-500"
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />

          <button
            onClick={handleSignup}
            className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-black transition"
          >
            {loading ? "Creating account..." : "Signup"}
          </button>

          <p className="text-center text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-yellow-500 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
