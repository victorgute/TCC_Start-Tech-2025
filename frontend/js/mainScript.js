// Home Page
import { initSwiper } from './scriptHome/swiper.js';
import { initStatCounters } from './scriptHome/statCounters.js';
import { initFeaturesAnimation } from './scriptHome/featuresAnimation.js';
import { initIndicatorsAnimation } from './scriptHome/indicatorsAnimation.js';

// Calculadoras
import { initEnergyCalculator } from './scriptCalculadoras/calcEnergia.js';
import { initWaterCalculator } from './scriptCalculadoras/calcAgua.js';
import { initWasteCalculator } from './scriptCalculadoras/calcResiduo.js';
import { initTICalculator } from './scriptCalculadoras/calcTI.js';
import { initCalculatorTabs } from './scriptCalculadoras/tabs.js';
// A LINHA QUE INICIAVA OS DASHBOARDS FOI REMOVIDA DAQUI

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();

  // Lógica da Página Principal (Home)
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

  // Lógica da Página de Ferramentas (APENAS CALCULADORAS)
  if (document.querySelector(".tabs-container")) {
    initCalculatorTabs();
    initEnergyCalculator();
    initWaterCalculator();
    initWasteCalculator();
    initTICalculator();
    // A CHAMADA A initDashboards() FOI REMOVIDA DAQUI
  }
  
  console.log("EcoManager scripts VISUAIS carregados e inicializados!");
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

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('navLinks');
  const navOverlay = document.getElementById('nav-overlay');
  const navLinkItems = document.querySelectorAll('.nav-link');

  // Função para fechar o menu ao rolar a página
  const closeMenuOnScroll = () => {
    // Verifica se o menu está ativo antes de tentar fechá-lo
    if (navLinks.classList.contains('active')) {
      hamburger.click(); // Simula um clique no botão para fechar o menu e o overlay
    }
  };

  if (hamburger && navLinks) {
    const toggleMenu = () => {
      navLinks.classList.toggle('active');
      navOverlay?.classList.toggle('active');

      // Troca o ícone para 'X' quando o menu está ativo
      const icon = hamburger.querySelector('i');
      if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
        hamburger.setAttribute('aria-label', 'Fechar menu');
        window.addEventListener('scroll', closeMenuOnScroll, { once: true });
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        hamburger.setAttribute('aria-label', 'Abrir menu');
      }
    };

    hamburger.addEventListener('click', toggleMenu);
    // Fecha o menu se clicar no overlay
    navOverlay?.addEventListener('click', toggleMenu);
  }

  // Fecha o menu ao clicar em um link
  navLinkItems.forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('active')) {
        // Reutiliza a função de toggle para fechar tudo
        hamburger.click();
      }
    });
  });

  // Lógica para o scroll da navbar (já existente, mantida para contexto)
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('is-scrolled');
      } else {
        navbar.classList.remove('is-scrolled');
      }
    });
  }
});