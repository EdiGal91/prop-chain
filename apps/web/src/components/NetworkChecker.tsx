import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { getChainId } from "@wagmi/core";

import { config, etherlinkTestnet } from "../config/wagmi";

export function NetworkChecker() {
  const chainId2 = getChainId(config);

  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const isOnEtherlink = chainId === etherlinkTestnet.id;

  console.log(
    `isConnected: ${isConnected}, chainId: ${chainId}, chainId2: ${chainId2} etherlinkId: ${etherlinkTestnet.id}, isOnEtherlink: ${isOnEtherlink}`
  );

  if (!isConnected || isOnEtherlink) {
    console.log("NetworkChecker return null");
    return null;
  }
  console.log("NetworkChecker continue");

  const handleSwitchNetwork = () => {
    switchChain({ chainId: etherlinkTestnet.id });
  };

  return (
    <div className="network-checker">
      <div className="network-warning">
        <div className="warning-info">
          <h3>⚠️ Wrong Network</h3>
          <p>Please switch to Etherlink Testnet to continue</p>
        </div>
        <div className="network-info">
          <span>Network: {etherlinkTestnet.name}</span>
          <span>Chain ID: {etherlinkTestnet.id}</span>
        </div>
        <button
          onClick={handleSwitchNetwork}
          disabled={isPending}
          className="switch-network-btn"
        >
          {isPending ? "Switching..." : "Switch Network"}
        </button>
      </div>
    </div>
  );
}
