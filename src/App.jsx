import { BrowserRouter, Routes, Route }
from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/register"
          element={<Register />}
        />
        <Route
  path="/account"
  element={<Account />}
/>
         <Route
          path="/contact"
          element={<Contact />}
        />
         <Route path="/notfound" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;