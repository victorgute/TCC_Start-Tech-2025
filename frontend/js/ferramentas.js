import { postCalculatorData, fetchCalculatorData, downloadDashboard, saveDashboardSnapshot, fetchWorkspaces, createWorkspace } from './api.js';
import { initDashboards, updateDashboards, clearCharts } from './scriptDashboard/initDashboards.js';
import { initChartDownload } from './scriptDashboard/downloadChart.js';
import { dashboardState } from './dashboardState.js';

// ===================================================================================
// ESTADO DA PÁGINA
// ===================================================================================
let currentWorkspaceId = null;

// ===================================================================================
// FUNÇÕES DE AJUDA (HELPERS)
// ===================================================================================

/**
 * Atualiza os cards de resumo no topo dos dashboards com os totais calculados.
 * @param {Array<Object>} allData - Todos os dados do utilizador vindos do back-end.
 */
function updateSummaryCards(allData) {
    const summaryElements = document.querySelectorAll('.summary-cards .summary-card strong');
    if (summaryElements.length < 4) return;

    const totalEnergy = allData.filter(d => d.calculator_type === 'energia').reduce((sum, item) => sum + ((item.data.Potencia * item.data.Quantidade * item.data.HorasNoDia * item.data.DiaNoMes) / 1000), 0);
    summaryElements[0].textContent = `${totalEnergy.toFixed(0)} kWh`;

    const totalWater = allData.filter(d => d.calculator_type === 'agua').reduce((sum, item) => sum + (item.data.ConsumoMensalM3 || 0), 0);
    summaryElements[1].textContent = `${totalWater.toLocaleString('pt-BR')} m³`;

    const wasteData = allData.filter(d => d.calculator_type === 'residuos');
    const totalReciclavel = wasteData.reduce((sum, item) => sum + (item.data.ResiduoReciclavel || 0), 0);
    const totalWaste = wasteData.reduce((sum, item) => sum + (item.data.ResiduoReciclavel || 0) + (item.data.ResiduoOrganico || 0) + (item.data.ResiduoRejeito || 0), 0);
    const recyclingRate = totalWaste > 0 ? (totalReciclavel / totalWaste) * 100 : 0;
    summaryElements[2].textContent = `${recyclingRate.toFixed(0)}%`;

    const totalTIReused = allData.filter(d => d.calculator_type === 'ti').reduce((sum, item) => sum + (item.data.EquipamentosReaproveitados || 0), 0);
    summaryElements[3].textContent = totalTIReused;
}

/**
 * Mostra uma notificação temporária no ecrã.
 */
function showNotification(message, isSuccess = true) {
    const notification = document.createElement('div');
    notification.className = `notification ${isSuccess ? 'success' : 'error'}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

/**
 * Recolhe os dados do formulário da calculadora que está atualmente ativa.
 */
function getActiveCalculatorData(activeTabId) {
    const form = document.getElementById(activeTabId);
    if (!form) return null;
    let data = {};
    switch (activeTabId) {
        case 'energia':
            data = { Equipamento: form.querySelector('#equipamento').value, Potencia: parseFloat(form.querySelector('#potencia').value) || 0, Quantidade: parseInt(form.querySelector('#quantidade').value) || 0, HorasNoDia: parseFloat(form.querySelector('#horas').value) || 0, DiaNoMes: parseInt(form.querySelector('#dias').value) || 0, Tarifa: parseFloat(form.querySelector('#tarifa').value.replace(',', '.')) || 0 };
            break;
        case 'agua':
            data = { ConsumoMensalM3: parseFloat(form.querySelector('#agua-consumo').value) || 0, ReutilizacaoDeAguaM3: parseFloat(form.querySelector('#agua-reutilizada').value) || 0, Tarifa: parseFloat(form.querySelector('#agua-tarifa').value.replace(',', '.')) || 0 };
            break;
        case 'residuos':
             data = { ResiduoReciclavel: parseFloat(form.querySelector('#residuos-reciclavel').value) || 0, ResiduoOrganico: parseFloat(form.querySelector('#residuos-organico').value) || 0, ResiduoRejeito: parseFloat(form.querySelector('#residuos-rejeito').value) || 0 };
            break;
        case 'ti':
            data = { nomeEquipamento: form.querySelector('#equipamentosTI').value.trim() || 'Equipamento', EquipamentosNovos: parseInt(form.querySelector('#ti-novos').value) || 0, EquipamentosDescartados: parseInt(form.querySelector('#ti-descartados').value) || 0, EquipamentosReaproveitados: parseInt(form.querySelector('#ti-reaproveitados').value) || 0 };
            break;
    }
    return data;
}

/**
 * Preenche o seletor de workspaces com os dados vindos da API.
 */
function populateWorkspaceSelector(workspaces, selector) {
    selector.innerHTML = '';
    if (workspaces.length === 0) {
        selector.innerHTML = '<option value="">Crie um workspace</option>';
        return;
    }
    workspaces.forEach(ws => {
        const option = document.createElement('option');
        const workspaceId = ws.record_id.split('#')[1];
        option.value = workspaceId;
        option.textContent = ws.workspace_name;
        selector.appendChild(option);
    });
    currentWorkspaceId = selector.value;
}

/**
 * Busca os dados do workspace atual e atualiza a UI (gráficos e cards).
 */
async function refreshDataForCurrentWorkspace() {
    if (!currentWorkspaceId) {
        clearCharts();
        updateSummaryCards([]);
        return;
    }
    try {
        const data = await fetchCalculatorData(currentWorkspaceId);
        updateDashboards(data);
        updateSummaryCards(data);
    } catch (error) {
        console.error("Erro ao carregar dados do workspace:", error);
    }
}

// ===================================================================================
// FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO
// ===================================================================================

/**
 * Inicializa todas as funcionalidades da página de Ferramentas.
 */
async function initFerramentasPage() {
    // 1. Inicializa elementos visuais
    initDashboards(); 
    initChartDownload();

    // 2. Seleciona todos os elementos de interação do DOM
    const saveBtn = document.querySelector('.save-dashboard-btn');
    const monthSelect = document.getElementById('month-select');
    const yearInput = document.getElementById('year-input');
    const clearBtn = document.getElementById('clear-charts-btn');
    const exportBtn = document.querySelector('.btn-export');
    const saveSnapshotBtn = document.getElementById('save-snapshot-btn');
    const workspaceSelect = document.getElementById('workspace-select');
    const newWorkspaceBtn = document.getElementById('new-workspace-btn');

    // 3. Configura os Event Listeners
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            clearCharts();
            const summaryElements = document.querySelectorAll('.summary-cards .summary-card strong');
            summaryElements[0].textContent = '0 kWh';
            summaryElements[1].textContent = '0 m³';
            summaryElements[2].textContent = '0%';
            summaryElements[3].textContent = '0';
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', downloadDashboard);
    }

    if (workspaceSelect) {
        workspaceSelect.addEventListener('change', () => {
            currentWorkspaceId = workspaceSelect.value;
            refreshDataForCurrentWorkspace();
        });
    }

    if (newWorkspaceBtn) {
        newWorkspaceBtn.addEventListener('click', async () => {
            const name = prompt("Qual o nome da nova Área de Trabalho? (ex: Análise de Custo 2025)");
            if (name) {
                try {
                    const newWorkspace = await createWorkspace(name);
                    const allWorkspaces = await fetchWorkspaces();
                    populateWorkspaceSelector(allWorkspaces, workspaceSelect);
                    workspaceSelect.value = newWorkspace.record_id.split('#')[1];
                    currentWorkspaceId = workspaceSelect.value;
                    await refreshDataForCurrentWorkspace();
                } catch (error) {
                    alert("Erro ao criar nova área de trabalho.");
                }
            }
        });
    }

    if (saveSnapshotBtn) {
        saveSnapshotBtn.addEventListener('click', async () => {
            const snapshotName = prompt("Por favor, dê um nome para esta análise (ex: Relatório Q1 2025):");
            if (!snapshotName) {
                showNotification("A operação de salvar foi cancelada.", false);
                return;
            }
            const payload = {
                name: snapshotName,
                snapshotData: { energy: charts.energy.data, water: charts.water.data, waste: charts.waste.data, ti: charts.ti.data }
            };
            try {
                await saveDashboardSnapshot(payload);
                showNotification(`Análise '${snapshotName}' salva com sucesso!`, true);
            } catch (error) {
                showNotification("Erro ao salvar a análise.", false);
            }
        });
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const activeTab = document.querySelector('.tab-button.active');
            if (!activeTab) return showNotification("Nenhuma calculadora selecionada.", false);

            const calculatorType = activeTab.dataset.tab;
            const data = getActiveCalculatorData(calculatorType);
            const year = yearInput.value;
            const month = parseInt(monthSelect.value) + 1;
            
            if (isNaN(month) || !year || !currentWorkspaceId) {
                return showNotification("Selecione um workspace e uma data válida.", false);
            }
            
            const payload = { workspaceId: currentWorkspaceId, calculatorType, year, month, data };
            
            try {
                saveBtn.disabled = true;
                saveBtn.innerHTML = "A guardar...";
                await postCalculatorData(payload);
                showNotification("Dados guardados com sucesso!", true);
                await refreshDataForCurrentWorkspace();
            } catch (error) {
                showNotification(`Erro ao guardar os dados: ${error.message}`, false);
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Salvar para o Mês';
            }
        });
    }

    // 4. Carregamento inicial dos dados da página
    try {
        const workspaces = await fetchWorkspaces();
        if (workspaces.length === 0) {
            await createWorkspace("Workspace Principal");
            const updatedWorkspaces = await fetchWorkspaces();
            populateWorkspaceSelector(updatedWorkspaces, workspaceSelect);
        } else {
            populateWorkspaceSelector(workspaces, workspaceSelect);
        }
        await refreshDataForCurrentWorkspace();
    } catch (error) {
        console.error("Erro ao inicializar a página de ferramentas:", error);
    }
}

// ===================================================================================
// PONTO DE ENTRADA DO SCRIPT
// ===================================================================================

if (document.querySelector('.calculator-section')) {
    initFerramentasPage();
}