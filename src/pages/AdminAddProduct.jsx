import "../styles/adminAddProduct.css";

import { useState, useEffect, useCallback } from "react";

import { getCategories } from "../api/products";
import { createProduct } from "../api/products";
import { showSuccess, showError } from "../utils/toast";

// Fallback list seeded from your schema INSERT INTO categories
// Used when the API call fails so the form is never broken.
const FALLBACK_CATEGORIES = [
  { category_id: 1, category_name: "Animals" },
  { category_id: 2, category_name: "Flowers" },
  { category_id: 3, category_name: "Food" },
  { category_id: 4, category_name: "Anime" },
  { category_id: 5, category_name: "Custom" }
];

function AdminAddProduct() {

  const token = localStorage.getItem("token");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [categoryError, setCategoryError] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);

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

  /* LOAD CATEGORIES FOR THE DROPDOWN */
  const loadCategories = useCallback(() => {
    setCategoryError("");

    getCategories()
      .then((data) => {
        if (data && data.length > 0) {
          setCategories(data);
          setUsingFallback(false);
        } else {
          // API returned empty array — use fallback
          setCategories(FALLBACK_CATEGORIES);
          setUsingFallback(true);
          setCategoryError("API returned no categories — showing defaults.");
        }
      })
      .catch(() => {
        // API unreachable — use fallback so the form still works
        setCategories(FALLBACK_CATEGORIES);
        setUsingFallback(true);
        setCategoryError("Backend unreachable — using default categories. Restart your backend and click Retry.");
      });
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

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

    setPreviews(files.map((file) => URL.createObjectURL(file)));

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (
      !formData.category_id ||
      !formData.name ||
      !formData.price
    ) {
      showError("Category, name and price are required");
      return;
    }

    try {

      setLoading(true);

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

      await createProduct(payload, token);

      showSuccess("Product added successfully");

      // Reset the form for the next product
      setFormData({
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
      setPreviews([]);

    } catch (err) {

      showError(err.message);

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="admin-add-container">

      <h1>Add New Keychain</h1>
      <p className="admin-subtext">
        Fill in the details below to list a new crochet keychain.
      </p>

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

            {categoryError && (
              <span style={{ color: usingFallback ? "#b67d1c" : "#c0392b", fontSize: "12px", marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                {usingFallback ? "⚠" : "✗"} {categoryError}
                <button
                  type="button"
                  onClick={loadCategories}
                  style={{ fontSize: "12px", padding: "2px 10px", borderRadius: "20px", border: "1px solid #ef9c84", background: "white", color: "#ef9c84", cursor: "pointer" }}
                >
                  Retry
                </button>
              </span>
            )}
          </label>

          <label>
            Name
            <input
              type="text"
              name="name"
              placeholder="e.g. Orange Cat Keychain"
              value={formData.name}
              onChange={handleChange}
            />
          </label>

        </div>

        <label>
          Description
          <textarea
            name="description"
            placeholder="Describe the keychain..."
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
              placeholder="350"
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
              placeholder="10"
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
              placeholder="e.g. Cotton yarn"
              value={formData.material}
              onChange={handleChange}
            />
          </label>

          <label>
            Color
            <input
              type="text"
              name="color"
              placeholder="e.g. Orange"
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

        <label>
          Product Images
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            multiple
            onChange={handleImageChange}
          />
        </label>

        {previews.length > 0 && (
          <div className="image-preview-row">
            {previews.map((src, i) => (
              <img key={i} src={src} alt={`preview-${i}`} />
            ))}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Adding Product..." : "Add Product"}
        </button>

      </form>

    </div>
  );
}

export default AdminAddProduct;