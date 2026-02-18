import { useState } from "react";
import { BASE_URL } from "../api";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      alert("Please fill required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/contact/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed");
      }

      setSuccess(true);
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

    } catch (err) {
      alert("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-28 px-6 relative">

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white px-5 py-3 rounded-full shadow-lg hover:bg-green-600 transition z-50"
      >
        WhatsApp Chat
      </a>

      {/* Floating Support Widget */}
      <div className="fixed bottom-6 left-6 bg-yellow-500 text-white p-4 rounded-xl shadow-lg z-50">
        <p className="font-semibold">Need Help?</p>
        <p className="text-sm">Call: +91 98765 43210</p>
      </div>

      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-yellow-500 mb-4">
            Contact Us
          </h1>
          <p className="text-gray-600">
            We are here to assist you with buying, selling, or renting properties.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">

          {/* LEFT SIDE INFO */}
          <div className="bg-white p-10 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Office Information</h2>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold">Address</h3>
                <p>Nagpur, Maharashtra, India</p>
              </div>

              <div>
                <h3 className="font-semibold">Phone</h3>
                <p>+91 98765 43210</p>
              </div>

              <div>
                <h3 className="font-semibold">Email</h3>
                <p>support@realestate.com</p>
              </div>

              <div>
                <h3 className="font-semibold">Business Hours</h3>
                <p>Mon - Sat: 9AM - 8PM</p>
              </div>
            </div>

            <iframe
              className="mt-8 w-full h-64 rounded-lg"
              loading="lazy"
              src="https://www.google.com/maps?q=Nagpur,India&output=embed"
              title="Location"
            ></iframe>
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="bg-white p-10 rounded-xl shadow-lg">

            <h2 className="text-2xl font-bold mb-6">
              Send Message
            </h2>

            {success && (
              <div className="bg-green-100 text-green-700 p-4 mb-6 rounded">
                Message sent successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              <input
                type="text"
                placeholder="Full Name *"
                className="input"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <input
                type="email"
                placeholder="Email *"
                className="input"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Phone"
                className="input"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Subject"
                className="input"
                value={form.subject}
                onChange={(e) =>
                  setForm({ ...form, subject: e.target.value })
                }
              />

              <textarea
                rows="5"
                placeholder="Message *"
                className="input"
                value={form.message}
                onChange={(e) =>
                  setForm({ ...form, message: e.target.value })
                }
              ></textarea>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-black transition"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Contact;
