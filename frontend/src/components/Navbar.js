import { Link, useNavigate } from "react-router-dom";
import { getToken, logout } from "../auth";
import { useState, useEffect, useContext, useRef } from "react";
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
  User,
  Settings,
} from "lucide-react";

function Navbar() {
  const token = getToken();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { wishlist } = useContext(WishlistContext);
  const dropdownRef = useRef();

  useEffect(() => {
    if (token) {
      fetch(`${BASE_URL}/api/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setUser(data));
    }
  }, [token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-bgMain border-b border-borderSoft shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <Link to="/" className="text-2xl font-bold text-darkText tracking-wide">
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
                <Link to="/wishlist" className="relative flex items-center gap-1 hover:text-darkText transition">
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
              <NavItem to="/broker-inquiries" icon={<Mail size={18} />} text="Enquiries" />
            </>
          )}

          {/* 🔥 USER PROFILE DROPDOWN */}
          {token && user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 bg-bgSoft px-4 py-2 rounded-lg hover:bg-borderSoft transition"
              >
                <User size={18} />
                {user.username}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-borderSoft p-2 space-y-2">
                  <Link to="/profile" className="flex items-center gap-2 hover:bg-bgSoft p-2 rounded">
                    <User size={16} /> Profile
                  </Link>

                  <Link to="/settings" className="flex items-center gap-2 hover:bg-bgSoft p-2 rounded">
                    <Settings size={16} /> Settings
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="flex items-center gap-2 text-red-500 hover:bg-bgSoft p-2 rounded w-full text-left"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {!token && (
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-bgSoft hover:bg-borderSoft transition"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-darkText" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}

function NavItem({ to, icon, text }) {
  return (
    <Link to={to} className="flex items-center gap-1 hover:text-darkText transition">
      {icon}
      {text}
    </Link>
  );
}

export default Navbar;
