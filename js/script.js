document.addEventListener("DOMContentLoaded", () => {
  // Função da navbar que roda em TODAS as páginas
  initNavbar();
  
  // Funções de animação que só rodam na HOME PAGE
  // O 'if' verifica se o elemento existe antes de chamar a função
  if (document.querySelector(".mySwiper")) {
    initSwiper();
  }
  if (document.querySelector(".stat-item")) {
    initStatCounters();
  }
  if (document.querySelector(".features .card")) {
    initFeaturesAnimation();
  }
  if (document.querySelector(".indicators .card")) {
    initIndicatorsAnimation();
  }

  console.log("EcoManager scripts carregados e inicializados!");
});

/**
 * Cuida da lógica da navbar para MÚLTIPLAS PÁGINAS.
 */
function initNavbar() {
  const nav = document.getElementById("navbar");
  if (!nav) return;

  // Lógica de scroll para adicionar sombra
  const handleScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 10);
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll(); // Executa uma vez para verificar a posição inicial

  // Lógica para marcar link ativo com base no arquivo da página atual
  const links = document.querySelectorAll(".nav-link");
  const currentPage = window.location.pathname.split('/').pop(); // Pega o nome do arquivo (ex: "sobre.html")

  links.forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop().split('#')[0];
    
    // Marca como ativo se o nome do arquivo for o mesmo.
    // A condição extra (currentPage === '' && linkPage === 'index.html') serve para a raiz do site.
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('is-active');
    } else {
      link.classList.remove('is-active');
    }
  });
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
 * Anima os cards da seção "Como Funciona".
 */
function initFeaturesAnimation() {
  const featureCards = document.querySelectorAll(".features .card");
  if (featureCards.length === 0) return;

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observerInstance.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  featureCards.forEach(card => observer.observe(card));
}

/**
 * Anima os cards da seção "Indicadores" quando eles entram na tela.
 */
function initIndicatorsAnimation() {
  const indicatorCards = document.querySelectorAll(".indicators .card");
  if (indicatorCards.length === 0) return;

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observerInstance.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.2
  });

  indicatorCards.forEach(card => {
    observer.observe(card);
  });
}
