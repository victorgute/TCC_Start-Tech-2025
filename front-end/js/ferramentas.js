    /**
     * Este ficheiro contém a lógica específica da página de ferramentas:
     * 1. Recolha de dados dos formulários.
     * 2. Envio dos dados para o back-end através do `api.js`.
     * 3. Carregamento dos dados existentes e atualização dos dashboards.
     */
    import { postCalculatorData, fetchCalculatorData } from './api.js';
    // O CAMINHO FOI CORRIGIDO para apontar para a subpasta correta
    import { initDashboards, updateDashboards } from './scriptDashboard/initDashboards.js';
    
    // Função para mostrar notificações (sem alterações)
    function showNotification(message, isSuccess = true) {
        const notification = document.createElement('div');
        notification.className = `notification ${isSuccess ? 'success' : 'error'}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
    
    // Função para recolher os dados do formulário da calculadora ativa (sem alterações)
    function getActiveCalculatorData(activeTabId) {
        const form = document.getElementById(activeTabId);
        if (!form) return null;
    
        let data = {};
        switch (activeTabId) {
            case 'energia':
                data = {
                    Equipamento: form.querySelector('#equipamento').value,
                    Potencia: parseFloat(form.querySelector('#potencia').value) || 0,
                    Quantidade: parseInt(form.querySelector('#quantidade').value) || 0,
                    HorasNoDia: parseFloat(form.querySelector('#horas').value) || 0,
                    DiaNoMes: parseInt(form.querySelector('#dias').value) || 0,
                    Tarifa: parseFloat(form.querySelector('#tarifa').value.replace(',', '.')) || 0,
                };
                break;
            case 'agua':
                data = {
                    ConsumoMensalM3: parseFloat(form.querySelector('#agua-consumo').value) || 0,
                    ReutilizacaoDeAguaM3: parseFloat(form.querySelector('#agua-reutilizada').value) || 0,
                    Tarifa: parseFloat(form.querySelector('#agua-tarifa').value.replace(',', '.')) || 0,
                };
                break;
            case 'residuos':
                 data = {
                    ResiduoReciclavel: parseFloat(form.querySelector('#residuos-reciclavel').value) || 0,
                    ResiduoOrganico: parseFloat(form.querySelector('#residuos-organico').value) || 0,
                    ResiduoRejeito: parseFloat(form.querySelector('#residuos-rejeito').value) || 0,
                };
                break;
            case 'ti':
                data = {
                    EquipamentosNovos: parseInt(form.querySelector('#ti-novos').value) || 0,
                    EquipamentosDescartados: parseInt(form.querySelector('#ti-descartados').value) || 0,
                    EquipamentosReaproveitados: parseInt(form.querySelector('#ti-reaproveitados').value) || 0,
                };
                break;
        }
        return data;
    }
    
    // Função principal que é executada quando a página de ferramentas carrega
    async function initFerramentasPage() {
        // 1. CRIA os gráficos vazios, apenas uma vez.
        initDashboards(); 
        
        const saveBtn = document.querySelector('.save-dashboard-btn');
        const monthSelect = document.getElementById('month-select');
        const yearInput = document.getElementById('year-input');
    
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const activeTab = document.querySelector('.tab-button.active');
                if (!activeTab) {
                    showNotification("Nenhuma calculadora selecionada.", false);
                    return;
                }
    
                const calculatorType = activeTab.dataset.tab;
                const data = getActiveCalculatorData(calculatorType);
                const year = yearInput.value;
                const month = monthSelect.value;
                
                if (!month || !year) {
                     showNotification("Por favor, selecione um mês e um ano.", false);
                    return;
                }
                
                const payload = { calculatorType, year, month, data };
                
                try {
                    await postCalculatorData(payload);
                    showNotification("Dados guardados com sucesso!", true);
                    
                    // 3. Busca todos os dados e ATUALIZA os gráficos existentes
                    const allData = await fetchCalculatorData();
                    updateDashboards(allData); 
    
                } catch (error) {
                    showNotification(`Erro ao guardar os dados: ${error.message}`, false);
                }
            });
        }
    
        // 2. Carrega os dados iniciais e ATUALIZA os gráficos pela primeira vez
        try {
            const initialData = await fetchCalculatorData();
            updateDashboards(initialData); 
        } catch (error) {
            console.error("Erro ao carregar dados iniciais:", error);
            showNotification("Não foi possível carregar os dados do dashboard.", false);
        }
    }
    
    // Inicia a lógica da página
    initFerramentasPage();
    

