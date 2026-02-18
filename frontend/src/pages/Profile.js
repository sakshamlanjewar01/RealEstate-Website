import { useEffect, useState } from "react";
import { BASE_URL } from "../api";
import { getToken } from "../auth";
import PropertyCard from "../components/PropertyCard";

function Profile() {
  const [myProperties, setMyProperties] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/properties/`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => setMyProperties(data.results || data));
  }, []);

  return (
    <div className="container">
      <h1>My Properties</h1>

      <div className="grid">
        {myProperties.map((p) => (
          <PropertyCard property={p} key={p.id} />
        ))}
      </div>
    </div>
  );
}

export default Profile;
