// 📄 CartView.jsx — refonte export PDF
import React, { useState, useEffect } from 'react';
import { getCartItems, updateCartItemQuantity, removeCartItem } from './services/cartService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from './logo.png';

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

  const handleRemove = async (productId) => {
    await removeCartItem(productId);
    setCart(await getCartItems());
  };

  const totalTTC = cart.reduce((sum, p) => sum + getLineTotal(p), 0);
  const totalHT = cart.reduce((sum, p) => sum + (getHT(p.selling_price, p.tva_rate) * (p.quantity || 0)), 0);
  const marginAvg = cart.length
    ? cart.reduce((sum, p) => sum + getMargin(p), 0) / cart.length
    : 0;

  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const today = new Date();
    const dateStr = today.toLocaleDateString();
    const randomId = Math.floor(1000 + Math.random() * 9000);

    // Logo + Titre
    doc.addImage(logo, 'PNG', 20, 10, 30, 15);
    doc.setFontSize(18);
    doc.text('Devis — Besançon Archerie', 60, 20);

    // Infos Devis
    doc.setFontSize(10);
    doc.text(`Date : ${dateStr}`, 60, 26);
    doc.text(`N° Devis : #${randomId}`, 60, 32);

    // Coordonnées
    doc.text('Besançon Archerie', 20, 45);
    doc.text('25 grande rue, 25770 Franois', 20, 50);
    doc.text('besanconarcherie@gmail.com', 20, 55);

    // Tableau produits
    autoTable(doc, {
      startY: 65,
      head: [['Nom', 'PU TTC', 'Quantité', 'Total TTC']],
      body: cart.map((p) => [
        p.name,
        `${p.selling_price.toFixed(2)} €`,
        p.quantity,
        `${getLineTotal(p).toFixed(2)} €`
      ]),
      theme: 'grid',
      styles: { fontSize: 10 },
    });

    const summaryY = (doc.lastAutoTable.finalY || 100) + 10;
    doc.setDrawColor(33, 33, 33);
    doc.setFillColor(230, 230, 250);
    doc.roundedRect(20, summaryY, 170, 20, 4, 4, 'F');
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total HT : ${totalHT.toFixed(2)} €`, 25, summaryY + 7);
    doc.text(`Total TTC : ${totalTTC.toFixed(2)} €`, 25, summaryY + 14);

    doc.save('devis.pdf');
  };

  return (
    <div className="page">
      <h1 className="text-center">🛒 Mon Panier</h1>
      {cart.length === 0 ? (
        <p className="text-center">Aucun produit dans le panier.</p>
      ) : (
        <div className="cart-layout">
          <button onClick={exportPDF} className="export-devis" style={{ marginBottom: '1rem' }}>
            📄 Export Devis
          </button>
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.purchase_price?.toFixed(2) || '–'} €</td>
                    <td>{p.selling_price?.toFixed(2) || '–'} €</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={p.quantity || 1}
                        onChange={(e) => handleChangeQuantity(p.id, e.target.value)}
                        style={{ width: '60px' }}
                      />
                    </td>
                    <td>{getLineTotal(p).toFixed(2)} €</td>
                    <td>{getMargin(p).toFixed(2)}%</td>
                    <td><button onClick={() => handleRemove(p.id)}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="summary-box-right">
            <h3>Résumé</h3>
            <p><strong>Total :</strong> {totalTTC.toFixed(2)} €</p>
            <p><strong>Marge moyenne :</strong> {marginAvg.toFixed(2)}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
