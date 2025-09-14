/**
 * Este ficheiro contém a lógica específica da página de ferramentas.
 */
import { postCalculatorData, fetchCalculatorData } from './api.js';
import { initDashboards, updateDashboards } from './scriptDashboard/initDashboards.js';
import { initChartDownload } from './scriptDashboard/downloadChart.js';

// --- NOVA FUNÇÃO: Atualiza os cards de resumo com os totais ---
function updateSummaryCards(allData) {
    const summaryElements = document.querySelectorAll('.summary-cards .summary-card strong');
    if (summaryElements.length < 4) return;

    // 1. Total de Energia
    const totalEnergy = allData
        .filter(d => d.calculator_type === 'energia')
        .reduce((sum, item) => {
            const consumption = (item.data.Potencia * item.data.Quantidade * item.data.HorasNoDia * item.data.DiaNoMes) / 1000;
            return sum + consumption;
        }, 0);
    summaryElements[0].textContent = `${totalEnergy.toFixed(0)} kWh`;

    // 2. Total de Água
    const totalWater = allData
        .filter(d => d.calculator_type === 'agua')
        .reduce((sum, item) => sum + (item.data.ConsumoMensalM3 || 0), 0);
    summaryElements[1].textContent = `${totalWater.toLocaleString('pt-BR')} m³`;

    // 3. Taxa de Reciclagem Geral
    const wasteData = allData.filter(d => d.calculator_type === 'residuos');
    const totalReciclavel = wasteData.reduce((sum, item) => sum + (item.data.ResiduoReciclavel || 0), 0);
    const totalWaste = wasteData.reduce((sum, item) => sum + (item.data.ResiduoReciclavel || 0) + (item.data.ResiduoOrganico || 0) + (item.data.ResiduoRejeito || 0), 0);
    const recyclingRate = totalWaste > 0 ? (totalReciclavel / totalWaste) * 100 : 0;
    summaryElements[2].textContent = `${recyclingRate.toFixed(0)}%`;

    // 4. Total de TI Reaproveitada
    const totalTIReused = allData
        .filter(d => d.calculator_type === 'ti')
        .reduce((sum, item) => sum + (item.data.EquipamentosReaproveitados || 0), 0);
    summaryElements[3].textContent = totalTIReused;
}


// --- Funções existentes ---
function showNotification(message, isSuccess = true) {
    // ... (código existente, sem alterações)
}

function getActiveCalculatorData(activeTabId) {
    // ... (código existente, sem alterações)
}

// --- Função principal ATUALIZADA ---
async function initFerramentasPage() {
    initDashboards(); 
    initChartDownload();

    const saveBtn = document.querySelector('.save-dashboard-btn');
    const monthSelect = document.getElementById('month-select');
    const yearInput = document.getElementById('year-input');

    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            // ... (código do listener de clique, sem alterações)
            
            try {
                // ...
                await postCalculatorData(payload);
                showNotification("Dados guardados com sucesso!", true);
                
                const allData = await fetchCalculatorData();
                updateDashboards(allData); 
                updateSummaryCards(allData); // <-- ADICIONADO: Atualiza os cards após salvar

            } catch (error) {
                // ...
            } finally {
                // ...
            }
        });
    }

    try {
        const initialData = await fetchCalculatorData();
        updateDashboards(initialData); 
        updateSummaryCards(initialData); // <-- ADICIONADO: Atualiza os cards no carregamento inicial
    } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        showNotification("Não foi possível carregar os dados do dashboard.", false);
    }
}

if (document.querySelector('.calculator-section')) {
    initFerramentasPage();
}