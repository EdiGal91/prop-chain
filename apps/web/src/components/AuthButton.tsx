import { useAccount } from "wagmi";
import { useAuth } from "../hooks/useAuth";

export function AuthButton() {
  const { isConnected } = useAccount();
  const { user, isLoading, error, signIn, signOut } = useAuth();

  // Show loading while checking session
  if (isLoading) {
    return (
      <div className="auth-status">
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="auth-status">
        <p>Please connect your wallet first</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="auth-status authenticated">
        <div className="user-info">
          <h3>Welcome!</h3>
          <p>Address: {user.address}</p>
        </div>
        <button onClick={signOut} className="auth-btn logout">
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="auth-status">
      <button onClick={signIn} disabled={isLoading} className="auth-btn signin">
        {isLoading ? "Signing in..." : "Sign in with Ethereum"}
      </button>
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
}
