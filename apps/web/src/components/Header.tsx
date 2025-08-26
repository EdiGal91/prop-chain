import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { WalletManager } from "./WalletManager";

export function Header() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <h1>PropChain</h1>
            <span className="tagline">Web3 Property Management</span>
          </Link>
        </div>

        {user && (
          <nav className="main-nav">
            <Link
              to="/properties"
              className={
                location.pathname.startsWith("/properties")
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              📋 My Properties
            </Link>
          </nav>
        )}

        <div className="auth-section">
          <WalletManager />
        </div>
      </div>
    </header>
  );
}
