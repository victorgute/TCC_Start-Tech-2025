document.addEventListener("DOMContentLoaded", () => {
  // Funções que rodam em todas as páginas protegidas
  initNavbar();
  
  // Funções específicas da Home Page
  if (document.querySelector(".mySwiper")) {
    initSwiper();
    initStatCounters();
    initFeaturesAnimation();
    initIndicatorsAnimation();
  }
  
  // Funções específicas da página de Ferramentas
  if (document.querySelector(".tabs-container")) {
    initCalculatorTabs();
    initEnergyCalculator();
    initWaterCalculator();
    initWasteCalculator();
    initTICalculator();
    initSaveDashboardButton();
    initDashboards();
  }
});

let charts = {};

function initNavbar() {
  const nav = document.getElementById("navbar");
  const logoutBtn = document.getElementById("logout-btn");
  if (!nav) return;

  const handleScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 10);
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  const links = nav.querySelectorAll(".nav-link");
  const currentPage = window.location.pathname.split('/').pop();
  links.forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop();
    link.classList.toggle('is-active', linkPage === currentPage);
  });
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      firebase.auth().signOut();
    });
  }
}

// HOME: Carrossel
function initSwiper() {
  if (typeof Swiper !== 'undefined') {
    new Swiper(".mySwiper", {
      loop: true,
      autoplay: { delay: 4000, disableOnInteraction: false },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    });
  }
}

// HOME: Animações de Scroll
function createScrollObserver(selector, options = { threshold: 0.2 }) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observerInstance.unobserve(entry.target);

                if (selector === ".stat-item") {
                    const strong = entry.target.querySelector("strong[data-target]");
                    if (strong && !strong.dataset.counted) {
                        animateCount(strong);
                        strong.dataset.counted = "true";
                    }
                }
            }
        });
    }, options);

    elements.forEach(el => observer.observe(el));
}

function initIndicatorsAnimation() { createScrollObserver(".indicators .card"); }
function initFeaturesAnimation() { createScrollObserver(".features .card"); }
function initStatCounters() { createScrollObserver(".stat-item"); }

function animateCount(element) {
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
}


// FERRAMENTAS: Abas da Calculadora
function initCalculatorTabs() {
  const tabsContainer = document.querySelector(".tabs-container");
  if (!tabsContainer) return;
  tabsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("tab-button")) {
      const targetTab = e.target.dataset.tab;
      tabsContainer.querySelector(".tab-button.active").classList.remove("active");
      tabsContainer.querySelector(".tab-content.active").classList.remove("active");
      e.target.classList.add("active");
      document.getElementById(targetTab).classList.add("active");
    }
  });
}

// FERRAMENTAS: Lógica das Calculadoras
function initEnergyCalculator() {
    const form = document.getElementById('energia');
    if (!form) return;
    const inputs = ['potencia', 'quantidade', 'horas', 'dias', 'tarifa'];
    const results = { consumo: 'res-energia-consumo', custo: 'res-energia-custo', emissoes: 'res-energia-emissoes' };
    const FATOR_EMISSAO_BR = 0.0716;
    
    function calculate() {
        const vals = inputs.reduce((acc, id) => ({ ...acc, [id]: parseFloat(document.getElementById(id).value.replace(',', '.')) || 0 }), {});
        const consumo = (vals.potencia * vals.quantidade * vals.horas * vals.dias) / 1000;
        document.getElementById(results.consumo).textContent = `${consumo.toFixed(2)} kWh`;
        document.getElementById(results.custo).textContent = `R$ ${(consumo * vals.tarifa).toFixed(2)}`;
        document.getElementById(results.emissoes).textContent = `${(consumo * FATOR_EMISSAO_BR).toFixed(3)} kg`;
    }
    inputs.forEach(id => document.getElementById(id).addEventListener('input', calculate));
    calculate();
}

function initWaterCalculator() {
    const form = document.getElementById('agua');
    if (!form) return;
    function calculate() {
        const consumo = parseFloat(document.getElementById('agua-consumo').value) || 0;
        const tarifa = parseFloat(document.getElementById('agua-tarifa').value.replace(',', '.')) || 0;
        document.getElementById('res-agua-custo').textContent = `R$ ${(consumo * tarifa).toFixed(2)}`;
        document.getElementById('res-agua-pegada').textContent = `${(consumo * 1000).toLocaleString('pt-BR')} L`;
    }
    ['agua-consumo', 'agua-tarifa'].forEach(id => document.getElementById(id).addEventListener('input', calculate));
    calculate();
}

function initWasteCalculator() {
    const form = document.getElementById('residuos');
    if (!form) return;
    function calculate() {
        const reciclavel = parseFloat(document.getElementById('residuos-reciclavel').value) || 0;
        const organico = parseFloat(document.getElementById('residuos-organico').value) || 0;
        const rejeito = parseFloat(document.getElementById('residuos-rejeito').value) || 0;
        const total = reciclavel + organico + rejeito;
        document.getElementById('res-residuos-total').textContent = `${total.toFixed(2)} kg`;
        document.getElementById('res-residuos-taxa').textContent = `${(total > 0 ? (reciclavel / total) * 100 : 0).toFixed(1)} %`;
    }
    ['residuos-reciclavel', 'residuos-organico', 'residuos-rejeito'].forEach(id => document.getElementById(id).addEventListener('input', calculate));
    calculate();
}

function initTICalculator() {
    const form = document.getElementById('ti');
    if (!form) return;
    function calculate() {
        const descartados = parseInt(document.getElementById('ti-descartados').value) || 0;
        const reaproveitados = parseInt(document.getElementById('ti-reaproveitados').value) || 0;
        document.getElementById('res-ti-taxa').textContent = `${(descartados > 0 ? (reaproveitados / descartados) * 100 : 0).toFixed(1)} %`;
    }
    ['ti-descartados', 'ti-reaproveitados'].forEach(id => document.getElementById(id).addEventListener('input', calculate));
    calculate();
}


// FERRAMENTAS: Dashboards e Gráficos
function initDashboards() {
    const commonOptions = { responsive: true, maintainAspectRatio: false };
    const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    charts.energy = new Chart('energyChart', { type: 'line', data: { labels, datasets: [{ label: 'Consumo (kWh)', data: Array(12).fill(0), borderColor: '#10b981', fill: true, tension: 0.4 }] }, options: commonOptions });
    charts.water = new Chart('waterChart', { type: 'bar', data: { labels, datasets: [{ label: 'Uso (m³)', data: Array(12).fill(0), backgroundColor: '#3b82f6' }] }, options: commonOptions });
    charts.waste = new Chart('wasteChart', { type: 'doughnut', data: { labels: ['Reciclável', 'Orgânico', 'Rejeito'], datasets: [{ data: [0, 0, 0], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'] }] }, options: commonOptions });
    charts.ti = new Chart('tiChart', { type: 'bar', data: { labels: ['Descartados', 'Reaproveitados'], datasets: [{ data: [0, 0], backgroundColor: ['#ef4444', '#10b981'] }] }, options: { ...commonOptions, indexAxis: 'y' } });
}

function initSaveDashboardButton() {
    const saveBtn = document.getElementById('save-dashboard-btn');
    const monthSelect = document.getElementById('month-select');
    const yearInput = document.getElementById('year-input');
    if (!saveBtn) return;

    const today = new Date();
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    months.forEach((month, i) => monthSelect.add(new Option(month, i)));
    monthSelect.value = today.getMonth();
    yearInput.value = today.getFullYear();

    saveBtn.addEventListener('click', () => {
        const monthIndex = parseInt(monthSelect.value);

        const energyConsumption = parseFloat(document.getElementById('res-energia-consumo').textContent) || 0;
        const waterConsumption = parseFloat(document.getElementById('agua-consumo').value) || 0;
        const wasteRecyclingRate = parseFloat(document.getElementById('res-residuos-taxa').textContent) || 0;
        const tiReuseRate = parseFloat(document.getElementById('res-ti-taxa').textContent) || 0;

        document.getElementById('summary-energia').textContent = `${energyConsumption.toFixed(0)} kWh`;
        document.getElementById('summary-agua').textContent = `${waterConsumption.toFixed(0)} m³`;
        document.getElementById('summary-residuos').textContent = `${wasteRecyclingRate.toFixed(0)}%`;
        document.getElementById('summary-ti').textContent = `${tiReuseRate.toFixed(0)}%`;

        charts.energy.data.datasets[0].data[monthIndex] = energyConsumption;
        charts.energy.update();
        charts.water.data.datasets[0].data[monthIndex] = waterConsumption;
        charts.water.update();
        
        const reciclavel = parseFloat(document.getElementById('residuos-reciclavel').value) || 0;
        const organico = parseFloat(document.getElementById('residuos-organico').value) || 0;
        const rejeito = parseFloat(document.getElementById('residuos-rejeito').value) || 0;
        charts.waste.data.datasets[0].data = [reciclavel, organico, rejeito];
        charts.waste.update();

        const descartados = parseInt(document.getElementById('ti-descartados').value) || 0;
        const reaproveitados = parseInt(document.getElementById('ti-reaproveitados').value) || 0;
        charts.ti.data.datasets[0].data = [descartados, reaproveitados];
        charts.ti.update();

        document.getElementById('dashboards').scrollIntoView({ behavior: 'smooth' });
    });
}
