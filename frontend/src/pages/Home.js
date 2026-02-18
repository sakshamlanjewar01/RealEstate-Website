import bg from "../assets/bg.jpg";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-black text-white">
      {/* HERO */}
      <div
        className="h-screen bg-center bg-cover relative flex items-center justify-center"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black"></div>

        <div className="relative text-center px-6 max-w-3xl">
          <h1 className="text-yellow-400 text-5xl md:text-7xl font-bold tracking-widest">
            Dream Homes
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-300">
            Discover luxury apartments, villas & investment properties with
            trusted guidance.
          </p>

          <button
            onClick={() => navigate("/properties")}
            className="mt-10 px-10 py-4 bg-yellow-400 text-black font-bold rounded-md
                       hover:bg-black hover:text-yellow-400 hover:scale-105 transition duration-300"
          >
            Explore Properties
          </button>
        </div>

        {/* FLOATING STATS */}
        <div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-[90%] max-w-5xl
                        grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
        >
          {[
            { number: "500+", label: "Listings" },
            { number: "300+", label: "Happy Clients" },
            { number: "10+", label: "Years Experience" },
            { number: "100%", label: "Trusted Deals" },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-black/60 backdrop-blur-md border border-yellow-400/20 p-4 rounded-xl"
            >
              <h2 className="text-yellow-400 font-bold text-2xl">
                {item.number}
              </h2>
              <p className="text-gray-400 text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED SECTION */}
      <div className="py-24 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-yellow-400 mb-6">
          Featured Properties
        </h2>

        <p className="text-gray-400 max-w-2xl mx-auto mb-14">
          Handpicked premium properties for the most exclusive living
          experience.
        </p>

        <button
          onClick={() => navigate("/properties")}
          className="px-8 py-3 border border-yellow-400 text-yellow-400 rounded-md
                     hover:bg-yellow-400 hover:text-black transition"
        >
          View All Properties
        </button>
      </div>

      {/* WHY CHOOSE US */}
      <div className="bg-black py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-yellow-400 mb-14">
            Why Choose DreamHomes
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Verified Listings",
                desc: "Every property is legally verified for your peace of mind.",
              },
              {
                title: "Expert Broker Support",
                desc: "Get professional consultation at every step.",
              },
              {
                title: "Best Market Deals",
                desc: "We ensure maximum value for your investment.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-black/60 border border-yellow-400/20 p-8 rounded-xl hover:scale-105 transition"
              >
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-24 text-center">
        <h2 className="text-4xl font-bold text-yellow-400">
          Start Your Property Journey Today
        </h2>

        <p className="text-gray-400 mt-6">
          Browse listings & connect with a trusted real estate expert.
        </p>

        <button
          onClick={() => navigate("/properties")}
          className="mt-10 px-10 py-4 bg-yellow-400 text-black font-bold rounded-md
                     hover:bg-black hover:text-yellow-400 transition"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default Home;
