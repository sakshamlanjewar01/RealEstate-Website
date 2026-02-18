function RecentlyViewed() {
  const items = JSON.parse(localStorage.getItem("recent")) || [];

  return (
    <div className="container">
      <h2>Recently Viewed</h2>

      <div className="grid">
        {items.map((p) => (
          <PropertyCard property={p} key={p.id} />
        ))}
      </div>
    </div>
  );
}

export default RecentlyViewed;
