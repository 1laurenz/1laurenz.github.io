/* -- ───────────────────────────────
   -- LZ Navigation
   -- ─────────────────────────────── */

(function () {
  const header = document.getElementById("siteHeader");
  const toggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileLinks = mobileMenu.querySelectorAll("a");

  let lastScrollY = window.scrollY;
  const SCROLL_THRESHOLD = 24; // avoid flicker near top

  function isMobile() {
    return window.innerWidth <= 809;
  }

  function isDesktop() {
    return window.innerWidth >= 810;
  }

  /* ===== Mobile menu ===== */
  function setMobileMenu(open) {
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.setAttribute("aria-hidden", String(!open));
  }

  toggle.addEventListener("click", function () {
    if (!isMobile()) return;
    setMobileMenu(!header.classList.contains("is-open"));
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (isMobile()) setMobileMenu(false);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && header.classList.contains("is-open")) {
      setMobileMenu(false);
    }
  });

  document.addEventListener("click", (e) => {
    if (!isMobile()) return;
    if (!header.classList.contains("is-open")) return;
    if (!header.contains(e.target)) setMobileMenu(false);
  });

  /* ===== Desktop scroll behavior =====
     - Scroll down => compact state
     - Scroll up   => normal state
     - Only desktop
  */
  function updateDesktopScrollState() {
    if (!isDesktop()) {
      header.classList.remove("desktop-compact-mode");
      lastScrollY = window.scrollY;
      return;
    }

    const currentY = window.scrollY;
    const scrollingDown = currentY > lastScrollY;
    const scrollingUp = currentY < lastScrollY;

    // Always reset near top
    if (currentY <= SCROLL_THRESHOLD) {
      header.classList.remove("desktop-compact-mode");
      lastScrollY = currentY;
      return;
    }

    if (scrollingDown) {
      header.classList.add("desktop-compact-mode");
    } else if (scrollingUp) {
      header.classList.remove("desktop-compact-mode");
    }

    lastScrollY = currentY;
  }

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateDesktopScrollState();
        ticking = false;
      });
      ticking = true;
    }
  });

  window.addEventListener("resize", () => {
    if (isDesktop()) {
      setMobileMenu(false);
    }
    updateDesktopScrollState();
  });

  // Initial state
  setMobileMenu(false);
  updateDesktopScrollState();
})();

(function () {
  /* -------------------------
     Services 
  ------------------------- */
  const accordion = document.getElementById("servicesAccordion");
  if (accordion) {
    const items = Array.from(accordion.querySelectorAll(".service-item"));

    function setItemState(item, open) {
      const trigger = item.querySelector(".service-trigger");
      const panel = item.querySelector(".service-panel");
      const path = item.querySelector(".service-chevron path");

      item.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
      panel.hidden = !open;

      if (path) {
        path.setAttribute("d", open ? "M6 14L12 8L18 14" : "M6 10L12 16L18 10");
      }
    }

    items.forEach((item) => {
      const trigger = item.querySelector(".service-trigger");
      trigger.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");
        items.forEach((x) => setItemState(x, false));
        setItemState(item, !isOpen);
      });
    });

    items.forEach((item, i) => setItemState(item, i === 0));
  }

  /* -------------------------
     Shared floating image scroll animation (desktop only)

  ------------------------- */

  const floatingCard  = document.getElementById("floatingCard");
  const faceFront     = document.getElementById("floatingFaceFront");
  const faceBack      = document.getElementById("floatingFaceBack");
  const badge         = document.getElementById("floatingBadge");

  const slotHero     = document.getElementById("slotHero");
  const slotServices = document.getElementById("slotServices");
  const slotAbout    = document.getElementById("slotAbout");

  if (!floatingCard || !slotHero || !slotServices || !slotAbout) return;

  const HERO_IMG    = "https://framerusercontent.com/images/qrxY8NagVO40NBrdhFEGgFR3PYY.jpg?width=620&height=630";
  const SERVICE_IMG = "https://framerusercontent.com/images/qbjsnnvP9w7UaA2syp36oUe8OSo.jpg";

  const frontImg = faceFront.querySelector("img");
  const backImg  = faceBack.querySelector("img");
  frontImg.src = HERO_IMG;
  backImg.src  = SERVICE_IMG;

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2; }
  function isDesktop() { return window.innerWidth > 809; }

  function slotCenter(slotEl) {
    const r = slotEl.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  // Progress based on when a target's center crosses a viewport band.
  // startY (lower) -> endY (higher). As the center moves up, progress goes 0→1.
  function progressFromCenterY(centerY, startY, endY) {
    const denom = (startY - endY) || 1;
    return clamp((startY - centerY) / denom, 0, 1);
  }

  function updateFloatingCard() {
    if (!isDesktop()) {
      floatingCard.style.opacity = "0";
      return;
    }
    floatingCard.style.opacity = "1";

    const vh = window.innerHeight;
    const cardW = floatingCard.offsetWidth || 250;
    const cardH = floatingCard.offsetHeight || 320;

    const heroC = slotCenter(slotHero);
    const servC = slotCenter(slotServices);
    const aboutC = slotCenter(slotAbout);

    // Flip windows:
    // - flip1 happens as Services slot center moves from ~80%vh to ~40%vh
    // - flip2 happens as About slot center moves from ~80%vh to ~40%vh
    const startY = vh * 0.80;
    const endY   = vh * 0.40;

    const raw1 = progressFromCenterY(servC.y, startY, endY);
    const raw2 = progressFromCenterY(aboutC.y, startY, endY);

    const flip1 = easeInOut(raw1);
    const flip2 = easeInOut(raw2);

    // Position: hero -> services (flip1), then services -> about (flip2).
    const x1 = lerp(heroC.x, servC.x, flip1);
    const y1 = lerp(heroC.y, servC.y, flip1);
    const x  = lerp(x1, aboutC.x, flip2);
    const y  = lerp(y1, aboutC.y, flip2);

    // RotationY accumulates both flips (0→180→360).
    const yRot = flip1 * 180 + flip2 * 180;

    // Slight Z-tilt to mimic Framer’s "angled card"
    const zRot = lerp(lerp(-6, 9, flip1), 6, flip2);

    // Scale changes are subtle; keep them small so landing feels precise.
    const scale = lerp(lerp(1.0, 1.06, flip1), 1.04, flip2);

    // Badge: present in Hero, fades out during the first transition.
    const badgeT = clamp(flip1 * 1.35, 0, 1);
    const badgeOpacity = lerp(1, 0, badgeT);
    const badgeScale = lerp(1, 0.35, badgeT);
    badge.style.opacity = String(badgeOpacity);
    badge.style.transform = `scale(${badgeScale}) rotate(-8deg)`;

    // Translate so the card's CENTER sits on the slot's center.
    const left = x - cardW / 2;
    const top  = y - cardH / 2;

    floatingCard.style.transform =
      `translate3d(${left}px, ${top}px, 0) rotateZ(${zRot}deg) scale(${scale}) rotateY(${yRot}deg)`;
  }

  /* Throttle via rAF */
  let ticking = false;
  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateFloatingCard();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);
  window.addEventListener("load", onScrollOrResize);
  updateFloatingCard();
})();

/* -- ───────────────────────────────
   -- LZ Projects
   -- ─────────────────────────────── */

(() => {

  const stack = document.getElementById("projectsStack");
  const stage = document.getElementById("projectsStage");
  const list  = document.getElementById("projectsList");
  if (!stack || !stage || !list) return;

  const cards = Array.from(list.querySelectorAll(".project"));
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function isDesktop() {
    return window.innerWidth >= 810 && !prefersReduced;
  }

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  let staged = false;

  // We store original parent so we can restore on resize down to mobile.
  const originalParent = list;
  const originalOrder = cards.slice();

  function setCSSVar(name, value) {
    stack.style.setProperty(name, String(value));
  }

  function stageCards() {
    if (!isDesktop()) {
      if (staged) {
        // Restore DOM order back into list
        originalOrder.forEach(c => originalParent.appendChild(c));
        originalOrder.forEach(c => {
          c.style.transform = "";
          c.style.opacity = "";
          c.style.zIndex = "";
          c.style.pointerEvents = "";
        });
        stack.style.removeProperty("--stack-steps");
        staged = false;
      }
      return;
    }

    if (staged) return;

    // Move cards into stage for true overlap
    cards.forEach(c => stage.appendChild(c));

    // Set steps for stack height calculation
    setCSSVar("--stack-steps", cards.length);

    staged = true;
  }

  function getNumbers() {
    const root = getComputedStyle(document.documentElement);

    const shrinkScale = parseFloat(root.getPropertyValue("--shrink-scale")) || 0.92;
    const shrinkY     = parseFloat(root.getPropertyValue("--shrink-y")) || -44;
    const nextStartY  = parseFloat(root.getPropertyValue("--next-start-y")) || 160;
    const peekY       = parseFloat(root.getPropertyValue("--peek-y")) || 240;

    return { shrinkScale, shrinkY, nextStartY, peekY };
  }

  function getStackScrollRange() {
    // Sticky pins while the stack is within view.
    const rect = stack.getBoundingClientRect();
    const start = window.scrollY + rect.top;
    const end = start + stack.offsetHeight - window.innerHeight;
    return { start, end: Math.max(start + 1, end) };
  }

  function update() {
    stageCards();
    if (!isDesktop() || !staged) return;

    const { shrinkScale, shrinkY, nextStartY, peekY } = getNumbers();

    const { start, end } = getStackScrollRange();
    const y = window.scrollY;

    const totalSteps = cards.length - 1;

    // progress across steps: 0..(n-1)
    const p = clamp((y - start) / (end - start), 0, 1) * totalSteps;
    const i = Math.floor(p);
    const t = easeInOut(clamp(p - i, 0, 1));

    // The “peek” card should be visible once we’re mid-stack,
    // like your screenshot part-3.
    const peekOpacity = 1;

    cards.forEach((card, idx) => {
      // Defaults: hide everything far away
      let opacity = 0;
      let ty = nextStartY;
      let scale = 1;

      // Determine stacking order each frame so overlap reads correctly:
      // next (i+1) on top, then current (i), then past.
      let z = 1;

      // Past cards: small & slightly up (behind)
      if (idx < i) {
        opacity = 1;
        ty = shrinkY;
        scale = shrinkScale;
        z = 10 + idx; // increasing but below current/next
      }

      // Current card: shrinks as you approach next
      if (idx === i) {
        opacity = 1;
        ty = lerp(0, shrinkY, t);
        scale = lerp(1, shrinkScale, t);
        z = 200; // above past
      }

      // Next card: rises up and fully overlaps
      if (idx === i + 1) {
        opacity = 1;
        ty = lerp(nextStartY, 0, t);
        scale = 1;
        z = 300; // top
      }

      // Peek card: card after next is visible lower down (no animation “fancy”, just cue)
      if (idx === i + 2) {
        opacity = peekOpacity;
        // It starts lower, then creeps up slightly as the next card reaches center
        ty = lerp(nextStartY + peekY, peekY, t);
        scale = 1;
        z = 120; // below current/next, above background
      }

      // If we’re at/after the final step, lock the last card in place.
      if (i >= totalSteps && idx === totalSteps) {
        opacity = 1;
        ty = 0;
        scale = 1;
        z = 400;
      }

      // Pointer events: keep links clickable only on visible cards.
      // (We allow current + next + last.)
      const clickable =
        (idx === i) ||
        (idx === i + 1) ||
        (i >= totalSteps && idx === totalSteps);

      card.style.pointerEvents = clickable ? "auto" : "none";
      card.style.zIndex = String(z);
      card.style.opacity = String(opacity);
      card.style.transform = `translateX(-50%) translateY(${ty}px) scale(${scale})`;
    });
  }

  // rAF throttle
  let ticking = false;
  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);
  window.addEventListener("load", onScrollOrResize);

  update();
})();

/* -- ───────────────────────────────
   -- LZ FAQs
   -- ─────────────────────────────── */

(() => {
  const root = document.getElementById("faqAccordion");
  if (!root) return;

  const items = Array.from(root.querySelectorAll(".faq-item"));

  function setOpen(item, open) {
    const btn = item.querySelector(".faq-trigger");
    const panel = item.querySelector(".faq-panel");
    const path = item.querySelector(".faq-icon path");

    item.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;

    // Up chevron when open, down chevron when closed
    if (path) {
      path.setAttribute("d", open ? "M6 14L12 8L18 14" : "M6 10L12 16L18 10");
    }
  }

  // Initialize: first is open (matches your screenshot)
  items.forEach((item, idx) => setOpen(item, idx === 0));

  items.forEach((item) => {
    const btn = item.querySelector(".faq-trigger");
    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      items.forEach((x) => setOpen(x, false));
      setOpen(item, !isOpen);
    });

    // keyboard: Enter/Space already works on <button>
  });
})();

/* -- ───────────────────────────────
   -- Contact
   -- ─────────────────────────────── */

(() => {
  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");
  if (!form) return;

  function setNote(msg) {
    if (!note) return;
    note.textContent = msg || "";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // basic validation (keeps “required” behavior but gives a friendly message)
    const fd = new FormData(form);
    const name = String(fd.get("Name") || "").trim();
    const email = String(fd.get("Email") || "").trim();
    const service = String(fd.get("Service") || "").trim();
    const message = String(fd.get("Text Area") || "").trim();

    if (!name || !email || !service || !message) {
      setNote("Please fill out all fields.");
      return;
    }

    // no backend here (pure front-end replica)
    setNote("Thanks! Your message is ready to send.");
    form.reset();
  });
})();