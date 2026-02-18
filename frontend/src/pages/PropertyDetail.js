import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../api";
import { getToken } from "../auth";
import { Share2, Phone, MessageCircle, Heart } from "lucide-react";

function PropertyDetail() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [saved, setSaved] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);

  // ===================== LOAD PROPERTY
  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/api/properties/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setProperty(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // ===================== LOAD REVIEWS
  useEffect(() => {
    fetch(`${BASE_URL}/api/reviews/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(Array.isArray(data) ? data : data.results || []);
      });
  }, [id]);

  // ===================== CHECK WISHLIST
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetch(`${BASE_URL}/api/wishlist/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results || [];
        const exists = list.find((item) => item.property?.id === Number(id));
        setSaved(!!exists);
      });
  }, [id]);

  const toggleWishlist = async () => {
    const token = getToken();
    if (!token) return alert("Login first");

    const method = saved ? "DELETE" : "POST";

    await fetch(`${BASE_URL}/api/wishlist/`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ property_id: id }),
    });

    setSaved(!saved);
  };

  const submitReview = async () => {
    const token = getToken();
    if (!token) return alert("Login first");

    const res = await fetch(`${BASE_URL}/api/reviews/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        property: id,
        rating,
        comment,
      }),
    });

    if (res.ok) {
      const newReview = await res.json();
      setReviews((prev) => [newReview, ...prev]);
      setComment("");
    }
  };

  const shareProperty = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: "Check out this property!",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="pt-32 text-center text-yellow-400 text-xl bg-black min-h-screen">
        Loading Property...
      </div>
    );
  }

  const images = property?.images?.length
    ? property.images
    : property?.image
      ? [{ image: property.image }]
      : [];

  return (
    <div className="bg-white text-black min-h-screen pt-28 px-6">
      <div className=" text-black max-w-7xl mx-auto">

        {/* ================= IMAGE + INFO */}
        <div className="grid md:grid-cols-2 gap-10">

          {/* IMAGE SECTION */}
          <div>
            <img
              src={images[currentImage]?.image}
              alt=""
              className="w-full h-[450px] object-cover rounded-2xl shadow-2xl"
            />

            <div className="flex gap-3 mt-4">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img.image}
                  alt=""
                  onClick={() => setCurrentImage(index)}
                  className={`w-24 h-20 object-cover rounded-lg cursor-pointer transition ${
                    currentImage === index
                      ? "border-2 border-yellow-400"
                      : "opacity-70 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* DETAILS SECTION */}
          <div className="text-black">
            <h1 className="text-4xl font-bold mb-4 text-yellow-400">
              {property.title}
            </h1>

            <p className="text-3xl font-semibold mb-3">
              ₹{property.price}
            </p>

            <p className="text-gray-800 mb-6">
              📍 {property.location}
            </p>

            {/* PROPERTY STATS */}
            <div className="flex gap-6 mb-6 text-gray-800">
              <span>🛏 {property.bedrooms} Beds</span>
              <span>🛁 {property.bathrooms} Baths</span>
              <span>📐 {property.area} sqft</span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={toggleWishlist}
                className="flex items-center gap-2 bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-white transition"
              >
                <Heart size={18} />
                {saved ? "Saved" : "Save"}
              </button>

              <button
                onClick={shareProperty}
                className="text-black flex items-center gap-2 border border-yellow-400 px-6 py-2 rounded-lg hover:bg-yellow-400 hover:text-black transition"
              >
                <Share2 size={18} />
                Share
              </button>

              <a
                href={`tel:+919999999999`}
                className="text-black flex items-center gap-2 border border-yellow-400 px-6 py-2 rounded-lg hover:bg-yellow-400 hover:text-black transition"
              >
                <Phone size={18} />
                Call
              </a>

              <a
                href={`https://wa.me/919999999999?text=Hello, I am interested in ${property.title}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-green-500 px-6 py-2 rounded-lg hover:bg-green-600 transition"
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>
            </div>

            {/* DESCRIPTION */}
            <p className="text-gray-800 leading-relaxed">
              {property.description}
            </p>

            {/* AMENITIES */}
            {property.amenities?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">
                  Amenities
                </h3>
                <div className="flex flex-wrap gap-3">
                  {property.amenities.map((a, i) => (
                    <span
                      key={i}
                      className="bg-gray-800 px-4 py-2 rounded-full text-sm"
                    >
                      {a.name || a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= REVIEWS */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">
            User Reviews
          </h2>

          {reviews.length === 0 ? (
            <p className="text-gray-400">No reviews yet</p>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-gray-900 p-4 rounded-lg mb-4"
              >
                <p className="font-semibold text-yellow-400">
                  {rev.user}
                </p>
                <p className="text-yellow-300">⭐ {rev.rating}</p>
                <p className="text-gray-300">{rev.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* ================= ADD REVIEW */}
        <div className="mt-12 bg-gray-900 p-6 rounded-xl shadow-xl">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">
            Leave a Review
          </h3>

          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="bg-black border border-yellow-400 p-2 mb-4 w-full rounded-lg text-white"
          >
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r} Star
              </option>
            ))}
          </select>

          <textarea
            placeholder="Write your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="bg-black border border-yellow-400 p-3 w-full rounded-lg mb-4 text-white"
          />

          <button
            onClick={submitReview}
            className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-white transition"
          >
            Submit Review
          </button>
        </div>

      </div>
    </div>
  );
}

export default PropertyDetail;
