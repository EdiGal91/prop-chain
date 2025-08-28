import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProperty } from "../../hooks/useProperty";
import { useAuth } from "../../hooks/useAuth";
import { useTokenization } from "../../hooks/useTokenization";
import { useTokenBalance, useTokenInfo } from "../../hooks/useTokenBalance";
import type { Property } from "../../types/property";

export function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getProperty, deleteProperty, getPropertyImageUrl, isLoading, error } =
    useProperty();
  const {
    tokenizeProperty,
    isTokenizing,
    error: tokenizeError,
  } = useTokenization();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [imageError, setImageError] = useState(false);
  const [showTokenizeForm, setShowTokenizeForm] = useState(false);
  const [tokenAmount, setTokenAmount] = useState(100);

  // Get token balance and info from blockchain
  const { balance, refetch: refetchBalance } = useTokenBalance(
    property?.tokenization?.tokenId
  );
  const { tokenName } = useTokenInfo(property?.tokenization?.tokenId);

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

  const handleTokenize = async () => {
    if (!property || !id) return;

    try {
      await tokenizeProperty(id, property.title, tokenAmount);
      // Reload property data to show tokenization info
      await loadProperty();
      // Refetch blockchain balance
      refetchBalance();
      setShowTokenizeForm(false);
    } catch (err) {
      console.error("Failed to tokenize property:", err);
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
          <div className="header-actions">
            {!property.tokenization && (
              <button
                onClick={() => setShowTokenizeForm(true)}
                className="tokenize-btn"
                disabled={isTokenizing}
              >
                {isTokenizing ? "Tokenizing..." : "Tokenize Property"}
              </button>
            )}
            <button onClick={handleDelete} className="delete-btn">
              Delete
            </button>
          </div>
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
              {property.tokenization && (
                <span className="badge badge-tokenized">Tokenized</span>
              )}
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

            {property.tokenization && (
              <div className="info-card">
                <h3>Tokenization</h3>
                <div className="info-row">
                  <span className="info-label">Token ID</span>
                  <span className="info-value">
                    #{property.tokenization.tokenId}
                  </span>
                </div>
                {tokenName && (
                  <div className="info-row">
                    <span className="info-label">Token Name</span>
                    <span className="info-value">{tokenName}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Total Supply</span>
                  <span className="info-value">
                    {property.tokenization.tokenAmount}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Your Balance</span>
                  <span className="info-value">
                    <strong>{balance} tokens</strong>
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Contract</span>
                  <span className="info-value contract-address">
                    {property.tokenization.contractAddress}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Transaction</span>
                  <a
                    href={`https://testnet.explorer.etherlink.com/tx/${property.tokenization.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="info-value tx-link"
                  >
                    View on Explorer ↗
                  </a>
                </div>
                <div className="info-row">
                  <span className="info-label">Tokenized</span>
                  <span className="info-value">
                    {formatDate(property.tokenization.tokenizedAt)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tokenization Modal */}
      {showTokenizeForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Tokenize Property</h2>
              <button
                className="modal-close"
                onClick={() => setShowTokenizeForm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Create ERC-1155 tokens for your property.</p>
              <div className="form-group">
                <label>Number of Tokens</label>
                <input
                  type="number"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(Number(e.target.value))}
                  min="1"
                  max="1000000"
                  placeholder="e.g., 100"
                />
                <small>
                  Choose how many tokens to create for this property
                </small>
              </div>
              {tokenizeError && (
                <div className="error-message">{tokenizeError}</div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowTokenizeForm(false)}
                disabled={isTokenizing}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleTokenize}
                disabled={isTokenizing || tokenAmount < 1}
              >
                {isTokenizing ? "Tokenizing..." : "Tokenize"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
