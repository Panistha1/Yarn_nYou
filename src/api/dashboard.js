const API_BASE_URL = "/api";

export async function getMyProfile(token) {

  const res = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to load profile");
  }

  return data;
}

export async function updateProfile(payload, token) {

  const res = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update profile");
  }

  return data;
}

export async function getDashboardStats(token) {

  const res = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to load dashboard stats");
  }

  return data;
}

export async function getAllUsers(token, includeDeleted = false) {

  const url = includeDeleted
    ? `${API_BASE_URL}/admin/users?includeDeleted=true`
    : `${API_BASE_URL}/admin/users`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to load users");
  }

  return data;
}

export async function deleteUser(userId, token) {

  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to delete user");
  }

  return data;
}

export async function restoreUser(userId, token) {

  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/restore`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to restore user");
  }

  return data;
}

export async function updateUserRole(userId, role, token) {

  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ role })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update user role");
  }

  return data;
}