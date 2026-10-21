/* The Glam Game — vanilla JS, no dependencies. Works from file:// */
(function () {
  "use strict";

  /* ---------- CONFIG: edit here only ---------- */
  var CONFIG = {
    // The custom domain is NOT registered/connected yet.
    // Leave empty to use wherever the site is currently hosted (e.g. your *.vercel.app URL).
    // Once theglamgame.in is purchased and connected on Vercel, set: "https://theglamgame.in"
    SITE_URL: "",
    INTENDED_DOMAIN: "https://theglamgame.in",
    BRAND: "The Glam Game",
    ARTIST: "Sufia Ashique",
    PHONE: "8092105966",
    WHATSAPP: "918092105966",
    INSTAGRAM: "https://www.instagram.com/theglam_game/",
    ADDRESS: {
      street: "Road Number 1C, Aliganj Main Road, Ashok Nagar",
      city: "Gaya", region: "Bihar", postal: "823001", country: "IN"
    },
    LAT: 24.797083,
    LNG: 84.983222,
    // Optional: add real photos to /assets and list them, e.g.
    // [{src:"assets/bride-1.jpg", alt:"Bridal makeup look by The Glam Game"}]
    GALLERY: []
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Site URL (http/https only; file:// stays empty) ---------- */
  function siteUrl() {
    var u = CONFIG.SITE_URL;
    if (!u && /^https?:$/.test(location.protocol)) u = location.origin + location.pathname.replace(/index\.html$/, "");
    return u ? u.replace(/\/?$/, "/") : "";
  }

  /* ---------- Links ---------- */
  var baseMsg = "Hello! I'd like to enquire about bridal makeup with " + CONFIG.BRAND + ".";
  function waLink(text) { return "https://wa.me/" + CONFIG.WHATSAPP + "?text=" + encodeURIComponent(text || baseMsg); }
  $$("[data-wa]").forEach(function (a) { a.href = waLink(); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-tel]").forEach(function (a) { a.href = "tel:+91" + CONFIG.PHONE; });
  var mapsQ = CONFIG.LAT + "," + CONFIG.LNG;
  var ml = $("#mapLink"); if (ml) ml.href = "https://www.google.com/maps/search/?api=1&query=" + mapsQ;
  var mf = $("#mapFrame"); if (mf) mf.src = "https://maps.google.com/maps?q=" + mapsQ + "&z=16&output=embed";
  var yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- SEO: canonical, og:url, JSON-LD (only when a real URL exists) ---------- */
  (function seo() {
    var url = siteUrl();
    var a = CONFIG.ADDRESS;
    var data = {
      "@context": "https://schema.org",
      "@type": "MakeupArtist",
      name: CONFIG.BRAND,
      description: "Bridal makeup studio by " + CONFIG.ARTIST + " in Gaya, Bihar. Studio visits and travel bookings by arrangement.",
      telephone: "+91" + CONFIG.PHONE,
      sameAs: [CONFIG.INSTAGRAM],
      address: { "@type": "PostalAddress", streetAddress: a.street, addressLocality: a.city, addressRegion: a.region, postalCode: a.postal, addressCountry: a.country },
      geo: { "@type": "GeoCoordinates", latitude: CONFIG.LAT, longitude: CONFIG.LNG },
      areaServed: { "@type": "City", name: "Gaya" }
    };
    if (url) {
      data.url = url;
      var l = document.createElement("link"); l.rel = "canonical"; l.href = url; document.head.appendChild(l);
      var og = document.createElement("meta"); og.setAttribute("property", "og:url"); og.content = url; document.head.appendChild(og);
    }
    var s = document.createElement("script");
    s.type = "application/ld+json"; s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  })();

  /* ---------- Header / menu ---------- */
  var header = $(".site-header"), burger = $("#burger"), menu = $("#menu");
  function onScroll() { header.classList.toggle("solid", window.scrollY > 30); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  burger.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------- Reveal on scroll ---------- */
  var items = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 80 + "ms"; io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- Optional gallery photos ---------- */
  if (CONFIG.GALLERY.length) {
    $$("#gallery .tile").forEach(function (tile, i) {
      var g = CONFIG.GALLERY[i]; if (!g) return;
      var img = new Image(); img.src = g.src; img.alt = g.alt || ""; img.loading = "lazy";
      img.onload = function () { tile.insertBefore(img, tile.firstChild); };
    });
  }

  /* ---------- Booking form → WhatsApp ---------- */
  var form = $("#enquiry"), err = $("#formErr"), venueWrap = $("#venueWrap");
  var dateInput = $("#date");
  (function () { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); dateInput.min = d.toISOString().slice(0, 10); })();

  function syncMode() {
    var travel = form.mode.value.indexOf("Travel") === 0;
    venueWrap.hidden = !travel;
  }
  $$("input[name=mode]", form).forEach(function (r) { r.addEventListener("change", syncMode); });
  $$("[data-pick]").forEach(function (a) {
    a.addEventListener("click", function () {
      var v = a.getAttribute("data-pick") === "travel" ? "Travel booking (by arrangement)" : "At the studio in Gaya";
      $$("input[name=mode]", form).forEach(function (r) { r.checked = r.value === v; });
      syncMode();
    });
  });
  syncMode();

  function fmtDate(v) {
    var p = v.split("-"); if (p.length !== 3) return v;
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  }
  function validate() {
    var bad = [], f = form.elements;
    [f.name, f.phone, f.date].forEach(function (el) { el.classList.remove("invalid"); });
    if (!f.name.value.trim()) bad.push(f.name);
    if (!/^(\+?91[\s-]?)?[6-9]\d{9}$/.test(f.phone.value.replace(/[\s-]/g, "").replace(/^0/, ""))) bad.push(f.phone);
    if (!f.date.value || f.date.value < f.date.min) bad.push(f.date);
    if (!venueWrap.hidden && !f.venue.value.trim()) bad.push(f.venue);
    bad.forEach(function (el) { el.classList.add("invalid"); });
    if (bad.length) {
      err.textContent = "Please check the highlighted fields (valid 10-digit mobile number and a future date).";
      err.hidden = false; bad[0].focus(); return false;
    }
    err.hidden = true; return true;
  }
  function buildMessage() {
    var f = form.elements;
    var lines = [
      "Hello " + CONFIG.BRAND + "! I'd like to enquire about bridal makeup.",
      "",
      "Name: " + f.name.value.trim(),
      "Phone: " + f.phone.value.trim(),
      "Event date: " + fmtDate(f.date.value),
      "Preference: " + f.mode.value
    ];
    if (!venueWrap.hidden && f.venue.value.trim()) lines.push("Venue / city: " + f.venue.value.trim());
    if (f.note.value.trim()) lines.push("Notes: " + f.note.value.trim());
    lines.push("", "Please let me know availability and pricing. Thank you!");
    return lines.join("\n");
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;
    window.open(waLink(buildMessage()), "_blank", "noopener");
  });
  $("#copyBtn").addEventListener("click", function () {
    if (!validate()) return;
    var msg = buildMessage(), btn = this;
    function done() { btn.textContent = "Copied — paste it in WhatsApp or SMS"; setTimeout(function () { btn.textContent = "Copy message instead"; }, 3000); }
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(msg).then(done, fallback); } else fallback();
    function fallback() {
      var t = document.createElement("textarea"); t.value = msg; t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); done(); } catch (x) { err.textContent = "Couldn't copy automatically. Please use the WhatsApp button."; err.hidden = false; }
      document.body.removeChild(t);
    }
  });
})();
