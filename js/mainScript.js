// Home Page
import { initSwiper } from './scriptHome/swiperInit.js';
import { initStatCounters } from './scriptHome/statCounters.js';
import { initFeaturesAnimation } from './scriptHome/featuresAnimation.js';
import { initIndicatorsAnimation } from './scriptHome/indicatorsAnimation.js';

// Calculators e Dashboards
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