import "../styles/adminAddProduct.css";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { getProductById, updateProduct, getCategories, deleteProductImage } from "../api/products";
import { showSuccess, showError } from "../utils/toast";



function AdminEditProduct() {

  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPreviews, setNewPreviews] = useState([]);

  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
    price: "",
    stock: "",
    material: "",
    color: "",
    featured: false,
    images: []
  });

  /* LOAD CATEGORIES + EXISTING PRODUCT */
  useEffect(() => {

    Promise.all([getCategories(), getProductById(id)])
      .then(([categoryList, product]) => {

        setCategories(categoryList);

        setFormData({
          category_id: product.category_id,
          name: product.name,
          description: product.description || "",
          price: product.price,
          stock: product.stock,
          material: product.material || "",
          color: product.color || "",
          featured: Boolean(product.featured),
          images: []
        });

        setExistingImages(product.images || []);

      })
      .catch((err) => showError(err.message))
      .finally(() => setLoading(false));

  }, [id]);

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });

  };

  const handleImageChange = (e) => {

    const files = Array.from(e.target.files);

    setFormData({ ...formData, images: files });

    setNewPreviews(files.map((file) => URL.createObjectURL(file)));

  };

  const handleDeleteExistingImage = async (imageId) => {

    const confirmed = window.confirm("Remove this image?");
    if (!confirmed) return;

    try {
      await deleteProductImage(id, imageId, token);
      setExistingImages(existingImages.filter((img) => img.image_id !== imageId));
    } catch (err) {
      showError(err.message);
    }

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!formData.category_id || !formData.name || !formData.price) {
      showError("Category, name and price are required");
      return;
    }

    try {

      setSaving(true);

      const payload = new FormData();
      payload.append("category_id", formData.category_id);
      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("price", formData.price);
      payload.append("stock", formData.stock || 0);
      payload.append("material", formData.material);
      payload.append("color", formData.color);
      payload.append("featured", formData.featured);

      formData.images.forEach((file) => {
        payload.append("images", file);
      });

      await updateProduct(id, payload, token);

      showSuccess("Product updated successfully");
      navigate("/admin/products");

    } catch (err) {

      showError(err.message);

    } finally {

      setSaving(false);

    }

  };

  if (loading) {
    return <p className="loading-text">Loading product...</p>;
  }

  return (
    <div className="admin-add-container">

      <Link to="/admin/products" className="back-link">&lt; Back to Products</Link>

      <h1>Edit Keychain</h1>
      <p className="admin-subtext">Update the details for this product.</p>

      <form onSubmit={handleSubmit} className="admin-add-form">

        <div className="form-row">

          <label>
            Category
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </label>

        </div>

        <label>
          Description
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </label>

        <div className="form-row">

          <label>
            Price (NPR)
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </label>

          <label>
            Stock
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
            />
          </label>

        </div>

        <div className="form-row">

          <label>
            Material
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
            />
          </label>

          <label>
            Color
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
            />
          </label>

        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
          />
          Feature this product on the homepage
        </label>

        {existingImages.length > 0 && (
          <div className="existing-images-block">
            <span className="field-label">Current Images</span>
            <div className="image-preview-row">
              {existingImages.map((img) => (
                <div className="image-preview-wrap" key={img.image_id}>
                  <img src={`${img.image_url}`} alt="" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => handleDeleteExistingImage(img.image_id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <label>
          Add More Images
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            multiple
            onChange={handleImageChange}
          />
        </label>

        {newPreviews.length > 0 && (
          <div className="image-preview-row">
            {newPreviews.map((src, i) => (
              <img key={i} src={src} alt={`new-preview-${i}`} />
            ))}
          </div>
        )}

        <button type="submit" disabled={saving}>
          {saving ? "Saving Changes..." : "Save Changes"}
        </button>

      </form>

    </div>
  );
}

export default AdminEditProduct;