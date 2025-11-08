document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const darkModeToggle = document.getElementById('dark-mode-toggle');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on resize to desktop to avoid stale state
    const mq = window.matchMedia('(min-width: 700px)');
    const syncMenuState = () => {
      if (mq.matches) {
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    };
    mq.addEventListener ? mq.addEventListener('change', syncMenuState) : mq.addListener(syncMenuState);
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', () => {
      document.documentElement.classList.toggle('dark-mode', darkModeToggle.checked);
    });
  }

  // GSAP Scroll Animations
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray("section").forEach(section => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  } else {
    console.warn("GSAP or ScrollTrigger not loaded");
  }
});
