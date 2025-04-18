// 📄 App.jsx (version clean avec bouton Déconnexion)
import React from "react";
import ProductView from "./ProductView";
import supabase from "./services/supabaseClient";

function App() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Recharge pour repasser à /login via AppRouter
  };

  return (
    <div>
      <ProductView />
    </div>
  );
}

export default App;
