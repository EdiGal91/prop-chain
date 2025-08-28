import { useReadContract, useAccount } from "wagmi";
import {
  PROPERTY_TOKENIZATION_ADDRESS,
  PROPERTY_TOKENIZATION_ABI,
} from "../config/contracts";

export function useTokenBalance(tokenId: number | undefined) {
  const { address } = useAccount();

  const {
    data: balance,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: PROPERTY_TOKENIZATION_ADDRESS,
    abi: PROPERTY_TOKENIZATION_ABI,
    functionName: "getTokenBalance",
    args: address && tokenId ? [address, BigInt(tokenId)] : undefined,
    query: {
      enabled: !!(address && tokenId),
    },
  });

  return {
    balance: balance ? Number(balance) : 0,
    isLoading,
    error,
    refetch,
  };
}

export function useTokenInfo(tokenId: number | undefined) {
  const { data: tokenName, isLoading: nameLoading } = useReadContract({
    address: PROPERTY_TOKENIZATION_ADDRESS,
    abi: PROPERTY_TOKENIZATION_ABI,
    functionName: "name",
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
    },
  });

  const { data: property, isLoading: propertyLoading } = useReadContract({
    address: PROPERTY_TOKENIZATION_ADDRESS,
    abi: PROPERTY_TOKENIZATION_ABI,
    functionName: "getProperty",
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
    },
  });

  return {
    tokenName: tokenName as string,
    property: property as any,
    isLoading: nameLoading || propertyLoading,
  };
}
