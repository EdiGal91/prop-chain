import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <div className="welcome-section">
        <h2>Welcome to PropChain</h2>
        <p>Decentralized property management on Etherlink</p>

        {user && (
          <div className="quick-actions">
            <Link to="/properties" className="action-btn primary">
              📋 View My Properties
            </Link>
            <Link to="/properties/create" className="action-btn secondary">
              ➕ Create New Property
            </Link>
          </div>
        )}

        <div className="features">
          <div className="feature-card">
            <h3>🏠 Property Management</h3>
            <p>
              Create, manage, and track your real estate properties on the
              blockchain
            </p>
          </div>
          <div className="feature-card">
            <h3>🔐 Secure Authentication</h3>
            <p>Sign in with your Ethereum wallet using SIWE protocol</p>
          </div>
        </div>
      </div>
    </div>
  );
}
