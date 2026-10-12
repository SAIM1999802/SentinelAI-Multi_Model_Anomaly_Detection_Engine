import React, { useState, useRef, useEffect } from "react";
import logo from "../assets/sentinelai-logo-light-text.svg";
import "../styles/Navbar.css";

export default function Navbar({ user, onLogout, onNavigate, activeTab }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLinkClick = (e, tab) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  return (
    <header className="navbar">
      <a 
        href="#dashboard" 
        className="navbar-logo"
        onClick={(e) => handleLinkClick(e, "dashboard")}
      >
        <img src={logo} alt="SentinelAI" className="navbar-logo-img" />
      </a>

      <nav className="navbar-links">
        <a
          href="#dashboard"
          className={`navbar-item ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={(e) => handleLinkClick(e, "dashboard")}
        >
          Dashboard
        </a>

        <a
          href="#analysis"
          className={`navbar-item ${activeTab === "analysis" ? "active" : ""}`}
          onClick={(e) => handleLinkClick(e, "analysis")}
        >
          Analysis
        </a>

        <a href="#resources" className="navbar-item">
          Resources
        </a>
      </nav>

      <div className="navbar-user" ref={menuRef}>
        <button
          className="navbar-user-btn"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span className="navbar-avatar">👤</span>
          <span className="navbar-username">{user?.full_name || "User"}</span>
          <span className={`navbar-caret ${open ? "open" : ""}`}>▾</span>
        </button>

        {open && (
          <div className="navbar-dropdown" role="menu">
            <button className="navbar-dropdown-item" role="menuitem">
              ⚙️ Settings
            </button>
            <button 
              className="navbar-dropdown-item danger" 
              role="menuitem"
              onClick={() => {
                setOpen(false);
                if (onLogout) onLogout();
              }}
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}