import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext";
import { BASE_URL } from "../api";

function PropertyCard({ property }) {
  const propertyId = property?.id;
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useContext(WishlistContext);

  const [currentImage, setCurrentImage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const [loading, setLoading] = useState(true);

  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const saved = wishlist.includes(propertyId);

  const images = property?.images?.length
    ? property.images
    : property?.image
      ? [{ image: property.image }]
      : [];

  useEffect(() => {
    if (!propertyId || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImage((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [images.length, propertyId]);

  useEffect(() => {
    if (!propertyId) return;
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [propertyId]);

  if (!propertyId) return null;

  // ==========================
  // SUBMIT ENQUIRY
  // ==========================
  const submitInquiry = async () => {
    if (!inquiryForm.name || !inquiryForm.email) {
      alert("Please fill required fields");
      return;
    }

    const res = await fetch(`${BASE_URL}/api/inquiries/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        property: propertyId,
        ...inquiryForm,
      }),
    });

    if (res.ok) {
      alert("Enquiry sent successfully!");

      // WhatsApp Redirect
      const whatsappMessage = `Hello, I'm interested in ${property.title}. Please share details.`;
      window.open(
        `https://wa.me/${property.owner_phone || "919999999999"}?text=${encodeURIComponent(whatsappMessage)}`,
        "_blank"
      );

      setShowInquiry(false);
      setInquiryForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } else {
      alert("Something went wrong");
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition relative">

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
        <div onClick={() => setShowModal(true)}>
          {loading ? (
            <div className="h-60 bg-gray-300 animate-pulse" />
          ) : (
            <img
              src={images[currentImage]?.image}
              alt=""
              className="h-60 w-full object-cover"
            />
          )}
        </div>

        {/* Info */}
        <div className="p-5">
          <h2 className="text-xl font-bold">{property.title}</h2>
          <p className="text-yellow-500 font-semibold mt-2">
            ₹{property.price}
          </p>
          <p className="text-gray-500">{property.location}</p>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => navigate(`/property/${propertyId}`)}
              className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-black transition"
            >
              View
            </button>

            <button
              onClick={() => setShowInquiry(true)}
              className="flex-1 border border-yellow-500 text-yellow-500 py-2 rounded-lg hover:bg-yellow-500 hover:text-white transition"
            >
              Enquiry
            </button>
          </div>
        </div>
      </div>

      {/* ==========================
          INQUIRY MODAL
      ========================== */}
      {showInquiry && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Enquiry for {property.title}
            </h2>

            <input
              placeholder="Name *"
              className="border p-2 w-full mb-3 rounded"
              value={inquiryForm.name}
              onChange={(e) =>
                setInquiryForm({ ...inquiryForm, name: e.target.value })
              }
            />

            <input
              placeholder="Email *"
              className="border p-2 w-full mb-3 rounded"
              value={inquiryForm.email}
              onChange={(e) =>
                setInquiryForm({ ...inquiryForm, email: e.target.value })
              }
            />

            <input
              placeholder="Phone"
              className="border p-2 w-full mb-3 rounded"
              value={inquiryForm.phone}
              onChange={(e) =>
                setInquiryForm({ ...inquiryForm, phone: e.target.value })
              }
            />

            <textarea
              placeholder="Message"
              className="border p-2 w-full mb-3 rounded"
              value={inquiryForm.message}
              onChange={(e) =>
                setInquiryForm({ ...inquiryForm, message: e.target.value })
              }
            />

            <div className="flex gap-3">
              <button
                onClick={submitInquiry}
                className="flex-1 bg-yellow-500 text-white py-2 rounded"
              >
                Send
              </button>

              <button
                onClick={() => setShowInquiry(false)}
                className="flex-1 bg-gray-300 py-2 rounded"
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
