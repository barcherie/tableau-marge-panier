// 📄 CartView.jsx — avec prix d'achat ajouté
import React, { useState, useEffect } from 'react';
import { getCartItems, updateCartItemQuantity } from './services/cartService';

export default function CartView() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    getCartItems().then(setCart);
  }, []);

  const getHT = (price, tva) => price / (1 + (tva || 0) / 100);

  const getLineTotal = (p) => (p.selling_price || 0) * (p.quantity || 0);

  const getMargin = (p) => {
    const ht = getHT(p.selling_price || 0, p.tva_rate || 0);
    return ht && p.purchase_price ? ((ht - p.purchase_price) / ht) * 100 : 0;
  };

  const handleChangeQuantity = async (productId, delta) => {
    const product = cart.find((p) => p.id === productId);
    if (!product) return;
    const newQty = (product.quantity || 0) + delta;
    if (newQty < 1) return;
    await updateCartItemQuantity(productId, newQty);
    setCart(await getCartItems());
  };

  const total = cart.reduce((sum, p) => sum + getLineTotal(p), 0);
  const marginAvg = cart.length
    ? cart.reduce((sum, p) => sum + getMargin(p), 0) / cart.length
    : 0;

  return (
    <div className="page">
      <h1 className="text-center">🛒 Mon Panier</h1>

      {cart.length === 0 ? (
        <p className="text-center">Aucun produit dans le panier.</p>
      ) : (
        <div className="cart-layout">
          <div className="cart-table">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Achat</th>
                  <th>PU</th>
                  <th>Qté</th>
                  <th>Total</th>
                  <th>Marge</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.purchase_price?.toFixed(2) || '–'} €</td>
                    <td>{p.selling_price?.toFixed(2) || '–'} €</td>
                    <td>
                      <button onClick={() => handleChangeQuantity(p.id, -1)}>-</button>
                      <span style={{ margin: '0 8px' }}>{p.quantity || 0}</span>
                      <button onClick={() => handleChangeQuantity(p.id, 1)}>+</button>
                    </td>
                    <td>{getLineTotal(p).toFixed(2)} €</td>
                    <td>{getMargin(p).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="summary-box-right">
            <h3>Résumé</h3>
            <p><strong>Total :</strong> {total.toFixed(2)} €</p>
            <p><strong>Marge moyenne :</strong> {marginAvg.toFixed(2)}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
