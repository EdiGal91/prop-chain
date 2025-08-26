export interface PropertyAddress {
  country: string;
  city: string;
}

export interface Property {
  id: string;
  issuer: string;
  title: string;
  address: PropertyAddress;
  area: number;
  status: string;
  hasImage: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyData {
  title: string;
  address: PropertyAddress;
  area: number;
  image?: File;
}

export interface PropertiesResponse {
  properties: Property[];
  total: number;
  page: number;
  totalPages: number;
}
