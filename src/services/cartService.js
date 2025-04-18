// 📦 services/cartService.js (mis à jour avec client partagé)
import supabase from '../supabaseClient'; // ✅ Oui chef.

export const getCartItems = async () => {
  const { data, error } = await supabase
    .from('cart_items')
    .select('id, quantity, products(*)');
  if (error) throw error;
  return data;
};

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

export const removeFromCart = async (id) => {
  return await supabase.from('cart_items').delete().eq('id', id);
};

export const clearCart = async () => {
  return await supabase.from('cart_items').delete().neq('id', '');
};


