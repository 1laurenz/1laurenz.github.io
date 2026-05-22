/* ─────────────────────────────────────
   LZ Site Scripts
   ───────────────────────────────────── */

(() => {
  "use strict";

  const BREAKPOINT_DESKTOP = 810;
  const CHEVRON_DOWN_PATH = "M6 10L12 16L18 10";
  const CHEVRON_UP_PATH = "M6 14L12 8L18 14";

  const isDesktop = () => window.innerWidth >= BREAKPOINT_DESKTOP;
  const isMobile = () => !isDesktop();

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (start, end, amount) => start + (end - start) * amount;

  const smoothstep = (value) => {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  };

  const easeInOut = (value) => {
    return value < 0.5
      ? 2 * value * value
      : 1 - Math.pow(-2 * value + 2, 2) / 2;
  };

  const getNumberFromCSS = (element, propertyName, fallback) => {
    const value = parseFloat(
      getComputedStyle(element).getPropertyValue(propertyName)
    );

    return Number.isNaN(value) ? fallback : value;
  };

  const runOnAnimationFrame = (() => {
    let frameId = null;

    return (callback) => {
      if (frameId) return;

      frameId = requestAnimationFrame(() => {
        frameId = null;
        callback();
      });
    };
  })();

  /* ─────────────────────────────────────
     LZ Navigation
     ───────────────────────────────────── */

  (() => {
    const header = document.getElementById("lz-navigation");
    const toggleButton = document.getElementById("lz-menu-toggle-button");
    const navPanel = document.getElementById("lz-navigation-panel");

    if (!header) return;

    const container = header.querySelector(".lz-container");
    const topbar = header.querySelector(".lz-navigation-topbar");
    const panelLinks = navPanel ? Array.from(navPanel.querySelectorAll("a")) : [];

    const SCROLL_THRESHOLD = 24;
    const MAX_NAV_WIDTH = 1280;

    let lastScrollY = window.scrollY;
    let isCompact = false;
    let isScrollTicking = false;

    const setMobileMenu = (open) => {
      header.classList.toggle("lz-is-open", open);

      if (toggleButton) {
        toggleButton.setAttribute("aria-expanded", String(open));
        toggleButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      }

      if (navPanel) {
        navPanel.setAttribute("aria-hidden", String(!open));
      }
    };

    const getExpandedWidth = () => {
      if (!container) return 0;

      const headerStyles = getComputedStyle(header);
      const paddingLeft = parseFloat(headerStyles.paddingLeft) || 0;
      const paddingRight = parseFloat(headerStyles.paddingRight) || 0;
      const availableWidth = header.clientWidth - paddingLeft - paddingRight;

      return Math.min(MAX_NAV_WIDTH, availableWidth);
    };

    const getCompactWidth = () => {
      if (!container || !topbar) return 0;

      const avatar = header.querySelector(".lz-avatar");
      const status = header.querySelector(".lz-navigation-status");

      const topbarStyles = getComputedStyle(topbar);
      const containerStyles = getComputedStyle(container);

      const paddingLeft = parseFloat(topbarStyles.paddingLeft) || 0;
      const paddingRight = parseFloat(topbarStyles.paddingRight) || 0;
      const gap = parseFloat(topbarStyles.columnGap || topbarStyles.gap) || 0;

      const borderLeft = parseFloat(containerStyles.borderLeftWidth) || 0;
      const borderRight = parseFloat(containerStyles.borderRightWidth) || 0;

      const avatarWidth = avatar ? avatar.getBoundingClientRect().width : 0;
      const statusWidth = status ? status.getBoundingClientRect().width : 0;

      return Math.ceil(
        paddingLeft +
          avatarWidth +
          gap +
          statusWidth +
          paddingRight +
          borderLeft +
          borderRight
      );
    };

    const resetDesktopNavStyles = () => {
      if (!container) return;

      isCompact = false;
      header.classList.remove("lz-desktop-compact-mode");
      container.style.width = "";
    };

    const setDesktopCompactMode = (compact) => {
      if (!isDesktop() || !container) return;
      if (isCompact === compact) return;

      isCompact = compact;

      const startWidth = container.getBoundingClientRect().width;
      const endWidth = compact ? getCompactWidth() : getExpandedWidth();

      container.style.width = `${startWidth}px`;

      // Forces the browser to register the starting width before animating.
      container.offsetWidth;

      header.classList.toggle("lz-desktop-compact-mode", compact);
      container.style.width = `${endWidth}px`;
    };

    const updateDesktopScrollState = () => {
      if (!isDesktop()) {
        resetDesktopNavStyles();
        lastScrollY = window.scrollY;
        return;
      }

      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      const scrollingUp = currentScrollY < lastScrollY;

      if (currentScrollY <= SCROLL_THRESHOLD) {
        setDesktopCompactMode(false);
        lastScrollY = currentScrollY;
        return;
      }

      if (scrollingDown) {
        setDesktopCompactMode(true);
      }

      if (scrollingUp) {
        setDesktopCompactMode(false);
      }

      lastScrollY = currentScrollY;
    };

    const syncNavWidthAfterResize = () => {
      if (!container) return;

      const targetWidth = isCompact ? getCompactWidth() : getExpandedWidth();
      container.style.width = `${targetWidth}px`;
    };

    if (toggleButton) {
      toggleButton.addEventListener("click", () => {
        if (!isMobile()) return;

        const isOpen = header.classList.contains("lz-is-open");
        setMobileMenu(!isOpen);
      });
    }

    panelLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (isMobile()) {
          setMobileMenu(false);
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (!header.classList.contains("lz-is-open")) return;

      setMobileMenu(false);
    });

    document.addEventListener("click", (event) => {
      if (!isMobile()) return;
      if (!header.classList.contains("lz-is-open")) return;
      if (header.contains(event.target)) return;

      setMobileMenu(false);
    });

    window.addEventListener(
      "scroll",
      () => {
        if (isScrollTicking) return;

        isScrollTicking = true;

        requestAnimationFrame(() => {
          updateDesktopScrollState();
          isScrollTicking = false;
        });
      },
      { passive: true }
    );

    window.addEventListener("resize", () => {
      if (isDesktop()) {
        setMobileMenu(false);
        syncNavWidthAfterResize();
      } else {
        resetDesktopNavStyles();
      }

      updateDesktopScrollState();
    });

    setMobileMenu(false);
    updateDesktopScrollState();
  })();

  /* ─────────────────────────────────────
   LZ Accordions
   ───────────────────────────────────── */

const setupAccordion = ({
  rootId,
  itemSelector = ".lz-accordion-item",
  triggerSelector = ".lz-accordion-trigger",
  panelSelector = ".lz-accordion-panel",
  iconPathSelector,
  openFirst = true,
}) => {
  const root = document.getElementById(rootId);
  if (!root) return;

  const items = Array.from(root.querySelectorAll(itemSelector));

  const setItemOpen = (item, open) => {
    const trigger = item.querySelector(triggerSelector);
    const panel = item.querySelector(panelSelector);
    const iconPath = iconPathSelector
      ? item.querySelector(iconPathSelector)
      : null;

    if (!trigger || !panel) return;

    item.classList.toggle("lz-is-open", open);
    trigger.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;

    if (iconPath) {
      iconPath.setAttribute("d", open ? CHEVRON_UP_PATH : CHEVRON_DOWN_PATH);
    }
  };

  items.forEach((item, index) => {
    setItemOpen(item, openFirst && index === 0);
  });

  items.forEach((item) => {
    const trigger = item.querySelector(triggerSelector);
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const wasOpen = item.classList.contains("lz-is-open");

      items.forEach((otherItem) => {
        setItemOpen(otherItem, false);
      });

      setItemOpen(item, !wasOpen);
    });
  });
};

setupAccordion({
  rootId: "lz-services-accordion",
  iconPathSelector: ".lz-icon path",
});

setupAccordion({
  rootId: "lz-faq-accordion",
  iconPathSelector: ".lz-icon path",
});

  /* ─────────────────────────────────────
     LZ Shared Floating Card
     ───────────────────────────────────── */

  (() => {
    const floatingCard = document.getElementById("lz-floating-card");
    const faceFront = document.getElementById("lz-floating-face-front");
    const faceBack = document.getElementById("lz-floating-face-back");
    const badge = document.getElementById("lz-floating-badge");

    const slotHero = document.getElementById("lz-hero-card-slot");
    const slotServices = document.getElementById("lz-services-card-slot");
    const slotAbout = document.getElementById("lz-about-card-slot");

    const heroSection = document.getElementById("lz-home-hero");
    const servicesSection = document.getElementById("lz-home-services");
    const aboutSection = document.getElementById("lz-home-about");

    const requiredElements = [
      floatingCard,
      faceFront,
      faceBack,
      badge,
      slotHero,
      slotServices,
      slotAbout,
      heroSection,
      servicesSection,
      aboutSection,
    ];

    if (requiredElements.some((element) => !element)) return;

    const HERO_IMAGE_URL =
      "/img/lz-portrait.jpg";

    const SERVICES_IMAGE_URL =
      "/img/lz-logo.jpg";

    const frontImage = faceFront.querySelector("img");
    const backImage = faceBack.querySelector("img");

    if (frontImage) frontImage.src = HERO_IMAGE_URL;
    if (backImage) backImage.src = SERVICES_IMAGE_URL;

    const anchors = {
      hero: { x: 0, y: 0 },
      services: { x: 0, y: 0 },
      about: { x: 0, y: 0 },
    };

    const state = {
      x: 0,
      y: 0,
      rotY: 0,
      rotZ: -6,
      scale: 1,
      badgeOpacity: 1,
      initialized: false,
    };

    let frameId = null;
    let isTicking = false;
    let lastTimestamp = 0;

    const prefersReducedMotion = () => {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    };

    const getElementCenterInViewport = (element) => {
      const rect = element.getBoundingClientRect();

      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };

    const getSectionCenterY = (section) => {
      const rect = section.getBoundingClientRect();
      const documentTop = rect.top + window.scrollY;

      return documentTop + rect.height / 2;
    };

    const refreshAnchors = () => {
      const heroCenter = getElementCenterInViewport(slotHero);
      const servicesCenter = getElementCenterInViewport(slotServices);
      const aboutCenter = getElementCenterInViewport(slotAbout);

      anchors.hero.x = heroCenter.x + window.scrollX;
      anchors.services.x = servicesCenter.x + window.scrollX;
      anchors.about.x = aboutCenter.x + window.scrollX;

      anchors.hero.y =
        getSectionCenterY(heroSection) + window.innerHeight * 0.12;

      anchors.services.y = getSectionCenterY(servicesSection);
      anchors.about.y = getSectionCenterY(aboutSection);
    };

    const getFloatingCardTarget = () => {
      const heroY = anchors.hero.y;
      const servicesY = anchors.services.y;
      const aboutY = anchors.about.y;

      const firstSegmentStart = 0;
      const firstSegmentEnd = Math.max(1, servicesY - heroY);

      const secondSegmentStart = firstSegmentEnd;
      const secondSegmentEnd =
        secondSegmentStart + Math.max(1, aboutY - servicesY);

      const scrollY = Math.max(0, window.scrollY);

      let x = anchors.hero.x;
      let y = anchors.hero.y;
      let rotY = 0;

      let heroWeight = 1;
      let servicesWeight = 0;
      let aboutWeight = 0;

      if (scrollY <= firstSegmentEnd) {
        const rawProgress =
          (scrollY - firstSegmentStart) /
          Math.max(1, firstSegmentEnd - firstSegmentStart);

        const progress = smoothstep(rawProgress);

        x = lerp(anchors.hero.x, anchors.services.x, progress);
        y = lerp(anchors.hero.y, anchors.services.y, progress);
        rotY = lerp(0, 180, progress);

        heroWeight = 1 - progress;
        servicesWeight = progress;
        aboutWeight = 0;
      } else {
        const rawProgress =
          (scrollY - secondSegmentStart) /
          Math.max(1, secondSegmentEnd - secondSegmentStart);

        const progress = smoothstep(rawProgress);

        x = lerp(anchors.services.x, anchors.about.x, progress);
        y = lerp(anchors.services.y, anchors.about.y, progress);
        rotY = lerp(180, 360, progress);

        heroWeight = 0;
        servicesWeight = 1 - progress;
        aboutWeight = progress;
      }

      const rotZ = lerp(-6, 8, servicesWeight) + lerp(0, 4, aboutWeight);
      const scale = 1 + 0.05 * servicesWeight + 0.03 * aboutWeight;
      const badgeOpacity = clamp(heroWeight * 1.2, 0, 1);

      const viewportX = x - window.scrollX;
      const viewportY = y - window.scrollY;

      const cardWidth = floatingCard.offsetWidth || 250;
      const cardHeight = floatingCard.offsetHeight || 320;

      return {
        left: viewportX - cardWidth / 2,
        top: viewportY - cardHeight / 2,
        rotY,
        rotZ,
        scale,
        badgeOpacity,
      };
    };

    const syncStateToTarget = () => {
      const target = getFloatingCardTarget();

      state.x = target.left;
      state.y = target.top;
      state.rotY = target.rotY;
      state.rotZ = target.rotZ;
      state.scale = target.scale;
      state.badgeOpacity = target.badgeOpacity;
      state.initialized = true;
    };

    const requestRender = () => {
      if (frameId) return;

      frameId = requestAnimationFrame(render);
    };

    const render = (timestamp) => {
      frameId = null;

      if (!isDesktop()) {
        floatingCard.style.opacity = "0";
        state.initialized = false;
        return;
      }

      floatingCard.style.opacity = "1";

      const reduceMotion = prefersReducedMotion();
      const target = getFloatingCardTarget();

      if (!state.initialized) {
        syncStateToTarget();
      }

      const deltaTime = clamp((timestamp - lastTimestamp) / 16.67, 0.5, 2.5);
      lastTimestamp = timestamp || performance.now();

      const followAmount = reduceMotion ? 1 : 1 - Math.pow(0.14, deltaTime);

      state.x = lerp(state.x, target.left, followAmount);
      state.y = lerp(state.y, target.top, followAmount);
      state.rotY = lerp(state.rotY, target.rotY, followAmount);
      state.rotZ = lerp(state.rotZ, target.rotZ, followAmount);
      state.scale = lerp(state.scale, target.scale, followAmount);
      state.badgeOpacity = lerp(
        state.badgeOpacity,
        target.badgeOpacity,
        followAmount
      );

      const badgeScale = lerp(0.35, 1, state.badgeOpacity);

      badge.style.opacity = String(state.badgeOpacity);
      badge.style.transform = `scale(${badgeScale}) rotate(-8deg)`;

      floatingCard.style.transform =
        `translate3d(${state.x}px, ${state.y}px, 0) ` +
        `rotateZ(${state.rotZ}deg) ` +
        `scale(${state.scale}) ` +
        `rotateY(${state.rotY}deg)`;

      if (reduceMotion) return;

      const distanceX = Math.abs(state.x - target.left);
      const distanceY = Math.abs(state.y - target.top);
      const rotationDistance = Math.abs(state.rotY - target.rotY);

      if (distanceX > 0.15 || distanceY > 0.15 || rotationDistance > 0.15) {
        requestRender();
      }
    };

    const handleScrollOrResize = (event) => {
      if (isTicking) return;

      isTicking = true;

      requestAnimationFrame(() => {
        refreshAnchors();

        if (event.type === "resize") {
          state.initialized = false;
        }

        requestRender();
        isTicking = false;
      });
    };

    const resetAndRender = () => {
      refreshAnchors();
      state.initialized = false;
      requestRender();
    };

    const resizeObserver = new ResizeObserver(resetAndRender);

    [
      heroSection,
      servicesSection,
      aboutSection,
      slotHero,
      slotServices,
      slotAbout,
    ].forEach((element) => {
      resizeObserver.observe(element);
    });

    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize);

    window.addEventListener("load", () => {
      resetAndRender();

      setTimeout(resetAndRender, 60);
      setTimeout(resetAndRender, 240);
    });

    resetAndRender();
  })();

  /* ─────────────────────────────────────
     LZ Projects
     ───────────────────────────────────── */

  (() => {
    const stack = document.getElementById("lz-projects-stack");
    const stage = document.getElementById("lz-projects-stage");
    const list = document.getElementById("lz-projects-list");

    if (!stack || !stage || !list) return;

    const cards = Array.from(list.querySelectorAll(".lz-project-card"));
    const originalParent = list;
    const originalOrder = cards.slice();

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let isStaged = false;
    let isTicking = false;

    const canUseStackAnimation = () => {
      return isDesktop() && !prefersReducedMotion;
    };

    const setStackVar = (name, value) => {
      stack.style.setProperty(name, String(value));
    };

    const clearStackVar = (name) => {
      stack.style.removeProperty(name);
    };

    const resetCardStyles = (card) => {
      card.style.transform = "";
      card.style.opacity = "";
      card.style.zIndex = "";
      card.style.pointerEvents = "";
    };

    const restoreCardsToList = () => {
      originalOrder.forEach((card) => {
        originalParent.appendChild(card);
        resetCardStyles(card);
      });

      clearStackVar("--lz-project-stack-steps");
      clearStackVar("--lz-project-stage-card-height");

      isStaged = false;
    };

    const syncStageHeight = () => {
      if (!canUseStackAnimation() || !isStaged || !cards.length) return;

      const lastCard = cards[cards.length - 1];
      const cardHeight = Math.ceil(lastCard.offsetHeight);

      if (cardHeight > 0) {
        setStackVar("--lz-project-stage-card-height", `${cardHeight}px`);
      }
    };

    const stageCards = () => {
      if (!canUseStackAnimation()) {
        if (isStaged) {
          restoreCardsToList();
        }

        return;
      }

      if (isStaged) {
        syncStageHeight();
        return;
      }

      cards.forEach((card) => {
        stage.appendChild(card);
      });

      setStackVar("--lz-project-stack-steps", cards.length);
      isStaged = true;

      syncStageHeight();
    };

    const getProjectAnimationSettings = () => {
      const root = document.documentElement;

      return {
        shrinkScale: getNumberFromCSS(root, "--lz-project-shrink-scale", 0.92),
        shrinkY: getNumberFromCSS(root, "--lz-project-shrink-y", -44),
        nextStartY: getNumberFromCSS(root, "--lz-project-next-start-y", 160),
        peekY: getNumberFromCSS(root, "--lz-project-peek-y", 240),
      };
    };

    const getStackScrollRange = () => {
      const rect = stack.getBoundingClientRect();
      const start = window.scrollY + rect.top;

      const stageStyles = getComputedStyle(stage);
      const stageTop = parseFloat(stageStyles.top) || 0;
      const stageHeight = stage.offsetHeight;

      const end = start + stack.offsetHeight - stageTop - stageHeight;

      return {
        start,
        end: Math.max(start + 1, end),
      };
    };

    const updateCard = ({
      card,
      index,
      currentIndex,
      totalSteps,
      progress,
      settings,
    }) => {
      let opacity = 0;
      let translateY = settings.nextStartY;
      let scale = 1;
      let zIndex = 1;

      if (index < currentIndex) {
        opacity = 1;
        translateY = settings.shrinkY;
        scale = settings.shrinkScale;
        zIndex = 10 + index;
      }

      if (index === currentIndex) {
        opacity = 1;
        translateY = lerp(0, settings.shrinkY, progress);
        scale = lerp(1, settings.shrinkScale, progress);
        zIndex = 200;
      }

      if (index === currentIndex + 1) {
        opacity = 1;
        translateY = lerp(settings.nextStartY, 0, progress);
        scale = 1;
        zIndex = 300;
      }

      if (index === currentIndex + 2) {
        opacity = 1;
        translateY = lerp(
          settings.nextStartY + settings.peekY,
          settings.peekY,
          progress
        );
        scale = 1;
        zIndex = 120;
      }

      if (currentIndex >= totalSteps && index === totalSteps) {
        opacity = 1;
        translateY = 0;
        scale = 1;
        zIndex = 400;
      }

      const isClickable =
        index === currentIndex ||
        index === currentIndex + 1 ||
        (currentIndex >= totalSteps && index === totalSteps);

      card.style.pointerEvents = isClickable ? "auto" : "none";
      card.style.zIndex = String(zIndex);
      card.style.opacity = String(opacity);
      card.style.transform = `translateX(-50%) translateY(${translateY}px) scale(${scale})`;
    };

    const updateProjectsStack = () => {
      stageCards();

      if (!canUseStackAnimation() || !isStaged) return;

      syncStageHeight();

      const settings = getProjectAnimationSettings();
      const { start, end } = getStackScrollRange();

      const totalSteps = cards.length - 1;
      const scrollProgress = clamp((window.scrollY - start) / (end - start), 0, 1);
      const steppedProgress = scrollProgress * totalSteps;

      const currentIndex = Math.floor(steppedProgress);
      const progress = easeInOut(clamp(steppedProgress - currentIndex, 0, 1));

      cards.forEach((card, index) => {
        updateCard({
          card,
          index,
          currentIndex,
          totalSteps,
          progress,
          settings,
        });
      });
    };

    const handleScrollOrResize = () => {
      if (isTicking) return;

      isTicking = true;

      requestAnimationFrame(() => {
        updateProjectsStack();
        isTicking = false;
      });
    };

    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("load", handleScrollOrResize);

    updateProjectsStack();
  })();

  /* ─────────────────────────────────────
     LZ Contact
     ───────────────────────────────────── */

  (() => {
    const form = document.getElementById("lz-contact-form");
    const note = document.getElementById("lz-form-note");

    if (!form) return;

    const setFormNote = (message = "") => {
      if (!note) return;

      note.textContent = message;
    };

    const getTrimmedFormValue = (formData, key) => {
      return String(formData.get(key) || "").trim();
    };

    const handleSubmit = (event) => {
      event.preventDefault();

      const formData = new FormData(form);

      const name = getTrimmedFormValue(formData, "Name");
      const email = getTrimmedFormValue(formData, "Email");
      const service = getTrimmedFormValue(formData, "Service");
      const message = getTrimmedFormValue(formData, "Text Area");

      if (!name || !email || !service || !message) {
        setFormNote("Please fill out all fields.");
        return;
      }

      setFormNote("Thanks! Your message is ready to send.");
      form.reset();
    };

    form.addEventListener("submit", handleSubmit);
  })();
})();