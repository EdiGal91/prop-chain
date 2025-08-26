import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { etherlinkTestnet } from "../config/wagmi";
import { useAuth } from "../hooks/useAuth";

export function WalletManager() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId(); // Now should work correctly with all chains registered
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const {
    user,
    isLoading: isAuthLoading,
    error: authError,
    signIn,
    signOut,
  } = useAuth();

  // Use wagmi's chain ID for network detection
  const isOnEtherlink = chainId === etherlinkTestnet.id;

  // Handle logout/disconnect action
  const handleLogout = () => {
    if (user) {
      // If signed in, sign out (which also disconnects)
      signOut();
    } else {
      // If just connected, disconnect
      disconnect();
    }
  };

  // Not connected - show connect button
  if (!isConnected) {
    const metaMaskConnector =
      connectors.find((connector) => connector.id === "metaMaskSDK") ||
      connectors[0];

    return (
      <div className="wallet-manager-compact">
        {metaMaskConnector && (
          <button
            onClick={() => connect({ connector: metaMaskConnector })}
            className="wallet-btn connect"
          >
            Connect Wallet
          </button>
        )}
      </div>
    );
  }

  // Connected but wrong network - show network switch inline
  if (!isOnEtherlink) {
    return (
      <div className="wallet-manager-compact wrong-network">
        <span className="wallet-address">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={() => switchChain({ chainId: etherlinkTestnet.id })}
          disabled={isSwitching}
          className="wallet-btn switch"
        >
          {isSwitching ? "Switching..." : "Switch Network"}
        </button>
        <button onClick={handleLogout} className="wallet-btn logout">
          Disconnect
        </button>
      </div>
    );
  }

  // Connected and on correct network - show compact status
  return (
    <div className="wallet-manager-compact connected">
      <span className="wallet-address">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </span>

      {/* Show sign in button or authenticated status */}
      {isAuthLoading ? (
        <span className="auth-loading">•••</span>
      ) : user ? (
        <span className="auth-status authenticated">🔐</span>
      ) : (
        <button
          onClick={signIn}
          disabled={isAuthLoading}
          className="wallet-btn sign-in"
        >
          Sign In
        </button>
      )}

      <button onClick={handleLogout} className="wallet-btn logout">
        {user ? "Sign Out" : "Disconnect"}
      </button>

      {authError && <div className="auth-error-compact">{authError}</div>}
    </div>
  );
}
