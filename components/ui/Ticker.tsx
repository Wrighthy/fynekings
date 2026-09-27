export default function Ticker() {
  const items = [
    { gold: true, text: "Free Lagos delivery on orders above ₦500,000" },
    { text: "12-month international warranty" },
    { text: "Obsidian King — 12 of 50 remaining", trailingGold: true },
    { text: "Try-on in AR before you buy" },
    { text: "Paystack & Bank Transfer secured checkout" },
  ];

  return (
    <div className="ticker">
      <div className="ticker-track">
        {[...Array(2)].map((_, i) => (
          <div key={i} style={{ display: "flex", gap: "60px", whiteSpace: "nowrap" }}>
            {items.map((item, j) => (
              <div key={j} className="ticker-item">
                {item.gold ? <span className="gold">●</span> : <span className="ticker-dot"></span>}
                {item.text}
                {item.trailingGold && <span className="gold">●</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}