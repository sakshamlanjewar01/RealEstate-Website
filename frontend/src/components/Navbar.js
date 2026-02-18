import { Link, useNavigate } from "react-router-dom";
import { getToken, logout } from "../auth";
import { useState, useEffect, useContext } from "react";
import { BASE_URL } from "../api";
import { WishlistContext } from "../context/WishlistContext";
import {
  Home,
  Building2,
  Info,
  Mail,
  Heart,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

function Navbar() {
  const token = getToken();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { wishlist } = useContext(WishlistContext);

  useEffect(() => {
    if (token) {
      fetch(`${BASE_URL}/api/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setUser(data));
    }
  }, [token]);

  return (
    <nav className="fixed top-0 w-full z-50 bg-bgMain border-b border-borderSoft shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <Link
          to="/"
          className="text-2xl font-bold text-darkText tracking-wide"
        >
          DreamHomes
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center text-primaryText font-medium">

          {!user?.is_broker && (
            <>
              <NavItem to="/" icon={<Home size={18} />} text="Home" />
              <NavItem to="/properties" icon={<Building2 size={18} />} text="Properties" />
              <NavItem to="/about" icon={<Info size={18} />} text="About" />
              <NavItem to="/contact" icon={<Mail size={18} />} text="Contact" />

              {token && (
                <Link
                  to="/wishlist"
                  className="relative flex items-center gap-1 hover:text-darkText transition"
                >
                  <Heart size={18} />
                  Wishlist

                  {wishlist.length > 0 && (
                    <span className="absolute -top-2 -right-3 bg-primaryText text-white text-xs px-2 py-0.5 rounded-full">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
              )}
            </>
          )}

          {user?.is_broker && (
            <>
              <NavItem to="/broker-dashboard" icon={<LayoutDashboard size={18} />} text="Dashboard" />
              <NavItem to="/my-properties" icon={<Building2 size={18} />} text="My Properties" />
              <NavItem to="/add-property" icon={<Home size={18} />} text="Add Property" />
            </>
          )}

          {!token ? (
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-bgSoft hover:bg-borderSoft transition"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="flex items-center gap-1 text-red-500 hover:opacity-70 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-darkText"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-bgMain border-t border-borderSoft p-6 space-y-4 text-primaryText">

          {!user?.is_broker && (
            <>
              <MobileItem to="/" text="Home" setOpen={setOpen} />
              <MobileItem to="/properties" text="Properties" setOpen={setOpen} />
              <MobileItem to="/about" text="About" setOpen={setOpen} />
              <MobileItem to="/contact" text="Contact" setOpen={setOpen} />

              {token && (
                <Link
                  to="/wishlist"
                  onClick={() => setOpen(false)}
                  className="relative block"
                >
                  Wishlist
                  {wishlist.length > 0 && (
                    <span className="ml-2 bg-primaryText text-white text-xs px-2 py-0.5 rounded-full">
                      {wishlist.length}
                    </span>
                  )}
                </Link>
              )}
            </>
          )}

          {user?.is_broker && (
            <>
              <MobileItem to="/broker-dashboard" text="Dashboard" setOpen={setOpen} />
              <MobileItem to="/my-properties" text="My Properties" setOpen={setOpen} />
              <MobileItem to="/add-property" text="Add Property" setOpen={setOpen} />
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function NavItem({ to, icon, text }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1 hover:text-darkText transition"
    >
      {icon}
      {text}
    </Link>
  );
}

function MobileItem({ to, text, setOpen }) {
  return (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className="block hover:text-darkText transition"
    >
      {text}
    </Link>
  );
}

export default Navbar;
