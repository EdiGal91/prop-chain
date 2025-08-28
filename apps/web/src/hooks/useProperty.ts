import { useState, useCallback } from "react";
import type {
  Property,
  CreatePropertyData,
  TokenizePropertyData,
} from "../types/property";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function useProperty() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProperty = useCallback(
    async (data: CreatePropertyData): Promise<Property> => {
      setIsLoading(true);
      setError(null);

      try {
        // First create the property with JSON data
        const propertyData = {
          title: data.title,
          address: data.address,
          area: data.area,
        };

        const response = await fetch(`${API_BASE_URL}/properties`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(propertyData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create property");
        }

        const property = await response.json();

        // If there's an image, upload it separately
        if (data.image) {
          const formData = new FormData();
          formData.append("image", data.image);

          const imageResponse = await fetch(
            `${API_BASE_URL}/properties/${property.id}/image`,
            {
              method: "POST",
              credentials: "include",
              body: formData,
            }
          );

          if (!imageResponse.ok) {
            console.warn("Failed to upload image, but property was created");
          }
        }

        return property;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create property";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getMyProperties = useCallback(async (): Promise<Property[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/properties`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }

      return await response.json();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch properties";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProperty = useCallback(async (id: string): Promise<Property> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch property");
      }

      return await response.json();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch property";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProperty = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete property");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete property";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const tokenizeProperty = useCallback(
    async (id: string, data: TokenizePropertyData): Promise<Property> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/properties/${id}/tokenize`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to tokenize property");
        }

        return await response.json();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to tokenize property";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getPropertyImageUrl = useCallback((id: string): string => {
    return `${API_BASE_URL}/properties/${id}/image`;
  }, []);

  return {
    isLoading,
    error,
    createProperty,
    getMyProperties,
    getProperty,
    deleteProperty,
    tokenizeProperty,
    getPropertyImageUrl,
  };
}
