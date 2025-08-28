import { useState, useCallback, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  usePublicClient,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  PROPERTY_TOKENIZATION_ADDRESS,
  PROPERTY_TOKENIZATION_ABI,
} from "../config/contracts";
import { useProperty } from "./useProperty";

export function useTokenization() {
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingTokenization, setPendingTokenization] = useState<{
    propertyId: string;
    propertyTitle: string;
    tokenAmount: number;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  } | null>(null);

  const { address } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const publicClient = usePublicClient();
  const { tokenizeProperty: updateBackend } = useProperty();

  const { isSuccess: isConfirmed, data: receipt } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Helper function to get token ID from contract
  const getTokenIdFromContract = useCallback(
    async (propertyId: string): Promise<number> => {
      if (!publicClient) throw new Error("Public client not available");

      const data = await publicClient.readContract({
        address: PROPERTY_TOKENIZATION_ADDRESS,
        abi: PROPERTY_TOKENIZATION_ABI,
        functionName: "getTokenIdByPropertyId",
        args: [propertyId],
      });
      return Number(data);
    },
    [publicClient]
  );

  // Effect to handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && receipt && hash && pendingTokenization) {
      const handleConfirmation = async () => {
        try {
          // Get the actual tokenId from the contract
          const tokenId = await getTokenIdFromContract(
            pendingTokenization.propertyId
          );

          // Update backend with real data
          await updateBackend(pendingTokenization.propertyId, {
            tokenAmount: pendingTokenization.tokenAmount,
            transactionHash: hash,
            tokenId,
          });

          pendingTokenization.resolve({ hash, tokenId });
        } catch (err) {
          pendingTokenization.reject(err);
        } finally {
          setPendingTokenization(null);
          setIsTokenizing(false);
        }
      };

      handleConfirmation();
    }
  }, [
    isConfirmed,
    receipt,
    hash,
    pendingTokenization,
    updateBackend,
    getTokenIdFromContract,
  ]);

  const tokenizeProperty = useCallback(
    async (propertyId: string, propertyTitle: string, tokenAmount: number) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      setIsTokenizing(true);
      setError(null);

      return new Promise((resolve, reject) => {
        try {
          // Store the pending tokenization details
          setPendingTokenization({
            propertyId,
            propertyTitle,
            tokenAmount,
            resolve,
            reject,
          });

          // Initiate the contract write
          writeContract({
            address: PROPERTY_TOKENIZATION_ADDRESS,
            abi: PROPERTY_TOKENIZATION_ABI,
            functionName: "tokenizeProperty",
            args: [propertyId, propertyTitle, BigInt(tokenAmount)],
          });
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to tokenize property";
          setError(errorMessage);
          setPendingTokenization(null);
          setIsTokenizing(false);
          reject(err);
        }
      });
    },
    [address, writeContract]
  );

  return {
    tokenizeProperty,
    isTokenizing,
    error,
  };
}
