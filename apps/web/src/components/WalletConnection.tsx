import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { etherlinkTestnet } from "../config/wagmi";

export function WalletConnection() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  if (isConnected) {
    return (
      <div className="wallet-connection connected">
        <div className="wallet-status">
          <div className="wallet-icon">🦊</div>
          <div className="wallet-info">
            <span className="network-status">
              {chainId === etherlinkTestnet.id
                ? "✅ Etherlink"
                : "❌ Wrong Network"}
            </span>
            <span className="wallet-address">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
        </div>
        <button onClick={() => disconnect()} className="disconnect-btn">
          Disconnect
        </button>
      </div>
    );
  }

  const metaMaskConnector =
    connectors.find((connector) => connector.id === "metaMaskSDK") ||
    connectors[0];

  return (
    <div className="wallet-connection disconnected">
      {metaMaskConnector && (
        <button
          onClick={() => connect({ connector: metaMaskConnector })}
          className="connector-btn"
        >
          🦊 Connect MetaMask
        </button>
      )}
    </div>
  );
}
