import { useEffect, useState } from "react";
import { BASE_URL } from "../api";
import { getToken, logout } from "../auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Settings() {
  const token = getToken();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const [form, setForm] = useState({
    username: "",
    email: "",
  });

  const [password, setPassword] = useState("");

  useEffect(() => {
    fetch(`${BASE_URL}/api/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setForm({
          username: data.username,
          email: data.email,
        });
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const res = await fetch(`${BASE_URL}/api/me/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success("Profile updated successfully");
    } else {
      toast.error("Update failed");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    const res = await fetch(`${BASE_URL}/api/change-password/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ new_password: password }),
    });

    if (res.ok) {
      toast.success("Password updated");
      setPassword("");
    } else {
      toast.error("Password change failed");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account?"))
      return;

    await fetch(`${BASE_URL}/api/delete-account/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    logout();
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-24 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-10">

        <h2 className="text-3xl font-bold text-gray-800">Settings</h2>

        {/* Account Settings */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Account Information</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">

            <InputField
              label="Username"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />

            <InputField
              label="Email"
              value={form.email}
              type="email"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
              Save Changes
            </button>
          </form>
        </section>

        {/* Password */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">

            <InputField
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-black transition">
              Update Password
            </button>
          </form>
        </section>

        {/* Preferences */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Preferences</h3>

          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
            <span>Dark Mode</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition ${
                darkMode ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`h-6 w-6 bg-white rounded-full transform transition ${
                  darkMode ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h3 className="text-red-500 font-semibold mb-4">Danger Zone</h3>

          <button
            onClick={handleDeleteAccount}
            className="border border-red-500 text-red-500 px-6 py-2 rounded-lg hover:bg-red-500 hover:text-white transition"
          >
            Delete Account
          </button>
        </section>

      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
      />
    </div>
  );
}

export default Settings;
