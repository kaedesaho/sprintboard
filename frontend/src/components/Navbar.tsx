import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AiOutlineInfoCircle, AiOutlineEdit } from 'react-icons/ai';
import { useAuth } from "../context/AuthContext";
import { useProject } from "../context/ProjectContext";
import LogoutModal from "./Logout";
import "./Navbar.css";

const Navbar = () => {
  const { isLoggedIn, username, photoUrl, logout } = useAuth();
  const { project } = useProject();
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLogoutModal]);

  const initial = username ? username[0].toUpperCase() : '?';

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {isLoggedIn ? (
          <Link to="/dashboard" className="navbar-logo">SprintBoard</Link>
        ) : (
          <Link to="/" className="navbar-logo">SprintBoard</Link>
        )}
      </div>

      <div className="navbar-center">
        {isLoggedIn && project && (
          <>
            <span className="navbar-project-name">{project.title}</span>
            {project.description && (
              <div className="navbar-info-tooltip">
                <AiOutlineInfoCircle className="navbar-info-icon" />
                <span className="navbar-tooltip-text">{project.description}</span>
              </div>
            )}
            {project.role === 'Admin' && (
              <Link to={`/projects/${project.id}/edit`} className="navbar-project-edit">
                <AiOutlineEdit />
              </Link>
            )}
            <span className="navbar-project-divider">|</span>
            <NavLink
              to={`/projects/${project.id}`}
              end
              className={({ isActive }) => `navbar-tab${isActive ? ' active' : ''}`}
            >
              Overview
            </NavLink>
            <NavLink
              to={`/projects/${project.id}/tasks`}
              className={({ isActive }) => `navbar-tab${isActive ? ' active' : ''}`}
            >
              Tasks
            </NavLink>
            <NavLink
              to={`/projects/${project.id}/notes`}
              className={({ isActive }) => `navbar-tab${isActive ? ' active' : ''}`}
            >
              Notes
            </NavLink>
            <NavLink
              to={`/projects/${project.id}/members`}
              className={({ isActive }) => `navbar-tab${isActive ? ' active' : ''}`}
            >
              Members
            </NavLink>
          </>
        )}
      </div>

      <div className="navbar-right">
        {isLoggedIn ? (
          <div ref={dropdownRef} className="navbar-user">
            <button onClick={toggleMenu} className="nav-avatar-btn">
              {photoUrl ? (
                <img src={photoUrl} className="nav-avatar" alt={username ?? ''} />
              ) : (
                <div className="nav-avatar-initials">{initial}</div>
              )}
            </button>
            {open && (
              <div className="navbar-dropdown">
                <Link to="/settings">Settings</Link>
                <button onClick={() => setShowLogoutModal(true)}>Log out</button>
              </div>
            )}
          </div>
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
