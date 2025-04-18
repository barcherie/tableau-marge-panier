import supabase from '../supabaseClient'; // ✅ Oui chef.

// 📥 Récupère tous les produits depuis Supabase
export const getAllProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors du chargement des produits:', error);
    return [];
  }

  return data;
};

// 💾 Ajoute un seul produit à la base
export const insertProduct = async (product) => {
    const { data, error } = await supabase
      .from("products")
      .insert([product])
      .select();
  
    if (error) {
      console.error("Erreur lors de l'insertion du produit:", error);
      return null;
    }
  
    if (!data || data.length === 0) {
      console.warn("Aucun produit retourné après insertion.");
      return null;
    }
  
    return data[0];
  };

// 🔄 Met à jour un produit existant (par id)
export const updateProduct = async (id, updates) => {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select(); // 🧠 très important pour que Supabase renvoie le produit modifié
  
    if (error) {
      console.error("Erreur lors de la mise à jour du produit:", error);
      return null;
    }
  
    // Si aucun produit retourné : on gère proprement
    if (!data || data.length === 0) {
      console.warn("Aucun produit retourné après update.");
      return null;
    }
  
    return data[0];
  };

// ⚠️ Supprime tous les produits puis insère ceux d'un CSV
export const replaceAllProducts = async (newProducts) => {
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .gt('created_at', '1900-01-01'); // 🧠 ça supprime tout de manière sécurisée
  
    if (deleteError) {
      console.error('Erreur lors de la suppression des produits:', deleteError);
      return null;
    }
  
    const { data, error: insertError } = await supabase
      .from('products')
      .insert(newProducts);
  
    if (insertError) {
      console.error("Erreur lors de l'insertion des nouveaux produits:", insertError);
      return null;
    }
  
    return data;
  };
  