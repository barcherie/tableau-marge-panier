# 🏹 Tableau de Marge — Besançon Archerie

Application React de gestion de produits, calculs de marges, panier, et export PDF. Authentification simplifiée avec email/mot de passe hashé.

---

## 🚀 URL de production

👉 [https://tableau-marge.vercel.app](https://tableau-marge.vercel.app)

---

## 🔐 Authentification

L'application est protégée par une page de connexion.

---

## 📦 Fonctionnalités principales

- 📊 Affichage trié des produits par taux de marge
- 🟢🟠🔴 Code couleur selon la rentabilité
- 🧮 Édition en ligne des produits
- 📁 Import CSV par glisser-déposer
- ➕ Ajout manuel de produits
- 🛒 Panier multi-produits avec quantité et total
- 🧾 Export PDF propre avec logo
- 🔒 Connexion simple avec authentification front-end

---

## 🛠️ Installation locale

```bash
git clone https://github.com/tonuser/tableau-marge.git
cd tableau-marge
npm install
npm run dev
```

---

## 📁 Structure des fichiers

- `App.jsx` — Vue principale produits
- `CartView.jsx` — Vue panier
- `Login.jsx` — Connexion sécurisée
- `AppRouter.jsx` — Gestion des routes et auth
- `supabaseClient.js` — (déprécié si plus utilisé)

---

## 🧪 Test rapide de login local

1. Lance le projet en local : `npm run dev`
2. Va sur [http://localhost:3000](http://localhost:3000)
3. Entre tes identifiants (voir section Auth)

---

## 🧼 Déploiement Vercel

Le projet est connecté à GitHub. Toute mise à jour sur `main` déclenche automatiquement un build sur Vercel.

---

## 🤝 Crédits

- Créé avec amour (et archerie) par Valentin
- Assisté par un IA légèrement sarcastique
