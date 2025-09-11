import { charts } from './charts.js'; // Importa a instância dos gráficos de um ficheiro central

/**
 * Função para ATUALIZAR os dashboards com novos dados.
 * Esta função recebe os dados do back-end e preenche os gráficos existentes.
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
        const monthlyConsumption = Array(12).fill(0);
        
        waterData.forEach(item => {
            const monthIndex = parseInt(item.month) - 1; // Ajusta para índice 0-11
            if (monthIndex >= 0 && monthIndex < 12) {
                monthlyConsumption[monthIndex] += (item.data.ConsumoMensalM3 || 0);
            }
        });

        charts.water.data.datasets[0].data = monthlyConsumption;
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
        const totalReaproveitados = tiData.reduce((sum, item) => sum + (item.data.EquipamentosReaproveitados || 0), 0);
        const totalDescartados = tiData.reduce((sum, item) => sum + (item.data.EquipamentosDescartados || 0), 0);

        // O gráfico de TI espera um dataset por categoria
        charts.ti.data.datasets = [{
            label: 'Contagem de Equipamentos',
            data: [totalReaproveitados, totalDescartados],
            backgroundColor: ['#10b981', '#ef4444'],
        }];
        charts.ti.update();
    }
}


/**
 * Função para INICIAR os dashboards.
 * Esta função apenas CRIA os gráficos vazios uma única vez.
 */
export function initDashboards() {
    // Verifica se os gráficos já foram inicializados para evitar recriação
    if (Object.keys(charts).length > 0) {
        return;
    }

    const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const energyCtx = document.getElementById('energyChart')?.getContext('2d');
    if (energyCtx) {
        charts.energy = new Chart(energyCtx, {
            type: 'polarArea',
            data: { labels: [], datasets: [{ data: [], backgroundColor: ['#005F7380', '#7F1D1D80', '#065f4680', '#ef444480', '#8b5cf680'] }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    const waterCtx = document.getElementById('waterChart')?.getContext('2d');
    if (waterCtx) {
        charts.water = new Chart(waterCtx, {
            type: 'bar',
            data: { labels: labels, datasets: [{ label: 'Consumo (m³)', data: Array(12).fill(0), backgroundColor: '#3498db' }] },
            options: { responsive: true, maintainAspectRatio: false }
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
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    const tiCtx = document.getElementById('tiChart')?.getContext('2d');
    if (tiCtx) {
        charts.ti = new Chart(tiCtx, {
            type: 'bar',
            data: { labels: ['Reaproveitados', 'Descartados'], datasets: [] },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
        });
    }
}

