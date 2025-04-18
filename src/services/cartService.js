// 📦 services/cartService.js (mis à jour avec client partagé)
import supabase from '../supabaseClient'; // ✅ Oui chef.

export async function getCartItems() {
  const { data, error } = await supabase
    .from('cart_items')
    .select('id, quantity, product:product_id (id, name, purchase_price, selling_price, tva_rate)');

  if (error) {
    console.error('Erreur récupération panier :', error);
    return [];
  }

  return data.map((item) => ({
    ...item.product,
    id: item.id,
    quantity: item.quantity,
  }));
}


export const addToCart = async (productId) => {
    const { data: existing, error: fetchError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('product_id', productId)
      .maybeSingle();
  
    if (fetchError) throw fetchError;
  
    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({ product_id: productId });
      if (error) throw error;
    }
  };

export const removeCartItem = async (id) => {
  return await supabase.from('cart_items').delete().eq('id', id);
};

export const clearCart = async () => {
  return await supabase.from('cart_items').delete().neq('id', '');
};

export async function updateCartItemQuantity(id, quantity) {
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', id);

  if (error) {
    console.error('Erreur mise à jour quantité :', error);
    return null;
  }

  return true;
}