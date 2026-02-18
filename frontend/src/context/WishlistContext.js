import { createContext, useEffect, useState } from "react";
import { BASE_URL } from "../api";
import { getToken } from "../auth";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);

    // Load wishlist from backend
    const loadWishlist = async () => {
        const token = getToken();
        if (!token) {
            setWishlist([]);
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/api/wishlist/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            const list = Array.isArray(data)
                ? data
                : Array.isArray(data.results)
                    ? data.results
                    : [];

            // Store only property IDs
            const ids = list.map((item) => item.property.id);

            setWishlist(ids);
        } catch {
            setWishlist([]);
        }
    };

    useEffect(() => {
        loadWishlist();
    }, []);

    // Toggle function
    const toggleWishlist = async (propertyId) => {
        const token = getToken();
        if (!token) return alert("Login first");

        const isSaved = wishlist.includes(propertyId);
        const method = isSaved ? "DELETE" : "POST";

        await fetch(`${BASE_URL}/api/wishlist/`, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ property_id: propertyId }),
        });

        // Update instantly
        if (isSaved) {
            setWishlist((prev) =>
                prev.filter((id) => id !== propertyId)
            );
        } else {
            setWishlist((prev) => [...prev, propertyId]);
        }
    };

    return (
        <WishlistContext.Provider
      value= {{ wishlist, toggleWishlist, loadWishlist }
}
    >
    { children }
    </WishlistContext.Provider>
  );
};
