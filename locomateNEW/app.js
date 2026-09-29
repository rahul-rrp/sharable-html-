document.querySelectorAll(".avatar").forEach((avatar) => {
  avatar.addEventListener("click", () => {
    document.querySelectorAll(".avatar").forEach((item) => item.classList.remove("active", "bump"));
    avatar.classList.add("active", "bump");
    window.setTimeout(() => avatar.classList.remove("bump"), 280);
  });
});

const SUPABASE_URL = "https://typtoxvricjqmfyozsiq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5cHRveHZyaWNqcW1meW96c2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NjY1NDksImV4cCI6MjA5NjE0MjU0OX0.aR9XJjCZ6aUZ2_eRC_cBEvawJSrHfhC7Cb_ogm8WEc8";
const HOME_VENUE_ID = "00000000-0000-4000-8000-000000000001";

const categoryClassBySlug = {
  accessories: "accessories",
  all: "all",
  fashion: "fashion",
  food: "food",
  footwear: "footwear",
  grocery: "grocery",
  beauty: "beauty",
  entertainment: "entertainment",
  jewellery: "jewellery",
  jewelry: "jewellery",
  watches: "watches",
};

const categoryOrder = [
  "fashion",
  "food",
  "footwear",
  "jewellery",
  "beauty",
  "accessories",
  "entertainment",
  "watches",
  "grocery",
  "all",
];

const categoryIconByKey = {
  accessories: "icons/Accessories.png",
  accessory: "icons/Accessories.png",
  beauty: "icons/Beauty.png",
  entertainment: "icons/entertainment.png",
  fashion: "icons/fashion.png",
  food: "icons/food.png",
  footwear: "icons/Footwear.png",
  grocery: "icons/Grocery.png",
  jewellery: "icons/Jewellery.png",
  jewelry: "icons/Jewellery.png",
  watches: "icons/Watches.png",
  all: "icons/all.png",
};

const categoryLabelByKey = {
  entertainment: "FUN",
};

const fallbackCategories = [
  ["FASHION", "fashion", "fashion"],
  ["FOOD", "food", "food"],
  ["FOOTWEAR", "footwear", "footwear"],
  ["JEWELLERY", "jewellery", "jewellery"],
  ["BEAUTY", "beauty", "beauty"],
  ["ACCESSORIES", "accessories", "accessories"],
  ["FUN", "entertainment", "entertainment"],
  ["WATCHES", "watches", "watches"],
  ["GROCERY", "grocery", "grocery"],
  ["ALL", "all", "all"],
];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cssUrl(value) {
  return `url("${String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}")`;
}

function supabaseQuery(table, params = {}) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  }).then(async (response) => {
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`${table}: ${response.status} ${message}`);
    }

    return response.json();
  });
}

function formatEventDate(value) {
  if (!value) return "COMING SOON";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
    .format(new Date(value))
    .toUpperCase();
}

function renderVenue(venue, floor) {
  const venueName = document.querySelector("[data-venue-name]");
  const venueCity = document.querySelector("[data-venue-city]");
  const floorName = document.querySelector("[data-floor-name]");

  if (venueName && venue?.name) venueName.textContent = venue.name.toUpperCase();
  if (venueCity && venue?.city) venueCity.textContent = venue.city.toUpperCase();
  if (floorName && floor?.name) floorName.textContent = floor.name.toUpperCase();
}

function renderBanner(banner, venue) {
  if (!banner) return;

  const card = document.querySelector("[data-banner-card]");
  const tag = document.querySelector("[data-banner-tag]");
  const title = document.querySelector("[data-banner-title]");
  const subtitle = document.querySelector("[data-banner-subtitle]");

  if (card?.hasAttribute("data-static-banner")) return;

  if (card && banner.image_url) {
    card.classList.add("has-image");
    card.style.setProperty("--banner-image", `url("${banner.image_url}")`);
  }

  if (tag && banner.tag) tag.textContent = banner.tag.toUpperCase();
  if (title && banner.title) {
    title.innerHTML = `${escapeHtml(banner.title).toUpperCase()}<br /><b>${escapeHtml(banner.subtitle || "EXPLORE").toUpperCase()}</b>`;
  }
  if (subtitle) subtitle.textContent = `AT ${(venue?.name || "INORBIT MALAD").toUpperCase()}`;
}

function renderCategories(categories) {
  const grid = document.querySelector("[data-categories-grid]");
  if (!grid) return;

  const rows = categories?.length
    ? categoryOrder
        .map((key) => categories.find((category) => {
          const slug = String(category.slug || "").toLowerCase();
          const iconKey = String(category.map_icon_key || "").toLowerCase();
          const name = String(category.name || "").toLowerCase();
          return slug === key || iconKey === key || name === key;
        }) || { name: key, slug: key, map_icon_key: key })
        .map((category) => [
          category.name,
          categoryClassBySlug[category.slug] || categoryClassBySlug[category.map_icon_key] || String(category.name || "").toLowerCase(),
          category.slug || category.map_icon_key || category.name,
        ])
    : fallbackCategories;

  grid.innerHTML = rows
    .map(([label, iconClass, iconKey]) => {
      const normalizedKey = String(iconKey || label || "").toLowerCase().replace(/\s+/g, "-");
      const iconSrc = categoryIconByKey[normalizedKey] || categoryIconByKey[iconClass] || categoryIconByKey.grocery;
      const displayLabel = categoryLabelByKey[normalizedKey] || label;
      return `<button class="category" type="button"><span class="cat-icon ${iconClass}"><img src="${iconSrc}" alt="" /></span><b>${escapeHtml(displayLabel).toUpperCase()}</b></button>`;
    })
    .join("");
}

function renderStores(offers) {
  const grid = document.querySelector("[data-stores-grid]");
  if (!grid || !offers?.length) return;

  grid.innerHTML = offers.slice(0, 4).map((offer, index) => {
    const store = offer.stores || {};
    const zone = [store.subtitle || "Ground Floor", store.zone].filter(Boolean).join(" &middot; ");
    const distance = index === 3 ? "80m away" : "60m away";
    const minutes = index === 3 ? "3 min" : "2 min";
    const imageUrl = store.logo_url || "";

    return `
      <article class="store-card">
        <div class="store-photo live-store-photo" style="--store-image: url('${escapeHtml(imageUrl)}')">
          <span class="deal">${escapeHtml(offer.discount_label || offer.title || "OFFER")}</span>
        </div>
        <div class="store-info">
          <h3>${escapeHtml(store.name || offer.title || "Store")}</h3>
          <p><span class="mini-pin"></span>${zone}</p>
          <p><span class="walk-icon"></span><b>${distance}</b> &middot; <b>${minutes}</b></p>
          <i class="right-chevron" aria-hidden="true"></i>
        </div>
      </article>
    `;
  }).join("");
}

function renderEvents(events) {
  const grid = document.querySelector("[data-events-grid]");
  if (!grid || !events?.length) return;

  grid.innerHTML = events.slice(0, 2).map((event) => {
    const words = String(event.title || "Mall Event").split(" ");
    const title = words.length > 2
      ? `${escapeHtml(words.slice(0, 2).join(" "))}<br />${escapeHtml(words.slice(2).join(" "))}`
      : escapeHtml(event.title || "Mall Event");
    const imageStyle = event.image_url ? `style="--event-image: url('${escapeHtml(event.image_url)}')"` : "";
    const imageClass = event.image_url ? " has-image" : "";

    return `
      <article class="event-card">
        <div class="event-art${imageClass}" ${imageStyle}>
          ${event.image_url ? "" : `<h3>${title}</h3><p>${escapeHtml(event.emoji || "Live at the mall")}</p>`}
        </div>
        <div class="event-meta">
          <span>${formatEventDate(event.starts_at)}</span>
          <p><span class="mini-pin"></span>${escapeHtml(event.location_label || "Ground Floor")}</p>
          <i class="right-chevron" aria-hidden="true"></i>
        </div>
      </article>
    `;
  }).join("");
}

function renderFeatured(banners, events = []) {
  const track = document.querySelector("[data-featured-track]");
  if (!track) return;
  if (track.querySelector(".featured-card")) return;

  const bannerCards = (banners || [])
    .filter((banner) => banner?.image_url)
    .map((banner) => ({
      tag: banner.tag || "TRENDING NOW",
      title: banner.title || "Featured This Week",
      subtitle: banner.subtitle || "",
      location: "Ground Floor &middot; Central",
      imageUrl: banner.image_url,
    }));

  const eventCards = (events || [])
    .filter((event) => event?.image_url)
    .map((event) => ({
      tag: "EVENT",
      title: event.title || "Mall Event",
      subtitle: "",
      location: escapeHtml(event.location_label || "Ground Floor"),
      imageUrl: event.image_url,
    }));

  const sourceCards = bannerCards.length ? bannerCards : eventCards;
  if (!sourceCards.length) return;

  const cards = Array.from({ length: Math.max(3, sourceCards.length) }, (_, index) => sourceCards[index % sourceCards.length]).slice(0, 3);

  track.innerHTML = cards.map((card, index) => {
    const cardClass = index % 3 === 0 ? "gaming-feature" : index % 3 === 1 ? "hero-feature is-active" : "food-feature";
    const titleParts = [card.title, card.subtitle].filter(Boolean).map((part) => escapeHtml(part).toUpperCase());
    const title = titleParts.join("<br />") || "DON'T MISS THIS";

    return `
      <article class="featured-card ${cardClass}" style="--featured-image: ${escapeHtml(cssUrl(card.imageUrl))}">
        <div class="featured-card-copy">
          <span>${escapeHtml(card.tag).toUpperCase()}</span>
          <h3>${title}</h3>
          <p class="featured-location"><span class="mini-pin"></span>${card.location}</p>
          <button type="button">EXPLORE <i></i></button>
        </div>
      </article>
    `;
  }).join("");
}

function initFeaturedCarousel() {
  const carousel = document.querySelector("[data-featured-carousel]");
  const track = document.querySelector("[data-featured-track]");
  if (!carousel || !track || carousel.dataset.ready === "true") return;

  carousel.dataset.ready = "true";

  const cards = Array.from(track.querySelectorAll(".featured-card"));
  const dots = Array.from(document.querySelectorAll(".featured-dots button"));
  let activeIndex = Math.max(0, cards.findIndex((card) => card.classList.contains("is-active")));

  const setActive = (index) => {
    activeIndex = (index + cards.length) % cards.length;
    cards.forEach((card, cardIndex) => {
      const offset = (cardIndex - activeIndex + cards.length) % cards.length;
      card.classList.toggle("is-active", offset === 0);
      card.classList.toggle("is-right", offset === 1);
      card.classList.toggle("is-left", offset === cards.length - 1);
      card.setAttribute("aria-hidden", String(offset !== 0));
    });
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
    });
  };

  const go = (direction) => setActive(activeIndex + direction);

  carousel.querySelector(".featured-prev")?.addEventListener("click", () => go(-1));
  carousel.querySelector(".featured-next")?.addEventListener("click", () => go(1));
  dots.forEach((dot, index) => dot.addEventListener("click", () => setActive(index)));
  setActive(activeIndex);
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.setInterval(() => go(1), 3600);
  }
}

async function loadHomeData() {
  if (!document.body.classList.contains("page-home")) return;

  try {
    const [venues, floors, banners, categories, offers, events] = await Promise.all([
      supabaseQuery("venues", {
        select: "*",
        id: `eq.${HOME_VENUE_ID}`,
        limit: "1",
      }),
      supabaseQuery("venue_floors", {
        select: "*",
        venue_id: `eq.${HOME_VENUE_ID}`,
        order: "sort_order.asc",
        limit: "1",
      }),
      supabaseQuery("promotion_banners", {
        select: "*",
        venue_id: `eq.${HOME_VENUE_ID}`,
        is_active: "eq.true",
        publish_status: "eq.published",
        order: "sort_order.asc",
        limit: "6",
      }),
      supabaseQuery("store_categories", {
        select: "*",
        order: "name.asc",
        limit: "9",
      }),
      supabaseQuery("offers", {
        select: "*,stores(*)",
        venue_id: `eq.${HOME_VENUE_ID}`,
        is_active: "eq.true",
        publish_status: "eq.published",
        limit: "4",
      }),
      supabaseQuery("events", {
        select: "*",
        venue_id: `eq.${HOME_VENUE_ID}`,
        is_active: "eq.true",
        publish_status: "eq.published",
        order: "starts_at.asc",
        limit: "2",
      }),
    ]);

    const venue = venues[0];
    renderVenue(venue, floors[0]);
    renderBanner(banners[0], venue);
    renderCategories(categories);
    renderStores(offers);
    renderEvents(events);
    renderFeatured(banners, events);
    initFeaturedCarousel();
  } catch (error) {
    console.warn("Unable to load Supabase home data. Showing static fallback.", error);
    initFeaturedCarousel();
  }
}

loadHomeData();
