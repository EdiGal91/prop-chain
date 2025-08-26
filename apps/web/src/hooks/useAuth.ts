import { useState, useCallback, useEffect } from "react";
import { useAccount, useSignMessage, useDisconnect, useChainId } from "wagmi";
import { SiweMessage } from "siwe";
import { etherlinkTestnet } from "../config/wagmi";

interface AuthUser {
  address: string;
  token?: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true to check session
  const [error, setError] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();

        if (result.authenticated && result.user) {
          setUser({
            address: result.user.address,
          });
        }
      }
    } catch (err) {
      console.error("Session check error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async () => {
    if (!address || !isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (chainId !== etherlinkTestnet.id) {
      setError("Please switch to Etherlink Testnet first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Get nonce from backend
      const nonceResponse = await fetch(`${API_BASE_URL}/auth/nonce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!nonceResponse.ok) {
        throw new Error("Failed to get nonce");
      }

      const { nonce } = await nonceResponse.json();

      // 2. Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in with Ethereum to the app.",
        uri: window.location.origin,
        version: "1",
        chainId: etherlinkTestnet.id,
        nonce,
      });

      const messageText = message.prepareMessage();

      // 3. Sign the message
      const signature = await signMessageAsync({
        message: messageText,
      });

      // 4. Verify signature with backend
      const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: messageText,
          signature,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error("Failed to verify signature");
      }

      const result = await verifyResponse.json();

      if (!result.success) {
        throw new Error(result.error || "Authentication failed");
      }

      // 5. Set user data
      setUser({
        address: result.user.address,
        token: result.token,
      });
    } catch (err) {
      console.error("Sign in error:", err);
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, signMessageAsync, chainId]);

  const signOut = useCallback(async () => {
    try {
      // Call backend logout endpoint
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Always clear local state
      setUser(null);
      setError(null);
      disconnect();
    }
  }, [disconnect]);

  return {
    user,
    isLoading,
    error,
    signIn,
    signOut,
  };
}
