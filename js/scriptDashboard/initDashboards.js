export let charts = {};

export function initDashboards() {
  const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const energyCtx = document.getElementById('energyChart')?.getContext('2d');
  if (energyCtx) {
    charts.energy = new Chart(energyCtx, {
      type: 'polarArea',
      data: {
        labels: [],
        datasets: [{
          label: 'Consumo (kWh)',
          data: [],
          backgroundColor: [
            '#005F7380', // AA e AAA
            '#7F1D1D80', // AA e AAA
            '#065f4680', // AA e AAA
            'rgba(239, 68, 68, 0.5)',
            'rgba(168, 85, 247, 0.5)',
            'rgba(251, 191, 36, 0.5)',
            'rgba(13, 148, 136, 0.5)',
            'rgba(99, 102, 241, 0.5)',
            'rgba(245, 158, 11, 0.5)',
            'rgba(107, 114, 128, 0.5)',
          ],
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: '',
          }
        },
        scales: {
          r: {
            pointLabels: {
              display: true,
              centerPointLabels: true,
              font: {
                size: 14
              }
            }
          }
        },
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
            label: 'Consumo real de água (m³)',
            data: Array(12).fill(0),
            backgroundColor: '#2980b9',
          },
          {
            label: 'Consumo total de água (m³)',
            data: Array(12).fill(0),
            backgroundColor: '#3498db',
          },
          {
            label: 'Custo total estimado (R$)',
            data: Array(12).fill(0),
            backgroundColor: '#e67e22',
            borderColor: '#e67e22',
            type: 'line',
            order: -1,
            tension: 0.4,
            hidden: true,
          },
          {
            label: 'Valor economizado (R$)',
            data: Array(12).fill(0),
            backgroundColor: '#2ecc71',
            borderColor: '#2ecc71',
            type: 'line',
            order: -1,
            tension: 0.4,
            hidden: true,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
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
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '',
            font: {
              size: 16
            }
          }
        }
      }
    });
  }

  const tiCtx = document.getElementById('tiChart')?.getContext('2d');
  if (tiCtx) {
    charts.ti = new Chart(tiCtx, {
      type: 'bar',
      data: {
        labels: ['Reaproveitados', 'Descartados'],
        datasets: []
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          bar: {
            borderRadius: {
              bottomRight: 10,
              topRight: 10,
            },
          }
        },
        plugins: {
          legend: {
            position: 'right'
          },
          title: {
            display: true,
            text: '',
            font: {
              size: 16
            }
          }
        }
      }
    });
  }
}