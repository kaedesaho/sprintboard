import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import LogoutModal from "./Logout";
import "./Navbar.css";
  
const Navbar = () => {
  const { isLoggedIn, username, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/login');
  };

  const toggleMenu = () => {
    setOpen(!open);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showLogoutModal) return;

      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogoutModal]);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">PlanFlow</Link>

      <div className="navbar-links">
        {isLoggedIn ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <div ref={dropdownRef} className="navbar-user">
              <button onClick={toggleMenu} className="navbar-username">
                {username}
              </button>
              { open && (
              <div className="navbar-dropdown">
                <Link to="/settings">Settings</Link>
                <button onClick={() => setShowLogoutModal(true)}>Log out</button>
              </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-login">Log in</Link>
            <Link to="/signup" className="navbar-signup">Sign up</Link>
          </>
        )}
      </div>
      {showLogoutModal && (
        <LogoutModal 
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </nav>
  );
};
export default Navbar;