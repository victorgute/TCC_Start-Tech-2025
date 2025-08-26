/**
 * Adiciona um listener que executa o código principal quando o DOM (a estrutura da página)
 * estiver completamente carregado.
 */
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initSwiper();
  initStatCounters();

  console.log("EcoManager scripts carregados e inicializados!");
});

/**
 * Cuida de toda a lógica da barra de navegação (navbar).
 */
function initNavbar() {
  const nav = document.getElementById("navbar");
  const links = document.querySelectorAll(".nav-link");

  if (!nav) return;

  const handleScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  const setActiveByHash = () => {
    const currentHash = window.location.hash || "#inicio";
    links.forEach(link => {
      const isActive = link.getAttribute("href") === currentHash;
      link.classList.toggle("is-active", isActive);
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
      autoplay: {
        delay: 4000,
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
  } else {
    console.error("Biblioteca Swiper não encontrada.");
  }
}

/**
 * CORRIGIDO: Inicializa os contadores de estatísticas para a nova estrutura.
 */
function initStatCounters() {
  // *** MUDANÇA AQUI: Seleciona a nova classe .stat-item ***
  const stats = document.querySelectorAll(".stat-item"); 
  if (stats.length === 0) return;

  // Função que anima a contagem do número
  const animateCount = (element) => {
    const target = +element.dataset.target;
    const suffix = element.dataset.suffix || "";
    const duration = 2000;
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentValue = Math.floor(progress * target);
      element.textContent = currentValue + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = target + suffix;
      }
    };
    requestAnimationFrame(step);
  };

  // Observer que dispara a animação
  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Adiciona a classe para o efeito de fade-in do CSS
        entry.target.classList.add("is-visible");

        const strongElement = entry.target.querySelector("strong[data-target]");
        
        if (strongElement && !strongElement.dataset.counted) {
          strongElement.dataset.counted = "true";
          animateCount(strongElement);
        }
        
        observerInstance.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.3
  });

  // Inicia a observação para cada card de estatística
  stats.forEach(stat => {
    observer.observe(stat);
  });
}
