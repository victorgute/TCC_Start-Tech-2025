import { charts } from './initDashboards.js';

let currentEnergyMonth = null;

export function initSaveDashboardButton() {
    const saveBtn = document.querySelector('.save-dashboard-btn');
    const monthSelect = document.getElementById('month-select');
    const yearInput = document.getElementById('year-input');

    if (!saveBtn || !monthSelect || !yearInput) return;

    // Define o mês e ano atuais como padrão
    const today = new Date();
    monthSelect.value = today.getMonth();
    yearInput.value = today.getFullYear();

    saveBtn.addEventListener('click', () => {
        const monthIndex = parseInt(monthSelect.value);

        // 1. Ler os dados das calculadoras
        const energyConsumption = parseFloat(document.querySelector('#energia .results-box strong')?.textContent.replace(',', '.')) || 0;
        let equipamentoEletronico = document.querySelector('#equipamento')?.value;
        const waterConsumption = parseFloat(document.querySelector('#agua-consumo')?.value) || 0;
        const waterEconomy = parseFloat(document.querySelector('#agua-reutilizada')?.value) || 0;
        const tarifaAgua = parseFloat(document.querySelector('#agua-tarifa')?.value.replace(',', '.')) || 0;
        const wasteRecyclingRate = parseFloat(document.querySelector('#residuos .results-box strong:last-of-type')?.textContent.replace(',', '.')) || 0;
        const tiReused = parseInt(document.querySelector('#ti-reaproveitados')?.value) || 0;
        const tiDiscarded = parseInt(document.querySelector('#ti-descartados')?.value) || 0;

        // 2. Atualizar os cartões de resumo
        const summary = document.querySelectorAll('.summary-cards .summary-card strong');
        if (summary.length >= 4) {
            summary[0].textContent = `${energyConsumption.toFixed(0)} kWh`;
            summary[1].textContent = `${waterConsumption.toLocaleString('pt-BR')} m³`;
            summary[2].textContent = `${wasteRecyclingRate.toFixed(0)}%`;
            summary[3].textContent = tiReused;
        }

        // 3. Atualizar os gráficos
        if (charts.energy) {
            if (currentEnergyMonth !== monthIndex) {
                charts.energy.data.datasets[0].data = [];
                charts.energy.data.labels = [];
                currentEnergyMonth = monthIndex;
            }

            const existingIndex = charts.energy.data.labels.indexOf(equipamentoEletronico);

            if (existingIndex !== -1) {
                charts.energy.data.datasets[0].data[existingIndex] = energyConsumption;
            } else {
                charts.energy.data.labels.push(equipamentoEletronico);
                charts.energy.data.datasets[0].data.push(energyConsumption);
            }

            const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            charts.energy.options.plugins.title.text = monthNames[monthIndex];

            charts.energy.update();
        }

        if (charts.water) {
            charts.water.data.datasets[0].data[monthIndex] = waterEconomy;
            charts.water.data.datasets[1].data[monthIndex] = waterConsumption;
            charts.water.data.datasets[2].data[monthIndex] = waterConsumption * tarifaAgua;
            charts.water.data.datasets[3].data[monthIndex] = waterEconomy * tarifaAgua;
            charts.water.update();
        }

        if (charts.waste) {
            const reciclavel = parseFloat(document.querySelector('#residuos-reciclavel')?.value) || 0;
            const organico = parseFloat(document.querySelector('#residuos-organico')?.value) || 0;
            const rejeito = parseFloat(document.querySelector('#residuos-rejeito')?.value) || 0;
            charts.waste.data.datasets[0].data = [reciclavel, organico, rejeito];
            charts.waste.update();
        }

        if (charts.ti) {
            charts.ti.data.datasets[0].data = [tiDiscarded, tiReused];
            charts.ti.update();
        }

        // 4. Rolar para o dashboard
        document.getElementById('dashboards')?.scrollIntoView({ behavior: 'smooth' });
    });
}