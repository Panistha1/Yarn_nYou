import "../styles/adminCategories.css";

import { useState, useEffect } from "react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory
} from "../api/products";
import { showError, showSuccess } from "../utils/toast";

function AdminCategories() {

  const token = localStorage.getItem("token");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newCategory, setNewCategory] = useState({ category_name: "", description: "" });
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ category_name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const loadCategories = () => {
    getCategories(true) // includeDeleted — admin needs to see + restore them
      .then(setCategories)
      .catch((err) => showError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!newCategory.category_name.trim()) {
      showError("Category name is required");
      return;
    }

    try {
      setCreating(true);
      await createCategory(newCategory, token);
      setNewCategory({ category_name: "", description: "" });
      loadCategories();
    } catch (err) {
      showError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category.category_id);
    setEditForm({
      category_name: category.category_name,
      description: category.description || ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ category_name: "", description: "" });
  };

  const handleSaveEdit = async (categoryId) => {

    if (!editForm.category_name.trim()) {
      showError("Category name is required");
      return;
    }

    try {
      setSaving(true);
      await updateCategory(categoryId, editForm, token);
      cancelEdit();
      loadCategories();
    } catch (err) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId, categoryName) => {

    if (!window.confirm(`Delete category "${categoryName}"? It can be restored later from this list.`)) {
      return;
    }

    try {
      await deleteCategory(categoryId, token);
      showSuccess("Category deleted");
      loadCategories();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleRestore = async (categoryId) => {
    try {
      await restoreCategory(categoryId, token);
      showSuccess("Category restored");
      loadCategories();
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="admin-categories-container">

      <div className="categories-header">
        <h1>Categories</h1>
        <p className="admin-subtext">Organize your products into browsable categories.</p>
      </div>

      <form className="add-category-form" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="New category name"
          value={newCategory.category_name}
          onChange={(e) => setNewCategory({ ...newCategory, category_name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newCategory.description}
          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
        />
        <button type="submit" disabled={creating}>
          {creating ? "Adding..." : "+ Add Category"}
        </button>
      </form>

      {loading ? (
        <p className="loading-text">Loading categories...</p>
      ) : categories.length === 0 ? (
        <p className="empty-text">No categories yet — add your first one above.</p>
      ) : (
        <table className="categories-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => {
              const isDeleted = Boolean(cat.deleted_at);

              return (
                <tr key={cat.category_id} className={isDeleted ? "deleted-row" : ""}>
                  {editingId === cat.category_id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          value={editForm.category_name}
                          onChange={(e) => setEditForm({ ...editForm, category_name: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        />
                      </td>
                      <td>
                        <span className="status-pill status-active">Active</span>
                      </td>
                      <td className="categories-actions">
                        <button
                          className="save-inline-btn"
                          onClick={() => handleSaveEdit(cat.category_id)}
                          disabled={saving}
                        >
                          Save
                        </button>
                        <button className="cancel-inline-btn" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{cat.category_name}</td>
                      <td>{cat.description || "—"}</td>
                      <td>
                        <span className={`status-pill ${isDeleted ? "status-deleted" : "status-active"}`}>
                          {isDeleted ? "Deleted" : "Active"}
                        </span>
                      </td>
                      <td className="categories-actions">
                        {isDeleted ? (
                          <button
                            className="restore-inline-btn"
                            onClick={() => handleRestore(cat.category_id)}
                          >
                            Restore
                          </button>
                        ) : (
                          <>
                            <button className="edit-inline-btn" onClick={() => startEdit(cat)}>
                              Edit
                            </button>
                            <button
                              className="delete-inline-btn"
                              onClick={() => handleDelete(cat.category_id, cat.category_name)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

    </div>
  );
}

export default AdminCategories;