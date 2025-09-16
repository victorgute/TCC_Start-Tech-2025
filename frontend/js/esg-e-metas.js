import { fetchCalculatorData, fetchWorkspaces, fetchGoals, createGoal, updateGoal, deleteGoal } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const goalsContainer = document.getElementById('goals-container');
    const addGoalBtn = document.getElementById('add-goal-btn');
    const goalModal = document.getElementById('goal-modal');
    const modalTitle = document.getElementById('modal-title');
    const goalForm = document.getElementById('goal-form');
    const manageTagsBtn = document.getElementById('manage-tags-btn');
    const tagsModal = document.getElementById('tags-modal');
    const tagsList = document.getElementById('tags-list');
    const addTagForm = document.getElementById('add-tag-form');
    const categorySelect = document.getElementById('goal-category-select');

    // --- ESTADO DA APLICAÇÃO ---
    let goals = []; // A lista de metas agora é preenchida pela API
    let tags = JSON.parse(localStorage.getItem('esgTags')) || ['Ambiental', 'Social', 'Governança'];
    let editingGoalId = null;

    // --- LÓGICA DE DADOS E CÁLCULOS ---
    function calculateMetrics(allData) {
        if (!allData) return { totalEnergy: 0, totalWater: 0, totalReciclavel: 0, recyclingRate: 0, totalTIReused: 0 };
        const totalEnergy = allData.filter(d => d.calculator_type === 'energia').reduce((sum, item) => sum + ((item.data.Potencia * item.data.Quantidade * item.data.HorasNoDia * item.data.DiaNoMes) / 1000), 0);
        const totalWater = allData.filter(d => d.calculator_type === 'agua').reduce((sum, item) => sum + (item.data.ConsumoMensalM3 || 0), 0);
        const wasteData = allData.filter(d => d.calculator_type === 'residuos');
        const totalReciclavel = wasteData.reduce((sum, item) => sum + (item.data.ResiduoReciclavel || 0), 0);
        const totalWaste = wasteData.reduce((sum, item) => sum + totalReciclavel + (item.data.ResiduoOrganico || 0) + (item.data.ResiduoRejeito || 0), 0);
        const recyclingRate = totalWaste > 0 ? (totalReciclavel / totalWaste) * 100 : 0;
        const totalTIReused = allData.filter(d => d.calculator_type === 'ti').reduce((sum, item) => sum + (item.data.EquipamentosReaproveitados || 0), 0);
        return { totalEnergy, totalWater, totalReciclavel, recyclingRate, totalTIReused };
    }

    function updateIndicators(metrics) {
        document.getElementById('indicator-energy').textContent = metrics.totalEnergy.toFixed(0);
        document.getElementById('indicator-water').textContent = metrics.totalWater.toLocaleString('pt-BR');
        document.getElementById('indicator-waste').textContent = metrics.totalReciclavel.toFixed(0);
        document.getElementById('indicator-ti').textContent = metrics.totalTIReused;
    }

    function calculateAndUpdateGoals(currentGoals, metrics) {
        currentGoals.forEach(goal => {
            if (goal.metric === 'manual') return;
            let progress = 0;
            const currentValue = metrics[goal.metric];
            const targetValue = goal.target;
            if (goal.type === 'lessThan') {
                progress = (currentValue <= targetValue) ? 100 : Math.max(0, ((targetValue * 2 - currentValue) / targetValue) * 100);
            } else if (goal.type === 'greaterThan') {
                progress = Math.min(100, (currentValue / targetValue) * 100);
            }
            goal.progress = Math.round(progress);
        });
        renderGoals(currentGoals);
    }

    // --- LÓGICA DE RENDERIZAÇÃO E MODAIS ---
    function renderGoals(goalsToRender) {
        if (!goalsContainer) return;
        const existingHeader = goalsContainer.querySelector('.goals-header');
        goalsContainer.innerHTML = '';
        if(existingHeader) goalsContainer.appendChild(existingHeader);

        const groupedGoals = goalsToRender.reduce((acc, goal) => {
            (acc[goal.category] = acc[goal.category] || []).push(goal);
            return acc;
        }, {});

        tags.forEach(tag => {
            const categoryGroup = document.createElement('div');
            categoryGroup.className = 'goal-category-group';
            categoryGroup.innerHTML = `<h3 class="goal-category-title">${tag}</h3><div class="goals-grid"></div>`;
            const grid = categoryGroup.querySelector('.goals-grid');
            const goalsForTag = groupedGoals[tag] || [];
            
            if (goalsForTag.length === 0) {
                grid.innerHTML = '<p class="no-goals-message">Nenhuma meta definida para esta categoria.</p>';
            } else {
                goalsForTag.forEach(goal => {
                    let statusClass, statusText;
                    if (goal.progress >= 100) { statusClass = 'status-completed'; statusText = 'Concluído'; }
                    else if (goal.progress >= 85) { statusClass = 'status-almost'; statusText = 'Quase lá'; }
                    else { statusClass = 'status-in-progress'; statusText = 'Em andamento'; }

                    const goalCard = document.createElement('div');
                    goalCard.className = 'goal-card';
                    goalCard.dataset.id = goal.record_id;
                    goalCard.innerHTML = `
                        <div class="goal-card-header"><h3>${goal.title}</h3><div class="goal-card-actions"><button class="edit-btn"><i class="fas fa-pencil-alt"></i></button><button class="delete-btn"><i class="fas fa-trash-alt"></i></button></div></div>
                        <p class="goal-card-description">${goal.description}</p>
                        <div class="progress-bar-container"><div class="progress-bar" style="width: ${goal.progress}%;"></div></div>
                        <div class="goal-card-footer"><span class="goal-status ${statusClass}">${statusText}</span><span>Progresso: ${goal.progress}%</span><span><i class="fas fa-calendar-alt"></i> Meta: ${goal.deadline}</span></div>`;
                    grid.appendChild(goalCard);
                });
            }
            goalsContainer.appendChild(categoryGroup);
        });
    }
    
    const openModal = (modal) => modal.style.display = 'flex';
    const closeModal = (modal) => modal.style.display = 'none';

    function openGoalModal(goal = null) {
        goalForm.reset();
        editingGoalId = goal ? goal.record_id : null;
        modalTitle.textContent = goal ? 'Editar Meta' : 'Adicionar Nova Meta';
        if(goal) {
            document.getElementById('goal-title').value = goal.title || '';
            document.getElementById('goal-description').value = goal.description || '';
            document.getElementById('goal-progress').value = goal.progress || 0;
            document.getElementById('goal-deadline').value = goal.deadline || '';
            categorySelect.value = goal.category || tags[0];
        }
        openModal(goalModal);
    }
    
    function renderTags() {
        if(!tagsList || !categorySelect) return;
        tagsList.innerHTML = tags.map(tag => `<div class="tag-item"><span>${tag}</span><button class="delete-tag-btn" data-tag="${tag}">&times;</button></div>`).join('');
        categorySelect.innerHTML = tags.map(tag => `<option value="${tag}">${tag}</option>`).join('');
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    // --- EVENT LISTENERS ---
    if(goalForm) {
        goalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const goalData = { 
                title: document.getElementById('goal-title').value, 
                description: document.getElementById('goal-description').value, 
                progress: parseInt(document.getElementById('goal-progress').value),
                deadline: parseInt(document.getElementById('goal-deadline').value), 
                category: categorySelect.value,
                metric: 'manual', target: 0, type: 'greaterThan'
            };
            try {
                if (editingGoalId) {
                    await updateGoal(editingGoalId, goalData);
                } else { 
                    await createGoal(goalData); 
                }
                closeModal(goalModal);
                await loadPageData();
            } catch (error) {
                alert('Erro ao salvar a meta.');
            }
        });
    }

    if(goalsContainer) {
        goalsContainer.addEventListener('click', async (e) => {
            const editBtn = e.target.closest('.edit-btn');
            if(editBtn) { 
                const goalId = editBtn.closest('.goal-card').dataset.id;
                const goalToEdit = goals.find(g => g.record_id === goalId);
                openGoalModal(goalToEdit); 
            }

            const deleteBtn = e.target.closest('.delete-btn');
            if(deleteBtn && confirm('Tem certeza que deseja excluir esta meta?')) {
                const goalId = deleteBtn.closest('.goal-card').dataset.id;
                try {
                    console.log(`A tentar apagar a meta com ID: ${goalId}`);
                    await deleteGoal(goalId);
                    showNotification("Meta apagada com sucesso!", true);
                    await loadPageData(); // Recarrega os dados da página
                } catch (error) {
                    console.error("Falha ao apagar a meta:", error);
                    showNotification("Ocorreu um erro ao apagar a meta. Verifique o console.", false);
                }
            }
        });
    }

    // --- LIGAÇÃO COM O CHATBOT ---
    document.addEventListener('add-goal-from-chat', async (e) => {
        const goalsToAdd = e.detail;
        if (Array.isArray(goalsToAdd) && goalsToAdd.length > 0) {
            try {
                // Cria todas as metas recebidas do chatbot
                await Promise.all(goalsToAdd.map(goal => createGoal(goal)));
                
                showNotification(`${goalsToAdd.length} meta(s) adicionada(s) pelo assistente!`, true);
                
                await loadPageData(); // Recarrega tudo para mostrar as novas metas
            } catch (error) {
                console.error("Erro ao adicionar meta a partir do chatbot:", error);
                alert("Ocorreu um erro ao tentar salvar a meta sugerida pelo assistente.");
            }
        }
    });
    
    if(addGoalBtn) addGoalBtn.addEventListener('click', () => openGoalModal());
    if(manageTagsBtn) manageTagsBtn.addEventListener('click', () => openModal(tagsModal));
    document.querySelectorAll('.close-btn').forEach(btn => btn.addEventListener('click', (e) => closeModal(e.target.closest('.modal'))));
    
    // --- FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ---
    async function loadPageData() {
        try {
            const [workspaces, fetchedGoals] = await Promise.all([ fetchWorkspaces(), fetchGoals() ]);
            goals = fetchedGoals;
            if (workspaces && workspaces.length > 0) {
                const firstWorkspaceId = workspaces[0].record_id.split('#')[1];
                const allData = await fetchCalculatorData(firstWorkspaceId);
                const metrics = calculateMetrics(allData);
                updateIndicators(metrics);
                calculateAndUpdateGoals(goals, metrics);
            } else {
                renderGoals(goals);
            }
        } catch (error) {
            console.error("Erro ao carregar dados para a página ESG:", error);
            renderGoals(goals); 
        }
    }
    
    // --- PONTO DE ENTRADA DO SCRIPT ---
    loadPageData();
    renderTags(); 
});