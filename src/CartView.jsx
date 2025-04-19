
// 📄 CartView.jsx — version complète avec persistance + reset global
import React, { useState, useEffect } from 'react';
import { getCartItems, updateCartItemQuantity, removeCartItem } from './services/cartService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from './logo.png';

const CUSTOM_PRICE_KEY = 'cart_custom_prices';

export default function CartView() {
  const [cart, setCart] = useState([]);

  const loadCustomPrices = () => {
    try {
      const raw = localStorage.getItem(CUSTOM_PRICE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const saveCustomPrice = (productId, price) => {
    const saved = loadCustomPrices();
    if (price === null) {
      delete saved[productId];
    } else {
      saved[productId] = price;
    }
    localStorage.setItem(CUSTOM_PRICE_KEY, JSON.stringify(saved));
  };

  const resetAllCustomPrices = () => {
    localStorage.removeItem(CUSTOM_PRICE_KEY);
    setCart(cart.map((item) => ({ ...item, custom_price: null })));
  };

  useEffect(() => {
    const savedPrices = loadCustomPrices();
    getCartItems().then((items) => {
      const updated = items.map((item) => ({
        ...item,
        custom_price: savedPrices[item.id] ?? null
      }));
      setCart(updated);
    });
  }, []);

  const getHT = (price, tva) => price / (1 + (tva || 0) / 100);
  const getEffectivePrice = (p) =>
    typeof p.custom_price === 'number' && !isNaN(p.custom_price) ? p.custom_price : p.selling_price;
  const getLineTotal = (p) => getEffectivePrice(p) * (p.quantity || 0);
  const getMargin = (p) => {
    const ht = getHT(getEffectivePrice(p) || 0, p.tva_rate || 0);
    return ht && p.purchase_price ? ((ht - p.purchase_price) / ht) * 100 : 0;
  };

  const handleChangeQuantity = async (productId, value) => {
    const newQty = parseInt(value);
    if (isNaN(newQty) || newQty < 1) return;
    await updateCartItemQuantity(productId, newQty);
    const savedPrices = loadCustomPrices();
    const updated = await getCartItems();
    setCart(updated.map((item) => ({
      ...item,
      custom_price: savedPrices[item.id] ?? null
    })));
  };

  const handleChangeCustomPrice = (productId, value) => {
    const price = parseFloat(value);
    saveCustomPrice(productId, price);
    const newCart = cart.map((item) =>
      item.id === productId ? { ...item, custom_price: price } : item
    );
    setCart(newCart);
  };

  const handleResetPrice = (productId) => {
    saveCustomPrice(productId, null);
    setCart(cart.map((item) =>
      item.id === productId ? { ...item, custom_price: null } : item
    ));
  };

  const handleResetAllPrices = () => {
    resetAllCustomPrices();
  };

  const handleRemove = async (productId) => {
    await removeCartItem(productId);
    const savedPrices = loadCustomPrices();
    const updated = await getCartItems();
    setCart(updated.map((item) => ({
      ...item,
      custom_price: savedPrices[item.id] ?? null
    })));
  };

  const totalTTC = cart.reduce((sum, p) => sum + getLineTotal(p), 0);
  const totalHT = cart.reduce(
    (sum, p) => sum + getHT(getEffectivePrice(p), p.tva_rate) * (p.quantity || 0),
    0
  );
  const marginAvg = cart.length
    ? cart.reduce((sum, p) => sum + getMargin(p), 0) / cart.length
    : 0;

  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const today = new Date();
    const dateStr = today.toLocaleDateString();
    const randomId = Math.floor(1000 + Math.random() * 9000);

    const primary = '#2D2A32';
    const lightGray = [245, 245, 245];

    doc.setFillColor(primary);
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setTextColor(255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Devis — Besançon Archerie', 20, 28);

    const logoWidth = 40;
    doc.addImage(logo, 'PNG', pageWidth - logoWidth - 20, 5, logoWidth, logoWidth);

    const contentStartY = 70;
    doc.setTextColor(33);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date : ${dateStr}`, 20, contentStartY);
    doc.text(`N° Devis : #${randomId}`, 20, contentStartY + 6);
    doc.text('Besançon Archerie', 20, contentStartY + 18);
    doc.text('25 grande rue, 25770 Franois', 20, contentStartY + 23);
    doc.text('besanconarcherie@gmail.com', 20, contentStartY + 28);

    autoTable(doc, {
      startY: contentStartY + 35,
      head: [['Nom', 'PU TTC', 'Quantité', 'Total TTC']],
      body: cart.map((p) => {
        const eff = getEffectivePrice(p);
        const original = p.selling_price;
        const isReduced = eff < original;
        const discount = isReduced ? `(-${Math.round((1 - eff / original) * 100)}%)` : '';

        const cellContent = isReduced
          ? `${eff.toFixed(2)} €
${original.toFixed(2)} € ${discount}`
          : `${eff.toFixed(2)} €`;

        return [
          { content: p.name, styles: { halign: 'left' } },
          { content: cellContent, styles: { halign: 'right', fontSize: 10 } },
          { content: p.quantity, styles: { halign: 'center' } },
          { content: `${getLineTotal(p).toFixed(2)} €`, styles: { halign: 'right' } }
        ];
      }),
      theme: 'striped',
      headStyles: {
        fillColor: [145, 39, 19],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [51, 51, 51]
      },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { left: 20, right: 20 }
    });

    const summaryY = (doc.lastAutoTable.finalY || 100) + 10;
    const boxWidth = 75;
    const boxX = pageWidth - boxWidth - 20;

    doc.setDrawColor(200);
    doc.setFillColor(...lightGray);
    doc.roundedRect(boxX, summaryY, boxWidth, 22, 4, 4, 'F');
    doc.setTextColor(primary);
    doc.setFontSize(12);
    doc.text(`Total HT : ${totalHT.toFixed(2)} €`, boxX + 5, summaryY + 8);
    doc.text(`Total TTC : ${totalTTC.toFixed(2)} €`, boxX + 5, summaryY + 16);

    doc.setTextColor(150);
    doc.setFontSize(9);
    doc.text('Merci pour votre confiance — www.besancon-archerie.fr', 20, 290);

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
          <button onClick={handleResetAllPrices} style={{ marginBottom: '1rem' }}>
            🔄 Réinitialiser tous les prix modifiés
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
                {cart.map((p) => {
                  const eff = getEffectivePrice(p);
                  const original = p.selling_price;
                  const isDiscounted = eff < original;
                  const discountPercent = isDiscounted ? Math.round((1 - eff / original) * 100) : 0;

                  return (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.purchase_price?.toFixed(2) || '–'} €</td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={eff}
                          onChange={(e) => handleChangeCustomPrice(p.id, e.target.value)}
                          style={{ width: '60px' }}
                        />
                        {isDiscounted && (
                          <div style={{ fontSize: '0.75em', color: '#888' }}>
                            <span style={{ textDecoration: 'line-through', marginRight: '4px' }}>
                              {original.toFixed(2)} €
                            </span>
                            <span style={{ color: '#912713' }}>(–{discountPercent}%)</span>
                          </div>
                        )}
                        {p.custom_price !== null && (
                          <button
                            onClick={() => handleResetPrice(p.id)}
                            style={{
                              fontSize: '0.75em',
                              marginTop: '4px',
                              background: 'none',
                              border: 'none',
                              color: '#007bff',
                              cursor: 'pointer'
                            }}
                          >
                            🔄 Réinitialiser
                          </button>
                        )}
                      </td>
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
                  );
                })}
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
