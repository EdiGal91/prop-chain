import { useAuth } from "../hooks/useAuth";

export function AuthStatus() {
  const { user, isLoading, error, signIn, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-status loading">
        <div className="loading-spinner"></div>
        <span>Checking...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="auth-status authenticated">
        <div className="user-info">
          <div className="user-avatar">
            <span>{user.address.slice(0, 2).toUpperCase()}</span>
          </div>
          <div className="user-details">
            <span className="auth-label">Authenticated</span>
            <span className="user-address">
              {user.address.slice(0, 6)}...{user.address.slice(-4)}
            </span>
          </div>
        </div>
        <button onClick={signOut} className="sign-out-btn">
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="auth-status unauthenticated">
      <button onClick={signIn} disabled={isLoading} className="sign-in-btn">
        🔐 Sign in with Ethereum
      </button>
      {error && (
        <div className="auth-error">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
