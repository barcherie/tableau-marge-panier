// 📄 App.jsx (version clean avec bouton Déconnexion + lien panier)
import React from "react";
import { Link } from "react-router-dom";
import ProductView from "./ProductView";
import supabase from "./services/supabaseClient";

function App() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Recharge pour repasser à /login via AppRouter
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem" }}>
        <Link to="/panier" className="see-cart-button">Voir mon panier</Link>
        <button onClick={handleLogout}>Se déconnecter</button>
      </div>
      <ProductView />
    </div>
  );
}

export default App;
