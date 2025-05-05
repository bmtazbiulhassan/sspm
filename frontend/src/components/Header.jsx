import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import ucfsst_logo from '../assets/ucfsst_logo.jpg';
// import fdot_logo from '../assets/fdot_logo.png';
import atspm_logo from '../assets/atspm_logo.png';

import '../css/Header.css'; 


function Header() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null); // ⬅️ ref to handle outside click

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setOpenDropdown(null);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      {/* Top logos */}
      <div className="logo-section">
        <img src={atspm_logo} alt="ATSPM Logo" className="logo" />
        {/* <img src={fdot_logo} alt="FDOT Logo" className="logo" /> */}
        <img src={ucfsst_logo} alt="UCFSST Logo" className="logo" />
      </div>

      {/* Navigation Bar */}
      <nav className="navbar-section" ref={dropdownRef}>
        {/* Dashboard Dropdown */}
        <div className="dropdown">
          <button onClick={() => toggleDropdown('dashboard')} className="navbar-button">
            Dashboard ▼
          </button>
          {openDropdown === 'dashboard' && (
            <div className="dropdown-panel">
              <div className="dropdown-item" onClick={() => handleNavigate('/ranking')}>
                Rank View
              </div>
              <div className="dropdown-item" onClick={() => handleNavigate('/')}>
                Recommendation View
              </div>
            </div>
          )}
        </div>

        {/* Links Dropdown */}
        <div className="dropdown">
          <button onClick={() => toggleDropdown('links')} className="navbar-button">
            Links ▼
          </button>
          {/* {openDropdown === 'links' && (
            <div className="dropdown-panel">
              <div className="dropdown-item">
                <a href="https://traffic.dot.ga.gov/ATSPM/" target="_blank" rel="noopener noreferrer">
                  GDOT ATSPM
                </a>
              </div>
              <div className="dropdown-item">
                <a href="https://udottraffic.utah.gov/atspm/" target="_blank" rel="noopener noreferrer">
                  UDOT ATSPM
                </a>
              </div>
            </div>
          )} */}
        </div>

        {/* Static links */}
        <button onClick={() => handleNavigate('/faq')} className="navbar-button">FAQ</button>
        <button onClick={() => handleNavigate('/about')} className="navbar-button">About</button>
      </nav>
    </header>
  );
}

export default Header;
