import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProperty } from "../../hooks/useProperty";
import { useAuth } from "../../hooks/useAuth";
import type { CreatePropertyData } from "../../types/property";

export function CreatePropertyPage() {
  const { user } = useAuth();
  const { createProperty, isLoading, error } = useProperty();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CreatePropertyData>({
    title: "",
    address: {
      country: "",
      city: "",
    },
    area: 0,
    image: undefined,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="create-property-page">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please connect your wallet and sign in to create a property.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "area" ? (value === "" ? 0 : Number(value)) : value,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size must be less than 2MB");
        return;
      }

      // Check file type
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
        alert("Only image files (JPG, PNG, GIF) are allowed");
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, image: undefined }));
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const property = await createProperty(formData);
      navigate(`/properties/${property.id}`);
    } catch (err) {
      console.error("Failed to create property:", err);
    }
  };

  return (
    <div className="create-property-page">
      <div className="page-header">
        <h1>Create New Property</h1>
        <button
          type="button"
          onClick={() => navigate("/properties")}
          className="back-btn"
        >
          ← Back to Properties
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="property-form">
        <div className="form-section">
          <h3>Basic Information</h3>

          <div className="form-group">
            <label htmlFor="title">Property Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="e.g., Beautiful Home in Downtown"
            />
          </div>

          <div className="form-group">
            <label htmlFor="area">Area (m²) *</label>
            <input
              type="number"
              id="area"
              name="area"
              value={formData.area || ""}
              onChange={handleInputChange}
              required
              min="1"
              placeholder="0"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Address</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address.country">Country *</label>
              <input
                type="text"
                id="address.country"
                name="address.country"
                value={formData.address.country}
                onChange={handleInputChange}
                required
                placeholder="e.g., United States"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address.city">City *</label>
              <input
                type="text"
                id="address.city"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                required
                placeholder="e.g., New York"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Property Image</h3>

          <div className="form-group">
            <label htmlFor="image">Upload Image (Max 2MB)</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleImageChange}
            />
            <small className="form-help">
              Supported formats: JPG, PNG, GIF. Maximum size: 2MB
            </small>
          </div>

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Property preview" />
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, image: undefined }));
                  setImagePreview(null);
                  const fileInput = document.getElementById(
                    "image"
                  ) as HTMLInputElement;
                  if (fileInput) fileInput.value = "";
                }}
                className="remove-image-btn"
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/properties")}
            className="cancel-btn"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Property"}
          </button>
        </div>
      </form>
    </div>
  );
}
