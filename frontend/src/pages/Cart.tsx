import { useEffect, useState } from "react";
import { checkout, fetchCart, removeFromCart } from "../api";
import type { CartItem } from "../types";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    fetchCart()
      .then(setItems)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleRemove(cartItemId: number) {
    await removeFromCart(cartItemId);
    load();
  }

  async function handleCheckout() {
    const result = await checkout();
    setOrderId(result.orderId);
    load();
  }

  if (loading) return <p className="status">Loading cart...</p>;

  if (orderId) {
    return (
      <p className="status">
        Thanks for your order! Your Pokémon are on the way. Order #{orderId}.
      </p>
    );
  }

  if (items.length === 0) return <p className="status">Your cart is empty.</p>;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart">
      {items.map((item) => (
        <div className="cart-item" key={item.cartItemId}>
          <img src={item.image} alt={item.name} />
          <div className="cart-item-info">
            <h4>{item.name}</h4>
            <p>
              {item.quantity} × {formatPrice(item.price)}
            </p>
          </div>
          <button onClick={() => handleRemove(item.cartItemId)}>Remove</button>
        </div>
      ))}
      <div className="cart-total">
        <strong>Total: {formatPrice(total)}</strong>
        <button onClick={handleCheckout}>Checkout</button>
      </div>
    </div>
  );
}
