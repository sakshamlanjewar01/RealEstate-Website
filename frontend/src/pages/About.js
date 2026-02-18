import { useNavigate } from "react-router-dom";

function About() {
  const navigate = useNavigate();

  return (
    <div className="bg-bg-main text-gray-800 pt-28">
      {/* HERO */}
      <div className="text-center max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-500 tracking-widest">
          About DreamHomes
        </h1>

        <p className="mt-6 text-lg text-gray-600">
          We are a premium real estate platform dedicated to helping you find
          luxury homes, apartments, villas, and investment properties with
          complete trust and transparency.
        </p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-8 text-center mt-16 px-6 max-w-6xl mx-auto">
        {[
          { number: "500+", label: "Properties Listed" },
          { number: "300+", label: "Happy Clients" },
          { number: "10+", label: "Years Experience" },
          { number: "100%", label: "Trusted Deals" },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 shadow-lg p-6 rounded-xl"
          >
            <h2 className="text-3xl font-bold text-yellow-500">
              {item.number}
            </h2>
            <p className="text-gray-500 mt-2">{item.label}</p>
          </div>
        ))}
      </div>

      {/* OUR STORY */}
      <div className="max-w-6xl mx-auto mt-24 px-6 grid md:grid-cols-2 gap-12 items-center">
        <img
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa"
          alt="real estate"
          className="rounded-xl shadow-2xl"
        />

        <div>
          <h2 className="text-3xl font-bold text-yellow-500 mb-4">Our Story</h2>

          <p className="text-gray-600 leading-relaxed">
            DreamHomes was founded with a vision to simplify property buying,
            selling, and renting. Our mission is to provide a seamless digital
            experience where customers can explore premium properties and
            connect directly with a trusted broker.
          </p>

          <p className="text-gray-500 mt-4">
            We focus on transparency, verified listings, and personalized
            customer service to make your property journey smooth and secure.
          </p>
        </div>
      </div>

      {/* WHY CHOOSE US */}
      <div className="mt-24 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-yellow-500 mb-12">
          Why Choose Us
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: "Verified Properties",
              desc: "All listings are carefully verified for authenticity and legal clarity.",
            },
            {
              title: "Expert Guidance",
              desc: "Professional broker support to help you at every step.",
            },
            {
              title: "Best Price Deals",
              desc: "We ensure you get the best market value for your investment.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 shadow-xl p-8 rounded-xl hover:shadow-2xl transition"
            >
              <h3 className="text-xl font-semibold text-yellow-500 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <div className="mt-24 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-yellow-500 mb-12">
          Our Services
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            "Buy Property",
            "Sell Property",
            "Rent Property",
            "Property Investment",
          ].map((service, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 shadow-lg p-6 rounded-xl hover:bg-yellow-500 hover:text-white transition font-medium"
            >
              {service}
            </div>
          ))}
        </div>
      </div>

      {/* BROKER SECTION */}
      <div className="mt-24 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-yellow-500 mb-8">
          Meet Your Trusted Broker
        </h2>

        <div className="bg-white border border-gray-200 shadow-2xl p-10 rounded-xl">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="broker"
            className="w-32 h-32 mx-auto rounded-full border-4 border-yellow-500"
          />

          <h3 className="text-xl font-semibold mt-4">Rahul Sharma</h3>

          <p className="text-gray-500">Certified Real Estate Consultant</p>

          <p className="text-gray-600 mt-4">
            With over 10 years of experience in the real estate industry, Rahul
            has helped hundreds of families find their dream homes and investors
            secure profitable deals.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-24 pb-24 text-center">
        <h2 className="text-3xl font-bold text-yellow-500">
          Find Your Dream Property Today
        </h2>

        <p className="text-gray-500 mt-4">
          Browse our exclusive listings and connect with our expert broker.
        </p>

        <button
          onClick={() => navigate("/properties")}
          className="mt-8 px-10 py-3 bg-yellow-500 text-white font-bold rounded-md
                     hover:bg-black transition"
        >
          Explore Properties
        </button>
      </div>
    </div>
  );
}

export default About;
