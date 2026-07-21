import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container site-footer__inner">
        <div className="site-footer__links">
          <Link to="/backtester">Backtester</Link>
          <Link to="/how-it-works">How It Works</Link>
          <a href="https://github.com/Hermit210/Hook_backtester" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
        <span className="site-footer__note">Synthetic data — demo only. Not financial advice.</span>
      </div>
    </footer>
  );
}
