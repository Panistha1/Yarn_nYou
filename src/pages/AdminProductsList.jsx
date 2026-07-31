import "../styles/adminProductsList.css";

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

import { getAllProducts, deleteProduct, restoreProduct } from "../api/products";
import { showSuccess, showError } from "../utils/toast";

const PRODUCTS_PER_PAGE = 10;
const LOW_STOCK_THRESHOLD = 5;


function AdminProductsList() {

  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  /* LOAD PRODUCTS */
  const loadProducts = () => {

    setLoading(true);

    getAllProducts(true) // includeDeleted — admin needs to see + restore them
      .then(setProducts)
      .catch((err) => showError(err.message))
      .finally(() => setLoading(false));

  };

  useEffect(() => {
    loadProducts();
  }, []);

  /* DERIVED STATS — based on active (non-deleted) products only */
  const activeProducts = products.filter((p) => !p.deleted_at);

  const totalProducts = activeProducts.length;

  const lowStockCount = activeProducts.filter(
    (p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD
  ).length;

  const activeCategoryCount = new Set(
    activeProducts.map((p) => p.category_id)
  ).size;

  /* SEARCH FILTER */
  const filteredProducts = useMemo(() => {

    const term = searchTerm.trim().toLowerCase();

    if (!term) return products;

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.sku && p.sku.toLowerCase().includes(term))
    );

  }, [products, searchTerm]);

  /* PAGINATION */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );

  const pagedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const getStatus = (product) => {
    if (product.deleted_at) return { label: "Deleted", className: "status-deleted" };
    if (product.stock === 0) return { label: "Out of Stock", className: "status-out" };
    return { label: "Active", className: "status-active" };
  };

  const handleDelete = async (product) => {

    const confirmed = window.confirm(
      `Delete "${product.name}"? It'll be hidden from the shop but can be restored later from this list.`
    );

    if (!confirmed) return;

    try {
      await deleteProduct(product.product_id, token);
      showSuccess("Product deleted");
      loadProducts();
    } catch (err) {
      showError(err.message);
    }

  };

  const handleRestore = async (product) => {
    try {
      await restoreProduct(product.product_id, token);
      showSuccess("Product restored");
      loadProducts();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="admin-products-container">

      <div className="admin-products-header">
        <div>
          <h1>Product Catalog</h1>
          <p className="admin-subtext">Manage your handmade crochet collection.</p>
        </div>

        <Link to="/admin/add-product" className="create-product-btn">
          + Create Product
        </Link>
      </div>

      <div className="stats-row">

        <div className="stat-card">
          <span className="stat-label">Total Products</span>
          <span className="stat-value">{totalProducts}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Low Stock</span>
          <span className="stat-value warning">{lowStockCount}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Active Categories</span>
          <span className="stat-value">{activeCategoryCount}</span>
        </div>

      </div>

      <div className="search-row">
        <input
          type="text"
          placeholder="Search products by name or SKU..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {loading ? (
        <p className="loading-text">Loading products...</p>
      ) : (
        <>
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">
                    No products found.
                  </td>
                </tr>
              ) : (
                pagedProducts.map((product) => {
                  const status = getStatus(product);
                  const isDeleted = Boolean(product.deleted_at);
                  const isLowStock =
                    !isDeleted && product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

                  return (
                    <tr key={product.product_id} className={isDeleted ? "deleted-row" : ""}>
                      <td className="product-cell">
                        <img
                          src={
                            product.primary_image
                              ? `${product.primary_image}`
                              : "/images/hh.png"
                          }
                          alt={product.name}
                        />
                        <span>{product.name}</span>
                      </td>
                      <td>{product.sku || "—"}</td>
                      <td>{product.category_name}</td>
                      <td>Rs. {Number(product.price).toFixed(2)}</td>
                      <td>
                        {product.stock} units
                        {isLowStock && (
                          <span className="low-stock-tag">LOW STOCK</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-pill ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="actions-cell">
                        {isDeleted ? (
                          <button
                            className="restore-btn"
                            onClick={() => handleRestore(product)}
                            title="Restore product"
                          >
                            Restore
                          </button>
                        ) : (
                          <>
                            <Link
                              to={`/admin/products/${product.product_id}/edit`}
                              className="edit-btn"
                            >
                              Edit
                            </Link>
                            <button
                              className="delete-btn"
                              onClick={() => handleDelete(product)}
                              title="Delete product"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="pagination-row">
            <span>
              Showing {pagedProducts.length} of {filteredProducts.length} products
            </span>

            <div className="pagination-controls">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </button>

              <span className="page-indicator">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

export default AdminProductsList;