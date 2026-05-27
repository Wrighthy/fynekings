const REVIEWS = [
  {
    text: "The craftsmanship on the Lagos Prestige is extraordinary. Every glance at my wrist is a reminder of what African luxury looks like.",
    author: "Emeka O.", location: "Abuja, Nigeria", watch: "Lagos Prestige",
  },
  {
    text: "Used the AR try-on before ordering. Saw exactly how it would look on my wrist. The accuracy was impressive — no surprises on delivery.",
    author: "Amara K.", location: "Accra, Ghana", watch: "Continent · Steel",
  },
  {
    text: "The custom configuration was seamless. Built my own strap and case combination and it arrived exactly as designed. Unmatched quality.",
    author: "David M.", location: "Nairobi, Kenya", watch: "Custom Build",
  },
];

export default function Reviews() {
  return (
    <section id="reviews">
      <div className="sec-inner">
        <div className="reviews-header reveal">
          <div>
            <p className="sec-tag">Collector Voices · No. 05</p>
            <h2 className="sec-title">What They <em>Say</em></h2>
          </div>
          <div className="review-rating-big">
            <div className="rating-num">4.<em>9</em></div>
            <div className="rating-detail">
              <div className="rating-stars">
                {[1,2,3,4,5].map(i => <span key={i} className="star">★</span>)}
              </div>
              <p className="rating-text">248 Verified Purchases</p>
            </div>
          </div>
        </div>

        <div className="reviews-grid reveal" style={{ transitionDelay: ".2s" }}>
          {REVIEWS.map(r => (
            <div key={r.author} className="review-card">
              <div className="review-quote-mark">&ldquo;</div>
              <div className="review-stars">
                {[1,2,3,4,5].map(i => <span key={i} className="star">★</span>)}
              </div>
              <p className="review-text">{r.text}</p>
              <div className="review-meta">
                <div>
                  <p className="review-author">{r.author}</p>
                  <p className="review-location">{r.location}</p>
                </div>
                <div>
                  <p className="review-watch">{r.watch}</p>
                  <p className="review-verified">✓ Verified</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}