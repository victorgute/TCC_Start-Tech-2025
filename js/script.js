document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initSwiper();
  initStatCounters();
  initFeaturesAnimation(); // <-- Adicionada a nova função de animação

  console.log("EcoManager scripts carregados e inicializados!");
});

/**
 * Cuida de toda a lógica da barra de navegação (navbar).
 */
function initNavbar() {
  const nav = document.getElementById("navbar");
  const links = document.querySelectorAll(".nav-link");
  if (!nav) return;

  const handleScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 10);
  const setActiveByHash = () => {
    const currentHash = window.location.hash || "#inicio";
    links.forEach(link => {
      link.classList.toggle("is-active", link.getAttribute("href") === currentHash);
    });
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("hashchange", setActiveByHash);
  handleScroll();
  setActiveByHash();
}

/**
 * Inicializa o carrossel de imagens (Swiper).
 */
function initSwiper() {
  if (typeof Swiper !== 'undefined') {
    new Swiper(".mySwiper", {
      loop: true,
      autoplay: { delay: 4000, disableOnInteraction: false },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    });
  } else {
    console.error("Biblioteca Swiper não encontrada.");
  }
}

/**
 * Inicializa os contadores de estatísticas na seção de Impacto.
 */
function initStatCounters() {
  const stats = document.querySelectorAll(".stat-item");
  if (stats.length === 0) return;

  const animateCount = (element) => {
    const target = +element.dataset.target;
    const suffix = element.dataset.suffix || "";
    const duration = 2000;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      element.textContent = Math.floor(progress * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else element.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        const strongElement = entry.target.querySelector("strong[data-target]");
        if (strongElement && !strongElement.dataset.counted) {
          strongElement.dataset.counted = "true";
          animateCount(strongElement);
        }
        observerInstance.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  stats.forEach(stat => observer.observe(stat));
}

/**
 * NOVO: Anima os cards da seção "Como Funciona" quando eles entram na tela.
 */
function initFeaturesAnimation() {
  const featureCards = document.querySelectorAll(".features .card");
  if (featureCards.length === 0) return;

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Adiciona a classe que dispara a transição do CSS
        entry.target.classList.add("is-visible");
        // Para de observar o card para não animar de novo
        observerInstance.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.2 // Dispara quando 20% do card estiver visível
  });

  featureCards.forEach(card => {
    observer.observe(card);
  });
}
