import { useEffect, useState } from "react";
import { BASE_URL } from "../api";
import { getToken, logout } from "../auth";
import toast from "react-hot-toast";

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  const token = getToken();

  useEffect(() => {
    fetch(`${BASE_URL}/api/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load profile");
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-4xl mx-auto">

        {/* Dashboard Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 transition hover:shadow-2xl">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user.username?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {user.username}
                </h2>
                <p className="text-gray-500 text-sm">
                  Account Dashboard
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowEdit(true)}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
            >
              Update Profile
            </button>
          </div>

          {/* Divider */}
          <div className="my-8 border-t"></div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <InfoCard label="Full Name" value={user.username} />
            <InfoCard label="Email Address" value={user.email} />
            <InfoCard
              label="Phone Number"
              value={user.phone || "Not Provided"}
            />
            <InfoCard
              label="Member Since"
              value={new Date(user.date_joined).toLocaleDateString()}
            />

          </div>

          {/* Danger Zone */}
          <div className="mt-10">
            <h3 className="text-red-500 font-semibold mb-3">
              Danger Zone
            </h3>

            <button
              onClick={() => handleDeleteAccount(token)}
              className="px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
            >
              Delete Account
            </button>
          </div>

        </div>
      </div>

      {showEdit && (
        <EditProfileModal
          user={user}
          setUser={setUser}
          close={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}

/* ================================= */
/* Info Card Component */
/* ================================= */

function InfoCard({ label, value }) {
  return (
    <div className="bg-gray-50 p-5 rounded-xl border hover:shadow-md transition">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="font-semibold text-gray-800 break-words">
        {value}
      </p>
    </div>
  );
}

/* ================================= */
/* Edit Modal */
/* ================================= */

function EditProfileModal({ user, setUser, close }) {
  const [form, setForm] = useState({
    username: user.username || "",
    email: user.email || "",
    phone: user.phone || "",
  });

  const token = getToken();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${BASE_URL}/api/me/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setUser(data);
    toast.success("Profile updated successfully");
    close();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fadeIn">

        <button
          onClick={close}
          className="absolute top-4 right-5 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h3 className="text-2xl font-bold mb-6 text-gray-800">
          Update Profile
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">

          <InputField
            label="Full Name"
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

          <InputField
            label="Phone Number"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <button className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md">
            Save Changes
          </button>

        </form>
      </div>
    </div>
  );
}

/* ================================= */
/* Reusable Input */
/* ================================= */

function InputField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm text-gray-500 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
      />
    </div>
  );
}

/* ================================= */
/* Delete Account */
/* ================================= */

async function handleDeleteAccount(token) {
  if (!window.confirm("Are you sure you want to delete your account?"))
    return;

  await fetch(`${BASE_URL}/api/delete-account/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  logout();
  window.location.href = "/";
}

export default UserProfile;
