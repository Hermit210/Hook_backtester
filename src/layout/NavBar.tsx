import { useState } from "react";
import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/backtester", label: "Backtester", end: false },
  { to: "/how-it-works", label: "How It Works", end: false },
];

function linkClass({ isActive }: { isActive: boolean }): string {
  return `navbar__link${isActive ? " navbar__link--active" : ""}`;
}

export function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className={`navbar${open ? " navbar--open" : ""}`}>
      <div className="site-container navbar__inner">
        <NavLink to="/" className="navbar__brand" onClick={() => setOpen(false)}>
          <span className="navbar__brand-mark">HOOK</span>
          Hook Economic Backtester
        </NavLink>

        <div className="navbar__links">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <NavLink to="/backtester" className="btn btn-primary navbar__cta">
          Launch Backtester
        </NavLink>

        <button
          type="button"
          className="navbar__toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      <div className="site-container navbar__menu">
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={linkClass} onClick={() => setOpen(false)}>
            {link.label}
          </NavLink>
        ))}
        <NavLink to="/backtester" className="btn btn-primary navbar__cta" onClick={() => setOpen(false)}>
          Launch Backtester
        </NavLink>
      </div>
    </nav>
  );
}
