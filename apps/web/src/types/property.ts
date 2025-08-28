export interface PropertyAddress {
  country: string;
  city: string;
}

export interface PropertyTokenization {
  tokenId: number;
  tokenAmount: number;
  contractAddress: string;
  transactionHash: string;
  tokenizedAt: string;
}

export interface Property {
  id: string;
  issuer: string;
  title: string;
  address: PropertyAddress;
  area: number;
  status: string;
  hasImage: boolean;
  tokenization?: PropertyTokenization;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyData {
  title: string;
  address: PropertyAddress;
  area: number;
  image?: File;
}

export interface TokenizePropertyData {
  tokenAmount: number;
  transactionHash: string;
  tokenId: number;
}
