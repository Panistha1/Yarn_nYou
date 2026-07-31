import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/toast.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";

import Account from "./pages/Account";
import UserDashboard from "./pages/UserDashboard";
import MyOrders from "./pages/MyOrders";

import AdminAddProduct from "./pages/AdminAddProduct";
import AdminEditProduct from "./pages/AdminEditProduct";
import AdminProductsList from "./pages/AdminProductsList";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrdersList from "./pages/AdminOrdersList";
import AdminOrderDetail from "./pages/AdminOrderDetail";
import AdminSettings from "./pages/AdminSettings";
import AdminCategories from "./pages/AdminCategories";
import AdminUsersList from "./pages/AdminUsersList";

import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Cart works for guests too (localStorage-backed), so it stays
            outside the login-gated UserLayout — same pattern as Shop. */}
        <Route path="/cart" element={<Cart />} />

        {/* Logged-in customer area: navbar + footer + sidebar + login
            guard all live once in UserLayout instead of in each page. */}
        <Route element={<UserLayout />}>
          <Route path="/userdashboard" element={<UserDashboard />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/account" element={<Account />} />
        </Route>

        {/* Admin area: navbar + sidebar + admin-only guard all live once
            in AdminLayout instead of in each of these 9 pages. */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/add-product" element={<AdminAddProduct />} />
          <Route path="/admin/products/:id/edit" element={<AdminEditProduct />} />
          <Route path="/admin/products" element={<AdminProductsList />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrdersList />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/users" element={<AdminUsersList />} />
        </Route>

        <Route path="/notfound" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;