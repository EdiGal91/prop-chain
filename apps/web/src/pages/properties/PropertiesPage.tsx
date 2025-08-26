import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProperty } from "../../hooks/useProperty";
import { useAuth } from "../../hooks/useAuth";
import type { Property } from "../../types/property";

export function PropertiesPage() {
  const { user } = useAuth();
  const {
    getMyProperties,
    deleteProperty,
    getPropertyImageUrl,
    isLoading,
    error,
  } = useProperty();
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    if (user) {
      loadProperties();
    }
  }, [user]);

  const loadProperties = async () => {
    try {
      const data = await getMyProperties();
      setProperties(data);
    } catch (err) {
      console.error("Failed to load properties:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this property?")) {
      try {
        await deleteProperty(id);
        setProperties(properties.filter((p) => p.id !== id));
      } catch (err) {
        console.error("Failed to delete property:", err);
      }
    }
  };

  if (!user) {
    return (
      <div className="properties-page">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please connect your wallet and sign in to view your properties.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="properties-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="properties-page">
      <div className="page-header">
        <h1>My Properties</h1>
        <Link to="/properties/create" className="create-btn">
          ➕ Create New Property
        </Link>
      </div>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      {properties.length === 0 ? (
        <div className="empty-state">
          <h3>No Properties Yet</h3>
          <p>
            You haven't created any properties yet. Start by creating your first
            property!
          </p>
          <Link to="/properties/create" className="action-btn primary">
            Create Your First Property
          </Link>
        </div>
      ) : (
        <div className="properties-grid">
          {properties.map((property) => (
            <div key={property.id} className="property-card">
              <div className="property-thumb">
                {property.hasImage ? (
                  <img
                    src={getPropertyImageUrl(property.id)}
                    alt={property.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="property-thumb--placeholder">No Image</div>
                )}
                <div className="property-badges">
                  <span className="pill pill-area">{property.area} m²</span>
                  <span className="pill pill-status">{property.status}</span>
                </div>
              </div>

              <div className="property-content">
                <h3>{property.title}</h3>
                <p className="property-address">
                  {property.address.city}, {property.address.country}
                </p>
                <div className="property-actions">
                  <Link to={`/properties/${property.id}`} className="view-btn">
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
