import { useState } from "react";
import { setTokens } from "../auth";
import { BASE_URL } from "../api";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [data, setData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE_URL}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!result.access || !result.refresh) {
        setError("Invalid username or password");
        setLoading(false);
        return;
      }

      // Store access + refresh
      setTokens(result.access, result.refresh);

      // Get user info
      const me = await fetch(`${BASE_URL}/api/me/`, {
        headers: { Authorization: `Bearer ${result.access}` },
      }).then((res) => res.json());

      if (me.is_broker) {
        navigate("/broker-dashboard");
      } else {
        navigate("/");
      }
    } catch {
      setError("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="grid md:grid-cols-2 bg-white shadow-2xl rounded-2xl overflow-hidden max-w-5xl w-full">
        <div className="hidden md:flex flex-col justify-center items-center bg-yellow-500 text-white p-12">
          <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
          <p>Login to manage properties or explore your dream home.</p>
        </div>

        <div className="p-10">
          <h2 className="text-3xl font-bold text-yellow-500 mb-6 text-center">
            Login
          </h2>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <input
            placeholder="Username"
            className="w-full border p-3 rounded-lg mb-4"
            onChange={(e) => setData({ ...data, username: e.target.value })}
          />

          <input
            placeholder="Password"
            type="password"
            className="w-full border p-3 rounded-lg mb-6"
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <p className="text-center text-gray-500 mt-6">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-yellow-500 font-semibold">
              Signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
