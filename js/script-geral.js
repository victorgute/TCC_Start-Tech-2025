document.addEventListener("DOMContentLoaded", () => {
  // Funções que rodam em todas as páginas
  initNavbar();
  
  // Funções que só rodam na Home Page
  if (document.querySelector(".mySwiper")) initSwiper();
  if (document.querySelector(".stat-item")) initStatCounters();
  if (document.querySelector(".features .card")) initFeaturesAnimation();
  if (document.querySelector(".indicators .card")) initIndicatorsAnimation();
  
  // Funções que só rodam na página de Ferramentas
  if (document.querySelector(".tabs-container")) {
    initCalculatorTabs();
    initEnergyCalculator();
    initWaterCalculator();
    initWasteCalculator();
    initTICalculator();
    initSaveDashboardButton(); // <-- Adicionada a função do botão
  }
  if (document.getElementById("energyChart")) {
    initDashboards();
  }

  console.log("EcoManager scripts carregados e inicializados!");
});

// Variável para armazenar as instâncias dos gráficos
let charts = {};

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
 * Funções das Calculadoras
 */
function initCalculatorTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");
  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      const targetTab = button.dataset.tab;
      tabButtons.forEach(btn => btn.classList.remove("active"));
      tabContents.forEach(content => content.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(targetTab).classList.add("active");
    });
  });
}

function initEnergyCalculator() {
    const form = document.querySelector('#energia .calculator-form');
    if (!form) return;
    const inputs = { potencia: form.querySelector('#potencia'), quantidade: form.querySelector('#quantidade'), horas: form.querySelector('#horas'), dias: form.querySelector('#dias'), tarifa: form.querySelector('#tarifa') };
    const results = { consumo: form.querySelector('.results-box .result-item:nth-of-type(1) strong'), custo: form.querySelector('.results-box .result-item:nth-of-type(2) strong'), emissoes: form.querySelector('.results-box .result-item:nth-of-type(3) strong') };
    const FATOR_EMISSAO_BR = 0.0716;
    function calculate() {
        const potencia = parseFloat(inputs.potencia.value) || 0;
        const quantidade = parseInt(inputs.quantidade.value) || 0;
        const horas = parseFloat(inputs.horas.value) || 0;
        const dias = parseInt(inputs.dias.value) || 0;
        const tarifa = parseFloat(inputs.tarifa.value.replace(',', '.')) || 0;
        const consumoMensal = (potencia * quantidade * horas * dias) / 1000;
        const custoEstimado = consumoMensal * tarifa;
        const emissoesCO2 = consumoMensal * FATOR_EMISSAO_BR;
        results.consumo.textContent = `${consumoMensal.toFixed(2).replace('.', ',')} kWh`;
        results.custo.textContent = `R$ ${custoEstimado.toFixed(2).replace('.', ',')}`;
        results.emissoes.textContent = `${emissoesCO2.toFixed(3).replace('.', ',')} kg`;
    }
    Object.values(inputs).forEach(input => input.addEventListener('input', calculate));
    calculate();
}

function initWaterCalculator() {
    const form = document.querySelector('#agua .calculator-form');
    if (!form) return;
    const inputs = { consumo: form.querySelector('#agua-consumo'), tarifa: form.querySelector('#agua-tarifa') };
    const results = { custo: form.querySelector('.results-box .result-item:nth-of-type(1) strong'), pegada: form.querySelector('.results-box .result-item:nth-of-type(2) strong') };
    function calculate() {
        const consumoM3 = parseFloat(inputs.consumo.value) || 0;
        const tarifa = parseFloat(inputs.tarifa.value.replace(',', '.')) || 0;
        const custoEstimado = consumoM3 * tarifa;
        const pegadaLitros = consumoM3 * 1000;
        results.custo.textContent = `R$ ${custoEstimado.toFixed(2).replace('.', ',')}`;
        results.pegada.textContent = `${pegadaLitros.toLocaleString('pt-BR')} L`;
    }
    Object.values(inputs).forEach(input => input.addEventListener('input', calculate));
    calculate();
}

function initWasteCalculator() {
    const form = document.querySelector('#residuos .calculator-form');
    if (!form) return;
    const inputs = { reciclavel: form.querySelector('#residuos-reciclavel'), organico: form.querySelector('#residuos-organico'), rejeito: form.querySelector('#residuos-rejeito') };
    const results = { total: form.querySelector('.results-box .result-item:nth-of-type(1) strong'), taxa: form.querySelector('.results-box .result-item:nth-of-type(2) strong') };
    function calculate() {
        const reciclavel = parseFloat(inputs.reciclavel.value) || 0;
        const organico = parseFloat(inputs.organico.value) || 0;
        const rejeito = parseFloat(inputs.rejeito.value) || 0;
        const total = reciclavel + organico + rejeito;
        const taxa = total > 0 ? (reciclavel / total) * 100 : 0;
        results.total.textContent = `${total.toFixed(2).replace('.', ',')} kg`;
        results.taxa.textContent = `${taxa.toFixed(1).replace('.', ',')} %`;
    }
    Object.values(inputs).forEach(input => input.addEventListener('input', calculate));
    calculate();
}

function initTICalculator() {
    const form = document.querySelector('#ti .calculator-form');
    if (!form) return;
    const inputs = { descartados: form.querySelector('#ti-descartados'), reaproveitados: form.querySelector('#ti-reaproveitados') };
    const results = { taxa: form.querySelector('.results-box .result-item:nth-of-type(1) strong') };
    function calculate() {
        const descartados = parseInt(inputs.descartados.value) || 0;
        const reaproveitados = parseInt(inputs.reaproveitados.value) || 0;
        const taxa = descartados > 0 ? (reaproveitados / descartados) * 100 : 0;
        results.taxa.textContent = `${taxa.toFixed(1).replace('.', ',')} %`;
    }
    Object.values(inputs).forEach(input => input.addEventListener('input', calculate));
    calculate();
}

/**
 * Adiciona o evento de clique ao botão "Salvar Dashboard"
 */
function initSaveDashboardButton() {
    const saveBtn = document.querySelector('.save-dashboard-btn');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', () => {
        // 1. Ler os dados das calculadoras
        const energyConsumption = parseFloat(document.querySelector('#energia .results-box strong').textContent.replace(',', '.')) || 0;
        const waterConsumption = parseFloat(document.querySelector('#agua-consumo').value) || 0;
        const wasteRecyclingRate = parseFloat(document.querySelector('#residuos .results-box strong:last-of-type').textContent.replace(',', '.')) || 0;
        const tiReused = parseInt(document.querySelector('#ti-reaproveitados').value) || 0;
        const tiDiscarded = parseInt(document.querySelector('#ti-descartados').value) || 0;
        
        // 2. Atualizar os cartões de resumo
        document.querySelector('.summary-cards .summary-card:nth-child(1) strong').textContent = `${energyConsumption.toFixed(0)} kWh`;
        document.querySelector('.summary-cards .summary-card:nth-child(2) strong').textContent = `${waterConsumption.toFixed(0)} m³`;
        document.querySelector('.summary-cards .summary-card:nth-child(3) strong').textContent = `${wasteRecyclingRate.toFixed(0)}%`;
        document.querySelector('.summary-cards .summary-card:nth-child(4) strong').textContent = tiReused;

        // 3. Atualizar os gráficos
        if (charts.energy) {
            charts.energy.data.datasets[0].data.push(energyConsumption);
            charts.energy.data.datasets[0].data.shift(); // Remove o dado mais antigo para manter 6 meses
            charts.energy.update();
        }
        if (charts.water) {
            charts.water.data.datasets[0].data.push(waterConsumption);
            charts.water.data.datasets[0].data.shift();
            charts.water.update();
        }
        if (charts.waste) {
            const reciclavel = parseFloat(document.querySelector('#residuos-reciclavel').value) || 0;
            const organico = parseFloat(document.querySelector('#residuos-organico').value) || 0;
            const rejeito = parseFloat(document.querySelector('#residuos-rejeito').value) || 0;
            charts.waste.data.datasets[0].data = [reciclavel, organico, rejeito];
            charts.waste.update();
        }
        if (charts.ti) {
            charts.ti.data.datasets[0].data = [tiDiscarded, tiReused];
            charts.ti.update();
        }

        // 4. Rolar para os dashboards
        document.getElementById('dashboards').scrollIntoView({ behavior: 'smooth' });
    });
}

/**
 * Inicializa todos os gráficos do dashboard com valores zerados.
 */
function initDashboards() {
    const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    
    const energyCtx = document.getElementById('energyChart').getContext('2d');
    charts.energy = new Chart(energyCtx, {
        type: 'line',
        data: { labels: labels, datasets: [{ label: 'Consumo (kWh)', data: [0, 0, 0, 0, 0, 0], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const waterCtx = document.getElementById('waterChart').getContext('2d');
    charts.water = new Chart(waterCtx, {
        type: 'bar',
        data: { labels: labels, datasets: [{ label: 'Uso (m³)', data: [0, 0, 0, 0, 0, 0], backgroundColor: '#3b82f6' }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const wasteCtx = document.getElementById('wasteChart').getContext('2d');
    charts.waste = new Chart(wasteCtx, {
        type: 'doughnut',
        data: { labels: ['Reciclável', 'Orgânico', 'Rejeito'], datasets: [{ label: 'Resíduos (kg)', data: [0, 0, 0], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const tiCtx = document.getElementById('tiChart').getContext('2d');
    charts.ti = new Chart(tiCtx, {
        type: 'bar',
        data: { labels: ['Descartados', 'Reaproveitados'], datasets: [{ label: 'Equipamentos', data: [0, 0], backgroundColor: ['#6366f1', '#10b981'] }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
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
