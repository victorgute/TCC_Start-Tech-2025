import { initEnergyCalculator } from './scriptCalculadoras/calcEnergia.js';
import { initWaterCalculator } from './scriptCalculadoras/calcAgua.js';
import { initWasteCalculator } from './scriptCalculadoras/calcResiduo.js';
import { initTICalculator } from './scriptCalculadoras/calcTI.js';
import { initCalculatorTabs } from './scriptCalculadoras/tabs.js';
import { initDashboards } from './scriptDashboard/initDashboards.js';
import { initSaveDashboardButton } from './scriptDashboard/saveDashboard.js';

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();

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

  if (document.querySelector(".tabs-container")) {
    initCalculatorTabs();
    initEnergyCalculator();
    initWaterCalculator();
    initWasteCalculator();
    initTICalculator();
    initDashboards();
    initSaveDashboardButton();
  }
  
  console.log("EcoManager scripts carregados e inicializados!");
});

/**
 * Cuida da lógica da navbar para MÚLTIPLAS PÁGINAS.
*/
function initNavbar() {
  const nav = document.getElementById("navbar");
  if (!nav) return;
  const handleScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 10);
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
  const links = document.querySelectorAll(".nav-link");
  const currentPage = window.location.pathname.split('/').pop();
  links.forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop().split('#')[0];
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('is-active');
    } else {
      link.classList.remove('is-active');
    }
  });
}

/**
 * Funções de Animação da Home Page
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
