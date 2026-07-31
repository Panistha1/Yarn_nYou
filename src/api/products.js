const API_BASE_URL = "/api";

export async function getCategories(includeDeleted = false) {

  const url = includeDeleted
    ? `${API_BASE_URL}/categories?includeDeleted=true`
    : `${API_BASE_URL}/categories`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to load categories");
  }

  return data;
}

export async function createCategory(payload, token) {

  const res = await fetch(`${API_BASE_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create category");
  }

  return data;
}

export async function updateCategory(categoryId, payload, token) {

  const res = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update category");
  }

  return data;
}

export async function deleteCategory(categoryId, token) {

  const res = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to delete category");
  }

  return data;
}

export async function restoreCategory(categoryId, token) {

  const res = await fetch(`${API_BASE_URL}/categories/${categoryId}/restore`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to restore category");
  }

  return data;
}

export async function getAllProducts(includeDeleted = false) {

  const url = includeDeleted
    ? `${API_BASE_URL}/products?includeDeleted=true`
    : `${API_BASE_URL}/products`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to load products");
  }

  return data;
}

export async function getProductById(productId) {

  const res = await fetch(`${API_BASE_URL}/products/${productId}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to load product");
  }

  return data;
}

export async function updateProduct(productId, formData, token) {

  const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
      // No Content-Type — FormData sets its own multipart boundary
    },
    body: formData
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update product");
  }

  return data;
}

export async function deleteProductImage(productId, imageId, token) {

  const res = await fetch(`${API_BASE_URL}/products/${productId}/images/${imageId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to delete image");
  }

  return data;
}

export async function deleteProduct(productId, token) {

  const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to delete product");
  }

  return data;
}

export async function restoreProduct(productId, token) {

  const res = await fetch(`${API_BASE_URL}/products/${productId}/restore`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to restore product");
  }

  return data;
}

export async function createProduct(formData, token) {

  // formData is a FormData object (built in the component) — NOT JSON,
  // since we're sending files alongside text fields.
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
      // No Content-Type here — the browser sets the correct
      // multipart/form-data boundary automatically for FormData.
    },
    body: formData
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create product");
  }

  return data;
}