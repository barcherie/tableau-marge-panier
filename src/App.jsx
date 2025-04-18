import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductView from "./ProductView";
import CartView from "./CartView";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductView />} />
        <Route path="/panier" element={<CartView />} />
      </Routes>
    </Router>
  );
}

export default App;
