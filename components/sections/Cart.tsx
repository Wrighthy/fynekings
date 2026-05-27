"use client";

import { useCart, fmt } from "@/lib/store";

export default function Cart() {
  const cart = useCart(s => s.cart);
  const cartOpen = useCart(s => s.cartOpen);
  const setCartOpen = useCart(s => s.setCartOpen);
  const removeFromCart = useCart(s => s.removeFromCart);

  const subtotal = cart.reduce((s, i) => s + i.amount, 0);
  const totalFee = cart.reduce((s, i) => s + i.fee, 0);

  return (
    <>
      <div className={`cart-overlay ${cartOpen ? "open" : ""}`} onClick={() => setCartOpen(false)}></div>

      <div id="cart-sidebar" className={cartOpen ? "open" : ""}>
        <div className="cart-header">
          <div>
            <span className="cart-title-text">Your Selection</span>
            <p className="cart-title-meta">Reserved for 15 minutes</p>
          </div>
          <button className="cart-close-btn" onClick={() => setCartOpen(false)}>✕</button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="24" cy="24" r="20"/>
                <circle cx="24" cy="24" r="3"/>
              </svg>
              Your cart is empty
            </div>
          ) : (
            cart.map((item, i) => (
              <div key={i} className="cart-item">
                <div className="cart-item-img">
                  <svg viewBox="0 0 60 60" width="44" height="44" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="30" cy="30" r="24" fill="#0d0d0d" stroke="#C4A962" strokeWidth="1"/>
                    <circle cx="30" cy="30" r="20" fill="#080808"/>
                    <line x1="30" y1="30" x2="30" y2="14" stroke="#F4EFE4" strokeWidth="1.4" strokeLinecap="round"/>
                    <line x1="30" y1="30" x2="42" y2="22" stroke="#F4EFE4" strokeWidth="1.2" strokeLinecap="round"/>
                    <circle cx="30" cy="30" r="2.5" fill="#C4A962"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-config">
                    {item.series}
                    {item.custom && <><br/>{item.custom.strapName} · {item.custom.caseName}<br/>{item.custom.dialName}</>}
                  </p>
                  <p className="cart-item-price">{fmt(item.amount)}</p>
                  <button className="cart-item-remove" onClick={() => removeFromCart(i)}>— Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-row">
            <span style={{ textTransform: "uppercase", letterSpacing: ".18em", color: "var(--muted)", fontSize: ".55rem" }}>Subtotal</span>
            <span>{fmt(subtotal)}</span>
          </div>
          <div className="cart-row muted">
            <span style={{ textTransform: "uppercase", letterSpacing: ".18em" }}>Paystack Fee</span>
            <span>{fmt(totalFee)}</span>
          </div>
          <div className="cart-row total">
            <span style={{ textTransform: "uppercase", letterSpacing: ".18em" }}>Total</span>
            <span>{fmt(subtotal + totalFee)}</span>
          </div>
          <button className="checkout-btn">
            Proceed to Checkout
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          </button>
          <div className="cart-payment-icons">
            <span>Paystack</span><span>•</span><span>Flutterwave</span><span>•</span><span>Bank Transfer</span>
          </div>
        </div>
      </div>
    </>
  );
}