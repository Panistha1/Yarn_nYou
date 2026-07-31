const API_BASE_URL = "/api";

export async function getSettings(token) {

  const res = await fetch(`${API_BASE_URL}/settings`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to load settings");
  }

  return data;
}

export async function updateSettings(payload, token) {

  const res = await fetch(`${API_BASE_URL}/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update settings");
  }

  return data;
}