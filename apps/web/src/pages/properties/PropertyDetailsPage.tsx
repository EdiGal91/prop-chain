import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProperty } from "../../hooks/useProperty";
import { useAuth } from "../../hooks/useAuth";
import type { Property } from "../../types/property";

export function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getProperty, deleteProperty, getPropertyImageUrl, isLoading, error } =
    useProperty();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    if (!id) return;

    try {
      const data = await getProperty(id);
      setProperty(data);
    } catch (err) {
      console.error("Failed to load property:", err);
    }
  };

  const handleDelete = async () => {
    if (!property || !id) return;

    try {
      await deleteProperty(id);
      navigate("/properties");
    } catch (err) {
      console.error("Failed to delete property:", err);
    }
  };

  if (!user) {
    return (
      <div className="property-details-page">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>
            Please connect your wallet and sign in to view property details.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="property-details-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="property-details-page">
        <div className="error-state">
          <h2>Property Not Found</h2>
          <p>
            {error ||
              "The property you're looking for doesn't exist or has been removed."}
          </p>
          <button onClick={() => navigate("/properties")} className="back-btn">
            ← Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user.address === property.issuer;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="property-details-page">
      {/* Header with back button and actions */}
      <div className="detail-page-header">
        <button onClick={() => navigate("/properties")} className="back-btn">
          ← Back to Properties
        </button>
        {isOwner && (
          <button onClick={handleDelete} className="delete-btn">
            Delete
          </button>
        )}
      </div>

      {/* Main content container */}
      <div className="detail-container">
        {/* Image section */}
        <div className="detail-image-section">
          {property.hasImage && !imageError ? (
            <img
              src={getPropertyImageUrl(property.id)}
              alt={property.title}
              className="detail-image"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="detail-image-placeholder">
              <div className="placeholder-icon">📷</div>
              <p>No image available</p>
            </div>
          )}
        </div>

        {/* Content section */}
        <div className="detail-content">
          {/* Title and basic info */}
          <div className="detail-header">
            <h1 className="detail-title">{property.title}</h1>
            <div className="detail-badges">
              <span className="badge badge-status">{property.status}</span>
              <span className="badge badge-area">{property.area} m²</span>
            </div>
            <div className="detail-location">
              <span>
                📍 {property.address.city}, {property.address.country}
              </span>
            </div>
          </div>

          {/* Info cards */}
          <div className="detail-cards">
            <div className="info-card">
              <h3>Property Details</h3>
              <div className="info-row">
                <span className="info-label">Area</span>
                <span className="info-value">{property.area} m²</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status</span>
                <span className="info-value">{property.status}</span>
              </div>
            </div>

            <div className="info-card">
              <h3>Ownership</h3>
              <div className="info-row">
                <span className="info-label">Owner</span>
                <span className="info-value owner">
                  {property.issuer === user.address ? "You" : property.issuer}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Created</span>
                <span className="info-value">
                  {formatDate(property.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
