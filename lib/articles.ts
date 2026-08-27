export type Article = {
    slug: string;
    vol: string;
    title: string;
    subtitle: string;
    readTime: string;
    category: string;
    content: Section[];
};

export type Section = {
    heading?: string;
    body: string;
    list?: string[];
    tip?: string;
};

export const ARTICLES: Article[] = [
    {
        slug: "movement-types",
        vol: "I",
        title: "Movement Types",
        subtitle: "Understanding the engine inside your watch — and what each means for performance, prestige, and your daily life.",
        readTime: "8 min read",
        category: "Horology",
        content: [
            {
                body: "A watch movement — also called a calibre — is the mechanism that makes a watch tick. It is the heart of every timepiece, and understanding what powers your watch is the first step to becoming a genuine collector. There are four main movement types, each with its own philosophy, character, and trade-offs.",
            },
            {
                heading: "Quartz Movement",
                body: "Quartz movements are powered by a battery that sends an electric current through a small quartz crystal. The crystal vibrates at precisely 32,768 times per second, creating an incredibly accurate timekeeping signal. Quartz watches are accurate to within 15 seconds per month — far more precise than most mechanical movements.",
                list: [
                    "Accuracy: ±15 seconds per month",
                    "Power source: Battery (replaced every 1–3 years)",
                    "Maintenance: Minimal — battery changes only",
                    "Price range: Most affordable",
                    "Best for: Daily wear, professional environments, travel",
                ],
                tip: "The Fynekings Continent uses a Swiss ETA quartz movement — one of the most respected quartz calibres in the industry.",
            },
            {
                heading: "Automatic Movement",
                body: "Automatic movements (also called self-winding) are powered by the natural motion of your wrist. A rotor inside the watch spins as you move, winding the mainspring that stores energy. As long as you wear the watch regularly, it never needs a battery. This is the movement preferred by serious collectors — there is something deeply satisfying about wearing a machine that is powered entirely by your own movement.",
                list: [
                    "Accuracy: ±5 to ±25 seconds per day",
                    "Power source: Wrist movement + manual winding",
                    "Maintenance: Service every 3–5 years",
                    "Price range: Mid to high",
                    "Best for: Daily wear, collectors, dress occasions",
                ],
                tip: "The Fynekings Sovereign I, Lagos Prestige, Sahara Rose, Victoria Crown, Niger Delta, and Eko Atlantic all use automatic movements — the Calibre F-2401.",
            },
            {
                heading: "Manual (Hand-Wind) Movement",
                body: "Manual movements are the oldest form of watchmaking. They require the wearer to wind the crown daily — usually once every 24 to 48 hours — to keep the mainspring tensioned. This ritual of daily winding creates a unique intimacy between wearer and watch. Many collectors consider hand-winding the purest expression of horology.",
                list: [
                    "Accuracy: ±5 to ±20 seconds per day",
                    "Power source: Manual winding only",
                    "Maintenance: Service every 3–5 years",
                    "Price range: Mid to very high",
                    "Best for: Watch enthusiasts, dress watches, special occasions",
                ],
            },
            {
                heading: "Tourbillon",
                body: "The tourbillon is the most prestigious and technically demanding complication in watchmaking. Invented in 1801 by Abraham-Louis Breguet, the tourbillon places the escapement in a rotating cage that makes one full revolution per minute. This counteracts the negative effects of gravity on the movement's accuracy. Originally a practical solution, the tourbillon is today primarily a demonstration of supreme watchmaking mastery.",
                list: [
                    "Accuracy: Varies — the mechanism is more about prestige than precision",
                    "Power source: Manual or automatic",
                    "Maintenance: Highly specialized — master watchmakers only",
                    "Price range: Six to seven figures",
                    "Best for: Serious collectors, investment pieces, heirlooms",
                ],
                tip: "A single tourbillon cage can contain up to 70 individual components, each finished by hand.",
            },
            {
                heading: "Which Movement is Right for You?",
                body: "For everyday wear and reliability, quartz is hard to beat. For the collector experience — the weight of a mechanical movement, the sweep of the second hand, the satisfaction of wearing something alive on your wrist — automatic is the standard. If you want the pinnacle of horological craft without compromise, a tourbillon is the summit. At Fynekings, we believe every collector should experience at least one fine automatic movement before deciding what speaks to them.",
            },
        ],
    },
    {
        slug: "case-materials",
        vol: "II",
        title: "Case Materials",
        subtitle: "How the material of your watch case affects durability, weight, aesthetics, and long-term value.",
        readTime: "7 min read",
        category: "Materials",
        content: [
            {
                body: "The watch case is more than a shell — it is the architectural statement of the timepiece. The material chosen defines its character: how it feels against the skin, how it ages, how it interacts with light, and how long it will last. Understanding case materials helps you choose a watch that will serve you for decades.",
            },
            {
                heading: "316L Surgical Steel",
                body: "The most common material in quality watchmaking. 316L stainless steel is corrosion-resistant, hypoallergenic, and exceptionally durable. The 'L' denotes low carbon content, which improves its resistance to corrosion in chloride environments — meaning sweat and seawater will not damage it.",
                list: [
                    "Scratch resistance: Moderate — polishable",
                    "Weight: Medium",
                    "Corrosion resistance: Excellent",
                    "Skin sensitivity: Hypoallergenic",
                    "Value retention: Good",
                ],
                tip: "All Fynekings watches use 316L surgical steel as their base material — the same grade used in medical implants.",
            },
            {
                heading: "Gold PVD Coating",
                body: "PVD stands for Physical Vapour Deposition — a process where a thin layer of gold (or other metals) is applied to the steel case in a vacuum chamber at the molecular level. The result is a finish that is harder than electroplating, more resistant to scratching, and more durable over time. PVD gold gives the visual warmth of gold at a fraction of the cost.",
                list: [
                    "Scratch resistance: High — harder than solid gold",
                    "Weight: Same as steel base",
                    "Durability: 3–10 years before wear depending on use",
                    "Appearance: Identical to gold",
                    "Value: More accessible than solid gold",
                ],
            },
            {
                heading: "Rose Gold PVD",
                body: "Rose gold achieves its distinctive warm, pinkish hue through an alloy of gold and copper. In PVD form, it delivers this romantic aesthetic on a steel base with excellent durability. Rose gold has surged in popularity over the past decade and remains a strong choice for dress watches and those who want warmth without the traditional yellow gold look.",
            },
            {
                heading: "Titanium",
                body: "Titanium is approximately 30% lighter than steel while being equally strong. It is hypoallergenic and extremely corrosion-resistant. The trade-off is that titanium scratches more easily than steel — though it develops a distinctive patina over time that many collectors appreciate as a mark of genuine use.",
                list: [
                    "Scratch resistance: Lower than steel",
                    "Weight: 30% lighter than steel",
                    "Corrosion resistance: Outstanding",
                    "Skin sensitivity: Ideal for sensitive skin",
                    "Value retention: Good for sports models",
                ],
            },
            {
                heading: "DLC (Diamond-Like Carbon) Coating",
                body: "DLC is one of the hardest coatings available in watchmaking — approaching the hardness of diamond on the Vickers scale. Applied via a process similar to PVD, DLC creates an intensely dark, matte-to-satin finish that is extraordinarily scratch-resistant. A DLC-coated watch will maintain its finish for years even with demanding daily wear.",
                list: [
                    "Scratch resistance: Exceptional — near-diamond hardness",
                    "Weight: Same as steel base",
                    "Durability: Very long lasting",
                    "Appearance: Deep, dark matte or satin black",
                    "Value: Premium positioning",
                ],
                tip: "The Fynekings Black DLC case option uses a genuine DLC coating — not paint or powder coat.",
            },
            {
                heading: "Ceramic",
                body: "High-tech ceramic (zirconia) has become increasingly popular in luxury watchmaking. It is extraordinarily scratch-resistant — harder than steel — lightweight, and maintains its colour permanently (it is coloured throughout the material, not just on the surface). The trade-off is brittleness: ceramic can chip or crack under sharp impacts.",
            },
        ],
    },
    {
        slug: "strap-guide",
        vol: "III",
        title: "The Strap Guide",
        subtitle: "Choosing the right strap for your lifestyle, occasion, and personal style — and how to change it yourself.",
        readTime: "6 min read",
        category: "Style",
        content: [
            {
                body: "The strap is the most transformative element of any watch. The same watch case can read as a sport tool, a dress accessory, or a casual companion depending entirely on what holds it to your wrist. Understanding strap materials and styles gives you the ability to multiply the versatility of any watch in your collection.",
            },
            {
                heading: "Leather Straps",
                body: "Leather is the traditional choice for dress watches and remains the most versatile strap material. The quality of leather varies enormously — from cheap bonded leather that cracks within months to hand-stitched alligator that develops a beautiful patina over decades.",
                list: [
                    "Calfskin: Soft, affordable, wide variety of colours — best entry point",
                    "Alligator: The pinnacle of leather straps — distinctive texture, extremely durable, ages beautifully",
                    "Ostrich: Distinctive quill pattern, soft and flexible",
                    "Suede: Casual and tactile — not suitable for wet environments",
                    "Shell Cordovan: Horsehide, exceptionally durable with a unique sheen",
                ],
                tip: "All Fynekings leather straps are hand-stitched alligator or calfskin. We use a contrasting gold stitch on our darker straps — a detail borrowed from Swiss complications watches.",
            },
            {
                heading: "Rubber and Silicone Straps",
                body: "Rubber straps are the natural companion for sport and diving watches. They are waterproof, comfortable in heat, easy to clean, and increasingly accepted in dressy contexts. High-quality vulcanised rubber — as used by leading dive watch manufacturers — has a premium feel and durability that cheap silicone cannot match.",
                list: [
                    "Water resistance: Complete",
                    "Durability: Excellent",
                    "Comfort in heat: Superior to leather",
                    "Formality: Sport to smart-casual",
                    "Maintenance: Wipe clean",
                ],
            },
            {
                heading: "NATO Straps",
                body: "The NATO strap originated with British military specification in 1973 and has become one of the most popular casual watch straps globally. Made from woven nylon, NATO straps are inexpensive, incredibly durable, quick-drying, and available in hundreds of colour combinations. They pass under the watch case, meaning the watch stays on your wrist even if one spring bar fails.",
                list: [
                    "Durability: Exceptional",
                    "Water resistance: Good — dries quickly",
                    "Formality: Casual only",
                    "Cost: Very affordable",
                    "Availability: Enormous variety",
                ],
            },
            {
                heading: "Metal Bracelets",
                body: "A metal bracelet — whether oyster, jubilee, or mesh — integrates the strap into the overall design of the watch. Well-made metal bracelets are comfortable, durable, and give a more formal or technical appearance. The quality of a bracelet's clasp and the tightness of its links are the key differentiators between cheap and quality execution.",
                list: [
                    "Oyster: Three-piece links, robust and sporty",
                    "Jubilee: Five-piece links, dressier and more flexible",
                    "Mesh (Milanese): Woven steel, adjustable to any size, elegant",
                    "Integrated: Designed as part of the case — the most prestigious form",
                ],
            },
            {
                heading: "How to Change Your Strap",
                body: "Changing a watch strap is a skill every collector should have. You need a spring bar tool — a small forked instrument that compresses the spring bars holding the strap in place. Insert the forked end between the strap and the lug, compress the spring bar, and the strap releases. Reverse the process to attach a new one. The entire operation takes under two minutes once you have practiced it.",
                tip: "Fynekings offers a strap change service at our Lagos atelier — free for the first year of ownership.",
            },
        ],
    },
    {
        slug: "complications",
        vol: "IV",
        title: "Watch Complications",
        subtitle: "What complications are, how they work, and which ones are worth the investment for the African collector.",
        readTime: "9 min read",
        category: "Horology",
        content: [
            {
                body: "In watchmaking, a 'complication' is any function beyond the simple display of hours and minutes. The word comes from the Latin 'complicare' — to fold together — because adding functions folds additional mechanical systems into the already complex gear train of the movement. Complications represent the pinnacle of the watchmaker's art.",
            },
            {
                heading: "Chronograph",
                body: "The chronograph is the most popular complication in the world. It is essentially a stopwatch integrated into the watch — start, stop, and reset via pushers on the case. The chronograph was originally developed for astronomical observations and horse racing, and remains relevant today for timing anything from meetings to athletic performance.",
                list: [
                    "Pushers: Two buttons control start/stop and reset",
                    "Sub-dials: Display elapsed seconds, minutes, and sometimes hours",
                    "Columns wheel vs cam: Column wheel chronographs are more precise and satisfying to operate",
                    "Flyback: A flyback chronograph resets and restarts in a single pusher action — used by pilots",
                    "Split-seconds: Two superimposed second hands for timing multiple events simultaneously",
                ],
                tip: "A mono-pusher chronograph uses a single button for all functions — start, stop, reset in sequence. It is rarer and considered more elegant.",
            },
            {
                heading: "Date",
                body: "The date display is the most common complication — so common it is rarely thought of as a complication at all. A simple date window (usually at 3 o'clock or 4:30) shows the current date via a rotating disc. The annual calendar shows date and month and only needs adjustment once a year (at the end of February). The perpetual calendar accounts for all months and leap years and never needs manual adjustment.",
                list: [
                    "Simple date: Requires adjustment 7 times per year",
                    "Big date: Uses two discs for a clearer display",
                    "Annual calendar: Adjustment needed once per year",
                    "Perpetual calendar: Self-adjusting — the most complex",
                ],
            },
            {
                heading: "GMT / Dual Time Zone",
                body: "GMT complications display two time zones simultaneously — essential for the internationally mobile professional. An additional hand (usually in a contrasting colour) makes one full revolution per 24 hours, and a bezel marked 0–24 allows you to read a second time zone at a glance. The modern professional across Africa's business centres — Lagos, Nairobi, Johannesburg, Accra — increasingly needs this function.",
                list: [
                    "GMT hand: Points to a 24-hour scale for the second time zone",
                    "Independent GMT: Second hour hand can be set independently — more useful for travel",
                    "World time: Displays all 24 time zones simultaneously via a rotating disc",
                ],
                tip: "For the Lagos-London or Lagos-New York traveller, a GMT watch eliminates the mental arithmetic of time zone conversion.",
            },
            {
                heading: "Moon Phase",
                body: "The moon phase complication displays the current phase of the lunar cycle via a rotating disc with two moon illustrations visible through an aperture. Originally practical for navigation and agriculture, the moon phase is today purely romantic — a poetic connection between the watch and the cosmos. It is one of the most beautiful complications to observe.",
            },
            {
                heading: "Minute Repeater",
                body: "The minute repeater is considered by many to be the supreme complication — more impressive even than the tourbillon. Activated by a slide on the case, it chimes the time acoustically: hours in low tones, quarter hours in a double tone, minutes in high tones. To hear a minute repeater strike is to understand why watchmaking is considered an art form.",
                list: [
                    "Complexity: 300–600 components in the striking mechanism alone",
                    "Craftsmanship: Each gong is individually tuned by ear",
                    "Price: Seven figures and above for quality examples",
                    "Heritage: Developed in the 17th century for telling time in darkness",
                ],
            },
        ],
    },
    {
        slug: "watch-care",
        vol: "V",
        title: "Watch Care",
        subtitle: "Servicing intervals, water resistance, storage, and cleaning — keeping your Fynekings performing for generations.",
        readTime: "6 min read",
        category: "Maintenance",
        content: [
            {
                body: "A fine watch is a mechanical instrument. Like any precision instrument — a violin, a camera, a racing engine — it requires care and periodic maintenance to perform at its best. Proper care of your watch is not a chore; it is part of the ownership experience, and it protects your investment for decades.",
            },
            {
                heading: "Servicing Intervals",
                body: "Every mechanical watch requires periodic servicing — the equivalent of an oil change for a car engine. During a service, the movement is disassembled, cleaned ultrasonically, inspected under magnification, worn components replaced, lubricated with specialist oils, and reassembled. The case is also cleaned and re-polished.",
                list: [
                    "Automatic movements: Service every 3–5 years",
                    "Quartz movements: Service every 5–7 years (battery change every 1–3 years)",
                    "Vintage watches: Service every 3 years minimum",
                    "Signs you need a service: Running fast/slow, condensation inside crystal, stiff crown, irregular power reserve",
                ],
                tip: "All Fynekings watches come with a 5-year warranty that covers manufacturing defects. Our Lagos atelier offers servicing for all Fynekings pieces.",
            },
            {
                heading: "Water Resistance",
                body: "Water resistance ratings are widely misunderstood. A watch rated to 30m is NOT suitable for swimming — it means it can withstand splashes only. Water resistance degrades over time as seals age, so a watch that was once rated to 100m may no longer be after several years without a pressure test.",
                list: [
                    "30m / 3ATM: Splash resistant only — no swimming",
                    "50m / 5ATM: Light swimming acceptable, no diving",
                    "100m / 10ATM: Swimming and snorkelling",
                    "150m / 15ATM: Recreational diving",
                    "200m / 20ATM: Serious diving",
                    "300m+: Professional diving use",
                ],
                tip: "Never operate the crown or pushers underwater, even on a watch rated to 300m. Seals are tested statically, not under the stress of crown operation.",
            },
            {
                heading: "Daily Care",
                body: "Basic daily care extends the life of your watch significantly. Wipe the case and bracelet with a soft dry cloth after each wear to remove sweat and oils. Avoid exposing the watch to perfume, cologne, or chemical cleaners — these degrade seals and can discolour straps. Remove leather-strap watches before showering or swimming.",
                list: [
                    "Wipe case daily with a microfibre cloth",
                    "Clean between bracelet links weekly with a soft brush",
                    "Keep leather straps away from water",
                    "Store in a watch box or pouch when not wearing",
                    "Wind manual watches at the same time each day",
                ],
            },
            {
                heading: "Storage",
                body: "Proper storage matters more than most collectors realize. Strong magnetic fields — found near speakers, phones, and laptop clasps — can magnetize a mechanical movement and cause it to run significantly fast. Store watches away from magnetic sources. For automatic watches you are not wearing regularly, a watch winder maintains the power reserve and keeps the lubricants from congealing.",
                list: [
                    "Store away from magnets and electronics",
                    "Use a watch winder for automatics worn infrequently",
                    "Keep in a cool, dry environment",
                    "Avoid extreme temperature changes",
                    "Do not stack watches — crystals can scratch each other",
                ],
            },
            {
                heading: "Demagnetization",
                body: "If your watch is running significantly fast (more than 30 seconds per day), it may be magnetized. Demagnetization is a quick, inexpensive service — a watchmaker passes the watch through a demagnetizer in seconds, and accuracy is immediately restored. It is one of the most common — and most easily remedied — watch problems.",
            },
        ],
    },
    {
        slug: "investment-value",
        vol: "VI",
        title: "Investment Value",
        subtitle: "How limited editions, complications, and provenance affect resale value — and how to build a collection that appreciates.",
        readTime: "10 min read",
        category: "Collecting",
        content: [
            {
                body: "Not all watches appreciate in value. The vast majority depreciate, like most luxury goods. But a carefully chosen watch — or more precisely, a carefully chosen few — can hold or increase in value over time, sometimes dramatically. Understanding what drives watch value is the foundation of intelligent collecting.",
            },
            {
                heading: "What Makes a Watch Appreciate",
                body: "The factors that drive appreciation in watch value are consistent across the market: scarcity, desirability, condition, and provenance. A watch that is rare, wanted by many, in excellent condition, with documented history will always command a premium. These factors compound — a rare watch in poor condition still appreciates less than a common watch in perfect condition with original papers.",
                list: [
                    "Limited production: Fewer pieces means less supply against constant demand",
                    "Discontinuation: When a reference is discontinued, remaining examples become scarce",
                    "Complications: Complex movements cost more to produce and signal prestige",
                    "Original condition: Full set (box, papers, hang tags) adds significant value",
                    "Provenance: Documented ownership history, especially notable previous owners",
                    "Brand heritage: Established houses with consistent collector demand",
                ],
            },
            {
                heading: "The Role of Limited Editions",
                body: "Limited editions create artificial scarcity — and scarcity drives value. When a house announces 50 pieces of a reference, every collector who misses the initial allocation becomes a potential future buyer on the secondary market. This demand pressure, combined with fixed supply, supports and often grows the resale price. The Fynekings Obsidian King — limited to 50 numbered pieces — follows this principle deliberately.",
                tip: "Buy limited editions at retail whenever possible. Secondary market premiums on desirable limited editions can be 2–5× the original price within years.",
            },
            {
                heading: "Condition is Everything",
                body: "In the watch market, condition is the single largest determinant of value after desirability. A watch in unworn condition with original box and papers can be worth 30–60% more than the same reference in good worn condition. The original bracelet, crown, and pushers matter. Original dials — never refinished — matter enormously. Collectors pay a substantial premium for what is called 'full set' — watch, inner and outer box, all papers, hang tags, and warranty cards.",
                list: [
                    "Unworn with full set: Maximum value",
                    "Excellent with box and papers: Strong value",
                    "Good condition, no box: Moderate value",
                    "Polished case: Significantly reduced collector value",
                    "Refinished dial: Major deduction — considered a form of damage",
                ],
            },
            {
                heading: "The African Watch Market",
                body: "The African luxury watch market is at an inflection point. Lagos, Nairobi, Accra, and Johannesburg are developing sophisticated collector communities where previously there were none. African collectors — particularly in Nigeria — are increasingly significant buyers at international auction houses. This creates an interesting dynamic: watches that reflect African identity and craftsmanship carry a cultural premium in the local market that global platforms do not yet fully price in.",
            },
            {
                heading: "Building a Collection Strategy",
                body: "Intelligent collecting is not about buying expensive watches — it is about buying the right watches. A single reference in perfect condition with full set is worth more than three references in average condition. Focus. Buy what genuinely speaks to you — forced collecting rarely produces good outcomes. And buy from authorized sources: the grey market and unverified dealers introduce risk that negates the potential upside.",
                list: [
                    "Buy condition first — desirable reference second",
                    "Keep all original parts, box, and papers",
                    "Focus on one or two references rather than many average pieces",
                    "Document your purchases — receipts, service records, correspondence",
                    "Service regularly — a well-maintained watch retains value better",
                    "Buy what you love — the market rewards genuine passion",
                ],
                tip: "The best watch investment is one you wear and love. The emotional return on a watch you cherish daily is real value that no auction result can quantify.",
            },
        ],
    },
];