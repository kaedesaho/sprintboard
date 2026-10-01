import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  AiOutlineHome,
  AiOutlineSetting,
  AiOutlineBarChart,
  AiOutlineCheckSquare,
  AiOutlineFileText,
  AiOutlineTeam,
  AiOutlineArrowLeft,
} from "react-icons/ai";
import { LuLogOut } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { useProject } from "../context/ProjectContext";
import LogoutModal from "./Logout";
import "./Sidebar.css";

const Sidebar = () => {
  const { isLoggedIn, username, photoUrl, logout } = useAuth();
  const { project } = useProject();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Logged-out landing page shows the nav as a horizontal top bar
  const isTopbar = !isLoggedIn && pathname === "/";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const initial = username ? username[0].toUpperCase() : "?";

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/login");
  };

  const closeMobile = () => setMobileOpen(false);

  const handleUserClick = () => {
    if (project) {
      navigate(`/projects/${project.id}/user-settings`);
    } else {
      navigate("/settings");
    }
  };

  return (
    <>
      {!isTopbar && (
        <button
          className="sidebar-mobile-toggle"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle sidebar"
        >
          <span />
          <span />
          <span />
        </button>
      )}

      {mobileOpen && <div className="sidebar-backdrop" onClick={closeMobile} />}

      <aside
        className={`sidebar${mobileOpen ? " sidebar--open" : ""}${isTopbar ? " sidebar--topbar" : ""}`}
      >
        <div className="sidebar-logo-wrap">
          <Link
            to={isLoggedIn ? "/dashboard" : "/"}
            className="sidebar-logo"
          >
            SprintBoard
          </Link>
        </div>

        <nav className="sidebar-nav">
          {!isLoggedIn && (
            <>
              <NavLink to="/login" className="sidebar-item">
                <AiOutlineHome className="sidebar-icon" />
                <span>Login</span>
              </NavLink>
              <NavLink to="/signup" className="sidebar-item">
                <AiOutlineTeam className="sidebar-icon" />
                <span>Sign up</span>
              </NavLink>
            </>
          )}

          {isLoggedIn && !project && (
            <>
              <NavLink to="/dashboard" className="sidebar-item">
                <AiOutlineHome className="sidebar-icon" />
                <span>My Projects</span>
              </NavLink>
            </>
          )}

          {isLoggedIn && project && (
            <>
              <Link to="/dashboard" className="sidebar-item sidebar-back">
                <AiOutlineArrowLeft className="sidebar-icon" />
                <span>My Projects</span>
              </Link>

              <NavLink
                to={`/projects/${project.id}`}
                end
                className="sidebar-item"
              >
                <AiOutlineBarChart className="sidebar-icon" />
                <span>Overview</span>
              </NavLink>
              <NavLink
                to={`/projects/${project.id}/tasks`}
                className="sidebar-item"
              >
                <AiOutlineCheckSquare className="sidebar-icon" />
                <span>Tasks</span>
              </NavLink>
              <NavLink
                to={`/projects/${project.id}/notes`}
                className="sidebar-item"
              >
                <AiOutlineFileText className="sidebar-icon" />
                <span>Notes</span>
              </NavLink>
              <NavLink
                to={`/projects/${project.id}/members`}
                className="sidebar-item"
              >
                <AiOutlineTeam className="sidebar-icon" />
                <span>Members</span>
              </NavLink>
              <NavLink
                to={`/projects/${project.id}/settings`}
                className="sidebar-item"
              >
                <AiOutlineSetting className="sidebar-icon" />
                <span>Settings</span>
              </NavLink>

            </>
          )}
        </nav>

        <div className="sidebar-bottom">
          {isLoggedIn && (
            <div className="sidebar-user-wrap">
              <button className="sidebar-user-row" onClick={handleUserClick}>
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    className="sidebar-avatar"
                    alt={username ?? ""}
                  />
                ) : (
                  <div className="sidebar-avatar-initials">{initial}</div>
                )}
                <span className="sidebar-username">{username}</span>
              </button>
              <button className="sidebar-logout-btn" onClick={() => setShowLogoutModal(true)}>
                <LuLogOut />
              </button>
            </div>
          )}
        </div>
      </aside>

      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
