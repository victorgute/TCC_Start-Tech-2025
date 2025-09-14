import { charts } from './charts.js'; // Importa a instância dos gráficos de um ficheiro central

/**
 * Função para ATUALIZAR os dashboards com novos dados do back-end.
 * @param {Array<Object>} allData - A lista de todos os registos do utilizador.
 */
export function updateDashboards(allData) {
    if (!allData) {
        console.warn("Nenhum dado recebido para atualizar os dashboards.");
        return;
    }

    // --- Lógica para o Gráfico de Energia (Polar Area por Equipamento) ---
    if (charts.energy) {
        const energyData = allData.filter(d => d.calculator_type === 'energia');
        const consumptionByEquipment = energyData.reduce((acc, item) => {
            const equipment = item.data.Equipamento || 'Não especificado';
            // Calcula o consumo com base nos dados guardados
            const consumption = (item.data.Potencia * item.data.Quantidade * item.data.HorasNoDia * item.data.DiaNoMes) / 1000;
            acc[equipment] = (acc[equipment] || 0) + consumption;
            return acc;
        }, {});

        charts.energy.data.labels = Object.keys(consumptionByEquipment);
        charts.energy.data.datasets[0].data = Object.values(consumptionByEquipment);
        charts.energy.update();
    }

    // --- Lógica para o Gráfico de Água (Barras por Mês) ---
    if (charts.water) {
        const waterData = allData.filter(d => d.calculator_type === 'agua');
        // Prepara arrays para cada um dos 4 datasets do gráfico
        const monthlyTotalConsumption = Array(12).fill(0);
        const monthlyRealConsumption = Array(12).fill(0);
        const monthlyCost = Array(12).fill(0);
        const monthlySavings = Array(12).fill(0);
        
        waterData.forEach(item => {
            const monthIndex = parseInt(item.month) - 1; // Ajusta para índice 0-11
            if (monthIndex >= 0 && monthIndex < 12) {
                const total = item.data.ConsumoMensalM3 || 0;
                const reused = item.data.ReutilizacaoDeAguaM3 || 0;
                const tariff = item.data.Tarifa || 0;

                monthlyTotalConsumption[monthIndex] += total;
                monthlyRealConsumption[monthIndex] += (total - reused);
                monthlyCost[monthIndex] += (total * tariff);
                monthlySavings[monthIndex] += (reused * tariff);
            }
        });

        // Atualiza os 4 datasets do gráfico de água
        charts.water.data.datasets[0].data = monthlyRealConsumption;
        charts.water.data.datasets[1].data = monthlyTotalConsumption;
        charts.water.data.datasets[2].data = monthlyCost;
        charts.water.data.datasets[3].data = monthlySavings;
        charts.water.update();
    }

    // --- Lógica para o Gráfico de Resíduos (Doughnut) ---
    if (charts.waste) {
        const wasteData = allData.filter(d => d.calculator_type === 'residuos');
        const totalReciclavel = wasteData.reduce((sum, item) => sum + (item.data.ResiduoReciclavel || 0), 0);
        const totalOrganico = wasteData.reduce((sum, item) => sum + (item.data.ResiduoOrganico || 0), 0);
        const totalRejeito = wasteData.reduce((sum, item) => sum + (item.data.ResiduoRejeito || 0), 0);
        
        charts.waste.data.datasets[0].data = [totalReciclavel, totalOrganico, totalRejeito];
        charts.waste.update();
    }

    // --- Lógica para o Gráfico de TI (Barras Horizontais) ---
    if (charts.ti) {
        const tiData = allData.filter(d => d.calculator_type === 'ti');
        const equipmentData = tiData.reduce((acc, item) => {
            const equipmentName = item.data.nomeEquipamento || 'Equipamento';
            if (!acc[equipmentName]) {
                acc[equipmentName] = { reused: 0, discarded: 0 };
            }
            acc[equipmentName].reused += item.data.EquipamentosReaproveitados || 0;
            acc[equipmentName].discarded += item.data.EquipamentosDescartados || 0;
            return acc;
        }, {});

        // Transforma os dados agrupados em datasets para o Chart.js
        charts.ti.data.datasets = Object.entries(equipmentData).map(([name, data]) => {
            const r = Math.floor(Math.random() * 200);
            const g = Math.floor(Math.random() * 200);
            const b = Math.floor(Math.random() * 200);
            return {
                label: name,
                data: [data.reused, data.discarded],
                backgroundColor: `rgba(${r}, ${g}, ${b}, 0.5)`,
                borderColor: `rgba(${r}, ${g}, ${b}, 1)`,
                borderWidth: 1
            };
        });
        charts.ti.update();
    }
}

/**
 * Função para INICIAR os dashboards. Usa a configuração AVANÇADA.
 */
export function initDashboards() {
    if (Object.keys(charts).length > 0) return;

    const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const energyCtx = document.getElementById('energyChart')?.getContext('2d');
    if (energyCtx) {
        charts.energy = new Chart(energyCtx, {
            type: 'polarArea',
            data: {
                labels: [],
                datasets: [{ label: 'Consumo (kWh)', data: [], backgroundColor: ['#005F7380', '#7F1D1D80', '#065f4680', '#ef444480', '#8b5cf680'] }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: '' } },
                scales: { r: { pointLabels: { display: true, centerPointLabels: true, font: { size: 14 } } } },
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
                  { label: 'Consumo real (m³)', data: Array(12).fill(0), backgroundColor: '#2980b9' },
                  { label: 'Consumo total (m³)', data: Array(12).fill(0), backgroundColor: '#3498db' },
                  { label: 'Custo total (R$)', data: Array(12).fill(0), backgroundColor: '#e67e22', borderColor: '#e67e22', type: 'line', order: -1, tension: 0.4, hidden: true },
                  { label: 'Valor economizado (R$)', data: Array(12).fill(0), backgroundColor: '#2ecc71', borderColor: '#2ecc71', type: 'line', order: -1, tension: 0.4, hidden: true }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' } }
        });
    }

    const wasteCtx = document.getElementById('wasteChart')?.getContext('2d');
    if (wasteCtx) {
        charts.waste = new Chart(wasteCtx, {
            type: 'doughnut',
            data: {
                labels: ['Reciclável', 'Orgânico', 'Rejeito'],
                datasets: [{ label: 'Resíduos (kg)', data: [0, 0, 0], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'] }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: '', font: { size: 16 } } } }
        });
    }

    const tiCtx = document.getElementById('tiChart')?.getContext('2d');
    if (tiCtx) {
        charts.ti = new Chart(tiCtx, {
            type: 'bar',
            data: {
                labels: ['Reaproveitados', 'Descartados'],
                datasets: [{ label: 'Nenhum equipamento selecionado', data: [0, 0], backgroundColor: 'rgba(200, 200, 200, 0.5)', borderWidth: 1 }]
            },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                elements: { bar: { borderRadius: { topRight: 10, bottomRight: 10 } } },
                layout: { padding: { left: 10, right: 10 } },
                plugins: { legend: { position: 'top', labels: { font: { size: 11 } } }, title: { display: true, text: '', font: { size: 16 } } }
            }
        });
    }
}


// Adicione esta função ao final de initDashboards.js

export function clearCharts() {
    if (charts.energy) {
        charts.energy.data.labels = [];
        charts.energy.data.datasets[0].data = [];
        charts.energy.update();
    }
    if (charts.water) {
        charts.water.data.datasets.forEach(dataset => {
            dataset.data = Array(12).fill(0);
        });
        charts.water.update();
    }
    if (charts.waste) {
        charts.waste.data.datasets[0].data = [0, 0, 0];
        charts.waste.update();
    }
    if (charts.ti) {
        charts.ti.data.datasets = [{
            label: 'Nenhum equipamento selecionado',
            data: [0, 0],
            backgroundColor: 'rgba(200, 200, 200, 0.5)',
            borderWidth: 1
        }];
        charts.ti.update();
    }
    console.log("Gráficos limpos.");
}