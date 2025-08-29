export let charts = {};

export function initDashboards() {
  const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const energyCtx = document.getElementById('energyChart')?.getContext('2d');
  if (energyCtx) {
    charts.energy = new Chart(energyCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Consumo (kWh)',
          data: Array(12).fill(0),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  const waterCtx = document.getElementById('waterChart')?.getContext('2d');
  if (waterCtx) {
    charts.water = new Chart(waterCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Projeção de Economia',
            data: [Array(12).fill(0)],
            backgroundColor: '#2ecc71',
            stack: 'stack1'
          },
          {
            label: 'Gasto Líquido Estimado',
            data: [Array(12).fill(0)],
            backgroundColor: '#cc2e2e',
            stack: 'stack1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  const wasteCtx = document.getElementById('wasteChart')?.getContext('2d');
  if (wasteCtx) {
    charts.waste = new Chart(wasteCtx, {
      type: 'doughnut',
      data: {
        labels: ['Reciclável', 'Orgânico', 'Rejeito'],
        datasets: [{
          label: 'Resíduos (kg)',
          data: [0, 0, 0],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  const tiCtx = document.getElementById('tiChart')?.getContext('2d');
  if (tiCtx) {
    charts.ti = new Chart(tiCtx, {
      type: 'bar',
      data: {
        labels: ['Descartados', 'Reaproveitados'],
        datasets: [{
          label: 'Equipamentos',
          data: [0, 0],
          backgroundColor: ['#6366f1', '#10b981']
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}