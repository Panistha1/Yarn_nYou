import "../styles/adminUsersList.css";

import { useState, useEffect } from "react";

import { getAllUsers, updateUserRole, deleteUser, restoreUser } from "../api/dashboard";
import { showError, showSuccess } from "../utils/toast";

function AdminUsersList() {

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

const loadUsers = () => {
  getAllUsers(token, true) // includeDeleted — admin needs to see + restore them
    .then((data) => {
      const customers = data.filter(
        (user) => user.role.toLowerCase() !== "admin"
      );
      setUsers(customers);
    })
    .catch((err) => showError(err.message))
    .finally(() => setLoading(false));
};

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleRole = async (user) => {

    const newRole = user.role === "Admin" ? "Customer" : "Admin";

    if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) {
      return;
    }

    try {
      setUpdatingId(user.user_id);
      await updateUserRole(user.user_id, newRole, token);
      loadUsers();
    } catch (err) {
      showError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (user) => {

    if (!window.confirm(`Delete ${user.name}'s account? It can be restored later from this list.`)) {
      return;
    }

    try {
      setUpdatingId(user.user_id);
      await deleteUser(user.user_id, token);
      showSuccess("User deleted");
      loadUsers();
    } catch (err) {
      showError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRestore = async (user) => {
    try {
      setUpdatingId(user.user_id);
      await restoreUser(user.user_id, token);
      showSuccess("User restored");
      loadUsers();
    } catch (err) {
      showError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-users-container">

      <div className="users-header">
        <h1>Users</h1>
        <p className="admin-subtext">Everyone with an account on your store.</p>
      </div>

      {loading ? (
        <p className="loading-text">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="empty-text">No users found.</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Orders</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isDeleted = Boolean(u.deleted_at);
              const isSelf = storedUser?.id === u.user_id;

              return (
                <tr key={u.user_id} className={isDeleted ? "deleted-row" : ""}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || "—"}</td>
                  <td>
                    <span className={`role-badge role-${u.role.toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.order_count}</td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-pill ${isDeleted ? "status-deleted" : "status-active"}`}>
                      {isDeleted ? "Deleted" : "Active"}
                    </span>
                  </td>
                  <td className="users-actions">
                    {isSelf ? (
                      <span className="self-tag">You</span>
                    ) : isDeleted ? (
                      <button
                        className="restore-inline-btn"
                        disabled={updatingId === u.user_id}
                        onClick={() => handleRestore(u)}
                      >
                        {updatingId === u.user_id ? "Restoring..." : "Restore"}
                      </button>
                    ) : (
                      <>
                        <button
                          className="toggle-role-btn"
                          disabled={updatingId === u.user_id}
                          onClick={() => handleToggleRole(u)}
                        >
                          {u.role === "Admin" ? "Make Customer" : "Make Admin"}
                        </button>
                        <button
                          className="delete-inline-btn"
                          disabled={updatingId === u.user_id}
                          onClick={() => handleDelete(u)}
                        >
                          {updatingId === u.user_id ? "Deleting..." : "Delete"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

    </div>
  );
}

export default AdminUsersList;