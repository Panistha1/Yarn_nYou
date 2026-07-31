import "../styles/adminSettings.css";

import { useState, useEffect } from "react";

import { getSettings, updateSettings } from "../api/settings";
import { showSuccess, showError } from "../utils/toast";

const TABS = ["General", "Shipping", "Taxes", "Integrations"];

function AdminSettings() {

  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("General");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    shop_name: "",
    store_email: "",
    currency: "NPR",
    language: "English (United States)"
  });

  const [settingsError, setSettingsError] = useState("");

  useEffect(() => {

    getSettings(token)
      .then((data) =>
        setFormData({
          shop_name: data.shop_name,
          store_email: data.store_email,
          currency: data.currency,
          language: data.language
        })
      )
      .catch((err) => setSettingsError(err.message))
      .finally(() => setLoading(false));

  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {

    if (!formData.shop_name || !formData.store_email) {
      showError("Shop name and store email are required");
      return;
    }

    try {
      setSaving(true);
      await updateSettings(formData, token);
      showSuccess("Settings saved successfully");
    } catch (err) {
      showError(err.message);
    } finally {
      setSaving(false);
    }

  };

  return (
    <div className="admin-settings-container">

      <div className="settings-header">
        <div>
          <h1>Store Settings</h1>
          <p className="admin-subtext">Configure your cozy shop's global preferences.</p>
        </div>

        <button className="save-btn" onClick={handleSave} disabled={saving || loading}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="settings-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="loading-text">Loading settings...</p>
      ) : settingsError ? (
        <div className="settings-panel">
          <div className="settings-section">
            <h3 style={{ color: "#c0392b" }}>⚠ Could not load settings</h3>
            <p style={{ marginTop: "10px", color: "#555" }}>{settingsError}</p>
            <p style={{ marginTop: "8px", color: "#888", fontSize: "13px" }}>
              Make sure your backend is running and connected to the database.
            </p>
          </div>
        </div>
      ) : activeTab === "General" ? (
        <div className="settings-panel">

          <div className="settings-section">
            <h3>🌐 Store Identity</h3>
            <p className="section-subtext">How your brand appears to customers.</p>

            <div className="settings-row">

              <label>
                Shop Name
                <input
                  type="text"
                  name="shop_name"
                  value={formData.shop_name}
                  onChange={handleChange}
                />
                <span className="field-hint">Used in headers, emails, and invoices.</span>
              </label>

              <label>
                Store Email
                <input
                  type="email"
                  name="store_email"
                  value={formData.store_email}
                  onChange={handleChange}
                />
                <span className="field-hint">Customers will see this as your contact address.</span>
              </label>

            </div>
          </div>

          <div className="settings-section">
            <h3>🌍 Localization</h3>
            <p className="section-subtext">Currency and formatting preferences.</p>

            <div className="settings-row">

              <label>
                Currency
                <select name="currency" value={formData.currency} onChange={handleChange}>
                  <option value="NPR">Nepali Rupee (Rs.)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="INR">Indian Rupee (₹)</option>
                </select>
              </label>

              <label>
                Language
                <select name="language" value={formData.language} onChange={handleChange}>
                  <option value="English (United States)">English (United States)</option>
                  <option value="Nepali">Nepali</option>
                </select>
              </label>

            </div>
          </div>

        </div>
      ) : (
        <div className="settings-panel">
          <p className="coming-soon-text">
            {activeTab} settings aren't built yet — this tab is a placeholder for now.
          </p>
        </div>
      )}

    </div>
  );
}

export default AdminSettings;