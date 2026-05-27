export default function BrandStrip() {
  const items = [
    "Hand-finished in Lagos",
    "Swiss-grade movements",
    "Lifetime servicing",
    "Numbered & signed",
    "Sapphire crystal",
  ];

  return (
    <div className="brand-strip">
      <div className="brand-track">
        {[...Array(2)].map((_, i) => (
          <div key={i} style={{ display: "flex", gap: "80px", alignItems: "center" }}>
            {items.map(item => (
              <div key={item} className="brand-item">{item}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}