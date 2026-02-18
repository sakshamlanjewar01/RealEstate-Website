function TopProperty({ property }) {
  if (!property) return null;

  return (
    <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-xl p-6 shadow-lg">
      <h2 className="text-lg font-bold mb-4">Top Performing Property</h2>

      <img
        src={property.image}
        alt=""
        className="h-40 w-full object-cover rounded-lg mb-4"
      />

      <h3 className="font-bold text-xl">{property.title}</h3>
      <p>₹ {property.price}</p>
      <p className="text-sm">{property.inquiries} inquiries</p>
    </div>
  );
}

export default TopProperty;
