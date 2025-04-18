// 📄 CartView.jsx
import React, { useEffect, useState } from "react";
import { getCartItems, removeFromCart } from "./services/cartService";

function CartView() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    getCartItems().then(setCart).catch(console.error);
  }, []);

  const handleRemove = async (id) => {
    await removeFromCart(id);
    const updated = await getCartItems();
    setCart(updated);
  };

  return (
    <div className="cart-view">
      <h1 style={{ textAlign: "center" }}>🛒 Panier</h1>
      {cart.length === 0 ? (
        <p style={{ textAlign: "center" }}>Aucun produit dans le panier.</p>
      ) : (
        <table style={{ margin: "0 auto", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Nom</th>
              <th>PU</th>
              <th>Qté</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => {
              const p = item.products;
              const total = p.selling_price * item.quantity;
              return (
                <tr key={item.id}>
                  <td>{p.name}</td>
                  <td>{p.selling_price.toFixed(2)} €</td>
                  <td>{item.quantity}</td>
                  <td>{total.toFixed(2)} €</td>
                  <td>
                    <button onClick={() => handleRemove(item.id)}>🗑️ Retirer</button>
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

export default CartView;
