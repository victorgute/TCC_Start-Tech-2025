document.addEventListener("DOMContentLoaded", () => {
  console.log("Site carregado!");
});
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("navbar");
  const links = document.querySelectorAll(".nav-link");

  // ativa o link conforme hash
  function setActiveByHash() {
    const current = window.location.hash || "#inicio";
    links.forEach(a => {
      a.classList.toggle("is-active", a.getAttribute("href") === current);
    });
  }

  // clique nos links
  links.forEach(a => {
    a.addEventListener("click", () => {
      // aguarda mudança do hash para sincronizar
      setTimeout(setActiveByHash, 0);
    });
  });

  // ao carregar e ao mudar o hash
  setActiveByHash();
  window.addEventListener("hashchange", setActiveByHash);

  // sombra mais forte ao rolar
  function onScroll() {
    if (window.scrollY > 8) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
});

  const swiper = new Swiper(".mySwiper", {
    loop: true,                // loop infinito
    autoplay: {
      delay: 4000,             // troca a cada 4s
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });


  document.addEventListener("DOMContentLoaded", () => {
  const stats = document.querySelectorAll(".stat");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target); // só anima uma vez
      }
    });
  }, { threshold: 0.3 });

  stats.forEach(stat => observer.observe(stat));
});

document.addEventListener("DOMContentLoaded", () => {
  const stats = document.querySelectorAll(".stat");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const reveal = (el) => {
    el.classList.add("is-visible");
    const strong = el.querySelector("strong[data-target]");
    if (strong && !strong.dataset.counted) {
      strong.dataset.counted = "1";
      animateCount(strong);
    }
  };

  const animateCount = (el) => {
    const target = Number(el.getAttribute("data-target"));
    const duration = 900; // ms
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = String(value);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Se o usuário prefere menos movimento, mostra tudo de cara
  if (prefersReduced) {
    stats.forEach(reveal);
    return;
  }

  // Observer mais tolerante (dispara quando ~15% entra na viewport)
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px", // dispara um pouco antes do centro
    }
  );

  stats.forEach((s) => io.observe(s));

  // Fallback defensivo: força checagem após o primeiro paint
  setTimeout(() => {
    stats.forEach((s) => {
      const r = s.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0) {
        reveal(s);
        io.unobserve(s);
      }
    });
  }, 120);
});
