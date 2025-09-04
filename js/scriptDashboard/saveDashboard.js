import { charts } from './initDashboards.js';

let currentEnergyMonth = null;
let currentTiMonth = null;
let currentWasteMonth = null;

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
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const summary = document.querySelectorAll('.summary-cards .summary-card strong');
        const activeTab = document.querySelector('.tab-content.active');

        if (!activeTab) return;

        const activeTabId = activeTab.id;

        switch (activeTabId) {
            case 'energia': {
                const energyConsumption = parseFloat(document.querySelector('#energia .energiaConsumida')?.textContent.replace(',', '.')) || 0;
                const equipamentoEletronico = document.querySelector('#equipamento')?.value || 'Não especificado';

                if (summary.length >= 1) {
                    summary[0].textContent = `${energyConsumption.toFixed(0)} kWh`;
                }

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

                    charts.energy.options.plugins.title.text = monthNames[monthIndex];
                    charts.energy.update();
                }
                break;
            }

            case 'agua': {
                const waterConsumption = parseFloat(document.querySelector('#agua-consumo')?.value) || 0;
                const waterEconomy = parseFloat(document.querySelector('#agua-reutilizada')?.value) || 0;
                const tarifaAgua = parseFloat(document.querySelector('#agua-tarifa')?.value.replace(',', '.')) || 0;

                if (summary.length >= 2) {
                    summary[1].textContent = `${waterConsumption.toLocaleString('pt-BR')} m³`;
                }

                if (charts.water) {
                    charts.water.data.datasets[0].data[monthIndex] = waterEconomy;
                    charts.water.data.datasets[1].data[monthIndex] = waterConsumption;
                    charts.water.data.datasets[2].data[monthIndex] = waterConsumption * tarifaAgua;
                    charts.water.data.datasets[3].data[monthIndex] = waterEconomy * tarifaAgua;
                    charts.water.update();
                }
                break;
            }

            case 'residuos': {
                const wasteRecyclingRate = parseFloat(document.querySelector('#residuos .economiaPercentual')?.textContent.replace(',', '.')) || 0;
                const reciclavel = parseFloat(document.querySelector('#residuos-reciclavel')?.value) || 0;
                const organico = parseFloat(document.querySelector('#residuos-organico')?.value) || 0;
                const rejeito = parseFloat(document.querySelector('#residuos-rejeito')?.value) || 0;

                if (summary.length >= 3) {
                    summary[2].textContent = `${wasteRecyclingRate.toFixed(0)}%`;
                }
                if (charts.waste) {
                    // Se o mês mudou, reseta os dados e atualiza o título
                    if (currentWasteMonth !== monthIndex) {
                        charts.waste.data.datasets[0].data = [0, 0, 0];
                        currentWasteMonth = monthIndex;
                        charts.waste.options.plugins.title.text = monthNames[monthIndex];
                    }
                    // Atualiza o gráfico com os novos dados do mês
                    charts.waste.data.datasets[0].data = [reciclavel, organico, rejeito];
                    charts.waste.update();
                }
                break;
            }

            case 'ti': {
                const nomeEquipamento = document.querySelector('#equipamentosTI')?.value.trim() || 'Equipamento';
                const tiReused = parseInt(document.querySelector('#ti-reaproveitados')?.value) || 0;
                const tiDiscarded = parseInt(document.querySelector('#ti-descartados')?.value) || 0;

                if (summary.length >= 4) {
                    summary[3].textContent = tiReused;
                }

                if (charts.ti) {
                    // Se o mês mudou, reseta o gráfico de TI e atualiza o título
                    if (currentTiMonth !== monthIndex) {
                        charts.ti.data.datasets = [];
                        currentTiMonth = monthIndex;
                        charts.ti.options.plugins.title.text = monthNames[monthIndex];
                    }

                    const existingDatasetIndex = charts.ti.data.datasets.findIndex(dataset => dataset.label === nomeEquipamento);

                    if (existingDatasetIndex !== -1) {
                        // Atualiza os dados existentes se o nome do equipamento ja existir
                        charts.ti.data.datasets[existingDatasetIndex].data = [tiReused, tiDiscarded];
                    } else {
                        // Adiciona os dados de um novo equipamento
                        const r = Math.floor(Math.random() * 255);
                        const g = Math.floor(Math.random() * 255);
                        const b = Math.floor(Math.random() * 255);

                        charts.ti.data.datasets.push({
                            label: nomeEquipamento,
                            data: [tiReused, tiDiscarded],
                            backgroundColor: `rgba(${r}, ${g}, ${b}, 0.5)`,
                            borderColor: `rgba(${r}, ${g}, ${b}, 1)`,
                            borderWidth: 2
                        });
                    }

                    charts.ti.update();
                }
                break;
            }
        }

        // 4. Rolar para o dashboard
        document.getElementById('dashboards')?.scrollIntoView({ behavior: 'smooth' });
    });
}