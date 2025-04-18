import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { useDropzone } from "react-dropzone";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getAllProducts,
  insertProduct,
  updateProduct,
  replaceAllProducts,
} from "./services/productService";
import { addToCart } from "./services/cartService";
import "./App.css";
import logo from "./logo.png";

function normalize(str) {
  return str.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function CSVDropzone({ onRefresh }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "text/csv": [".csv"] },
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const parsed = results.data
            .map((row) => {
              const purchase = parseFloat((row.purchasePrice || "").replace(",", ".").trim());
              const selling = parseFloat((row.sellingPrice || "").replace(",", ".").trim());
              const tvaRate = parseFloat((row.tvaRate || "0").trim());
              const tvaRecoverable = (row.tvaRecoverable || "").toString().trim().toLowerCase() === "true";

              if (isNaN(purchase) || isNaN(selling) || isNaN(tvaRate)) {
                console.warn("Ligne ignorée", row);
                return null;
              }

              return {
                name: row.name?.trim() || "Produit sans nom",
                purchase_price: purchase,
                selling_price: selling,
                tva_rate: tvaRate,
                tva_recoverable: tvaRecoverable,
              };
            })
            .filter(Boolean);

          await replaceAllProducts(parsed);
          const all = await getAllProducts();
          onRefresh(all);
        },
      });
    },
  });

  return (
    <div {...getRootProps()} className="dropzone fancy-zone">
      <input {...getInputProps()} />
      {isDragActive ? <p>📁 Dépose ton CSV ici</p> : <p>📁 Glisse un fichier CSV ici pour mettre à jour les produits</p>}
    </div>
  );
}

function App() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    name: "",
    purchase_price: "",
    selling_price: "",
    tva_rate: "20",
    tva_recoverable: true,
  });
  const [editedProducts, setEditedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("red");
  const [pendingUpdates, setPendingUpdates] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const searchBoxRef = useRef(null);

  useEffect(() => {
    getAllProducts().then(setData);
  }, []);

  const calculateMarginRate = (p) => {
    const ht = p.selling_price / (1 + p.tva_rate / 100);
    const realPurchase = p.tva_recoverable ? p.purchase_price : p.purchase_price * (1 + p.tva_rate / 100);
    return ((ht - realPurchase) / ht) * 100;
  };

  const getColor = (rate) => (rate < 25 ? "red" : rate < 35 ? "orange" : "green");

  const sortedByTab = () => {
    const enriched = data.map((p) => ({ ...p, marginRate: calculateMarginRate(p) }));
    const filtered = enriched
      .filter((p) => normalize(p.name).includes(normalize(searchTerm)))
      .filter((p) => {
        if (activeTab === "red") return p.marginRate < 25;
        if (activeTab === "orange") return p.marginRate >= 25 && p.marginRate < 35;
        if (activeTab === "green") return p.marginRate >= 35;
        return true;
      })
      .sort((a, b) => b.marginRate - a.marginRate);

    if (filtered.length === 0 && searchTerm && searchBoxRef.current) {
      searchBoxRef.current.classList.add("shake");
      setTimeout(() => searchBoxRef.current.classList.remove("shake"), 600);
    }

    return filtered;
  };

  const queueEdit = (id, field, value) => {
    setPendingUpdates((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: field === "tva_recoverable" ? value : parseFloat(value) },
    }));
  };

  const handleConfirmEdit = async (id) => {
    const product = data.find((p) => p.id === id);
    const updates = { ...product, ...pendingUpdates[id] };
    const result = await updateProduct(id, updates);
    if (result) {
      setEditedProducts((prev) => [...prev.filter((item) => item.id !== result.id), result]);
      setData(await getAllProducts());
      setPendingUpdates((prev) => {
        const newUpdates = { ...prev };
        delete newUpdates[id];
        return newUpdates;
      });
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAddProduct = async () => {
    const product = {
      name: form.name,
      purchase_price: parseFloat(form.purchase_price),
      selling_price: parseFloat(form.selling_price),
      tva_rate: parseFloat(form.tva_rate),
      tva_recoverable: form.tva_recoverable,
    };
    const inserted = await insertProduct(product);
    if (inserted) {
      setData((prev) => [inserted, ...prev]);
      setForm({ name: "", purchase_price: "", selling_price: "", tva_rate: "20", tva_recoverable: true });
    }
  };

  const renderEditableCell = (id, field, defaultValue) => (
    <>
      <input
        type="number"
        defaultValue={defaultValue}
        onChange={(e) => queueEdit(id, field, e.target.value)}
      />
      <button className="ok-button" onClick={() => handleConfirmEdit(id)}>OK</button>
    </>
  );

  const filteredProducts = sortedByTab();

  return (
    <div className="App">
      <header className="app-header">
        <h1>🏹 Tableau de Marge Produits</h1>
      </header>

      <CSVDropzone onRefresh={setData} />

      <div className="product-form">
        <h3>➕ Ajouter un produit</h3>
        <input name="name" placeholder="Nom" value={form.name} onChange={handleFormChange} />
        <input name="purchase_price" placeholder="Prix d'achat" value={form.purchase_price} onChange={handleFormChange} />
        <input name="selling_price" placeholder="Prix de vente" value={form.selling_price} onChange={handleFormChange} />
        <input name="tva_rate" placeholder="TVA (%)" value={form.tva_rate} onChange={handleFormChange} />
        <label><input type="checkbox" name="tva_recoverable" checked={form.tva_recoverable} onChange={handleFormChange} /> TVA récupérable</label>
        <button onClick={handleAddProduct}>Ajouter</button>
      </div>

      <section className="tabs">
        <button className={activeTab === "red" ? "active" : ""} onClick={() => setActiveTab("red")}>🔴 &lt; 25%</button>
        <button className={activeTab === "orange" ? "active" : ""} onClick={() => setActiveTab("orange")}>🟠 25–35%</button>
        <button className={activeTab === "green" ? "active" : ""} onClick={() => setActiveTab("green")}>🟢 ≥ 35%</button>
      </section>

      <p style={{ textAlign: "center" }}>{filteredProducts.length} produits listés</p>

      <table>
        <thead>
          <tr><th>Nom</th><th>Achat</th><th>Vente</th><th>TVA</th><th>TVA récup.</th><th>Marge</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {filteredProducts.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{renderEditableCell(p.id, "purchase_price", p.purchase_price)}</td>
              <td>{renderEditableCell(p.id, "selling_price", p.selling_price)}</td>
              <td>{p.tva_rate}%</td>
              <td>{p.tva_recoverable ? "Oui" : "Non"}</td>
              <td style={{ color: getColor(p.marginRate) }}>{p.marginRate.toFixed(2)}%</td>
              <td>
                <button
  onClick={async () => {
    try {
      await addToCart(p.id);
      alert("Produit ajouté au panier !");
    } catch (err) {
      console.error("Erreur ajout panier :", err);
      alert("Erreur lors de l'ajout au panier.");
    }
  }}
>
  Ajouter au panier
</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
