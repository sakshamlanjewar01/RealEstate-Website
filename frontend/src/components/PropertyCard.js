import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext";
import { BASE_URL } from "../api";
import { getToken } from "../auth";

function PropertyCard({ property }) {
  const propertyId = property?.id;
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useContext(WishlistContext);

  const [currentImage, setCurrentImage] = useState(0);
  const [showInquiry, setShowInquiry] = useState(false);
  const [loading, setLoading] = useState(true);

  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const saved = wishlist.includes(propertyId);

  const images = property?.images?.length
    ? property.images
    : property?.image
    ? [{ image: property.image }]
    : [];

  /* ================= AUTO IMAGE SLIDER ================= */

  useEffect(() => {
    if (!propertyId || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImage((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [images.length, propertyId]);

  /* ================= LOADING SKELETON ================= */

  useEffect(() => {
    if (!propertyId) return;
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [propertyId]);

  if (!propertyId) return null;

  /* ================= SUBMIT ENQUIRY ================= */

  const submitInquiry = async () => {
    if (!inquiryForm.name || !inquiryForm.email) {
      alert("Please fill required fields");
      return;
    }

    const token = getToken();

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/inquiry/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          property: propertyId,
          ...inquiryForm,
        }),
      });

      if (!res.ok) throw new Error();

      alert("Enquiry sent successfully!");

      const whatsappMessage = `Hello, I'm interested in ${property.title}. Please share details.`;

      window.open(
        `https://wa.me/${
          property.owner_phone || "919999999999"
        }?text=${encodeURIComponent(whatsappMessage)}`,
        "_blank"
      );

      setShowInquiry(false);
      setInquiryForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch {
      alert("Something went wrong");
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden relative">

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(propertyId);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md z-10 transition ${
            saved ? "bg-red-100" : "bg-white"
          }`}
        >
          <span className={saved ? "text-red-500" : "text-gray-400"}>
            ❤️
          </span>
        </button>

        {/* Image */}
        <div
          className="relative cursor-pointer"
          onClick={() => navigate(`/property/${propertyId}`)}
        >
          {loading ? (
            <div className="h-60 bg-gray-300 animate-pulse" />
          ) : (
            <img
              src={images[currentImage]?.image}
              alt={property.title}
              className="h-60 w-full object-cover"
            />
          )}

          {/* Purpose Badge */}
          {property.purpose && (
            <div className="absolute top-3 left-3">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full shadow ${
                  property.purpose === "rent"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {property.purpose === "rent" ? "For Rent" : "For Sale"}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5 space-y-2">

          <h2 className="text-lg font-bold line-clamp-1">
            {property.title}
          </h2>

          {/* Price */}
          <p className="text-indigo-600 font-semibold text-lg">
            ₹{Number(property.price).toLocaleString()}
            {property.purpose === "rent" && (
              <span className="text-sm text-gray-500"> / month</span>
            )}
          </p>

          <p className="text-gray-500 text-sm line-clamp-1">
            📍 {property.location}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              onClick={() => navigate(`/property/${propertyId}`)}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition text-sm"
            >
              View Details
            </button>

            <button
              onClick={() => setShowInquiry(true)}
              className="flex-1 border border-indigo-600 text-indigo-600 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition text-sm"
            >
              Enquiry
            </button>
          </div>
        </div>
      </div>

      {/* ================= INQUIRY MODAL ================= */}

      {showInquiry && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[90%] max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              Enquiry for {property.title}
            </h2>

            <input
              placeholder="Name *"
              className="border p-2 w-full mb-3 rounded-lg"
              value={inquiryForm.name}
              onChange={(e) =>
                setInquiryForm({ ...inquiryForm, name: e.target.value })
              }
            />

            <input
              placeholder="Email *"
              className="border p-2 w-full mb-3 rounded-lg"
              value={inquiryForm.email}
              onChange={(e) =>
                setInquiryForm({ ...inquiryForm, email: e.target.value })
              }
            />

            <input
              placeholder="Phone"
              className="border p-2 w-full mb-3 rounded-lg"
              value={inquiryForm.phone}
              onChange={(e) =>
                setInquiryForm({ ...inquiryForm, phone: e.target.value })
              }
            />

            <textarea
              placeholder="Message"
              className="border p-2 w-full mb-3 rounded-lg"
              value={inquiryForm.message}
              onChange={(e) =>
                setInquiryForm({ ...inquiryForm, message: e.target.value })
              }
            />

            <div className="flex gap-3">
              <button
                onClick={submitInquiry}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg"
              >
                Send
              </button>

              <button
                onClick={() => setShowInquiry(false)}
                className="flex-1 bg-gray-300 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PropertyCard;
