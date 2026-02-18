// ==========================
// TOKEN HELPERS
// ==========================

// NEW SYSTEM
export const getAccessToken = () => localStorage.getItem("access");
export const getRefreshToken = () => localStorage.getItem("refresh");

// 🔥 BACKWARD COMPATIBILITY
// This fixes all old getToken() usage everywhere
export const getToken = () => localStorage.getItem("access");

export const setTokens = (access, refresh) => {
  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
};

export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location = "/login";
};

// ==========================
// REFRESH TOKEN LOGIC
// ==========================

export const refreshAccessToken = async () => {
  const refresh = getRefreshToken();

  if (!refresh) {
    logout();
    return null;
  }

  try {
    const res = await fetch(
      `${process.env.REACT_APP_BASE_URL}/api/token/refresh/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      },
    );

    const data = await res.json();

    if (data.access) {
      localStorage.setItem("access", data.access);
      return data.access;
    } else {
      logout();
      return null;
    }
  } catch {
    logout();
    return null;
  }
};
