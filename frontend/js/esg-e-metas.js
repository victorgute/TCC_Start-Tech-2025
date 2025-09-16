/**
 * @file Gerencia a lógica da página ESG & Metas, incluindo a criação,
 * renderização, edição e exclusão de metas ESG, bem como o gerenciamento de categorias (tags).
 * Os dados são persistidos no localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DA PÁGINA DE METAS ---

    // Seletores de elementos do DOM para a gestão de metas
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

    /**
     * Carrega as metas do localStorage ou inicializa com um conjunto de dados padrão.
     * @type {Array<Object>}
     */
    let goals = JSON.parse(localStorage.getItem('esgGoals')) || [
        { id: 1, title: 'Neutralidade de Carbono', description: 'Redução de 100% das emissões de GEE escopo 1 e 2.', progress: 78, deadline: 2030, category: 'Ambiental' },
        { id: 2, title: 'Energia Renovável', description: '100% da energia consumida de fontes renováveis.', progress: 92, deadline: 2025, category: 'Ambiental' },
        { id: 3, title: 'Diversidade de Gênero', description: '50% de mulheres em posições de liderança.', progress: 85, deadline: 2025, category: 'Social' },
        { id: 4, title: 'Compliance 100%', description: 'Conformidade total com regulamentações.', progress: 100, deadline: 2024, category: 'Governança' }
    ];
    /**
     * Carrega as categorias (tags) do localStorage ou inicializa com um conjunto padrão.
     * @type {Array<string>}
     */
    let tags = JSON.parse(localStorage.getItem('esgTags')) || ['Ambiental', 'Social', 'Governança'];
    /**
     * ID da meta que está sendo editada. Null se nenhuma estiver em edição.
     * @type {number|null}
     */
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
    const saveGoals = () => localStorage.setItem('esgGoals', JSON.stringify(goals));
    const saveTags = () => localStorage.setItem('esgTags', JSON.stringify(tags));

    function renderGoals() {
        const existingHeader = goalsContainer.querySelector('.goals-header');
        goalsContainer.innerHTML = '';
        if(existingHeader) goalsContainer.appendChild(existingHeader);

        // Agrupa as metas pela propriedade 'category'
        const groupedGoals = goals.reduce((acc, goal) => {
            (acc[goal.category] = acc[goal.category] || []).push(goal);
            return acc;
        }, {});

        // Itera sobre cada tag para criar uma seção de categoria
        tags.forEach(tag => {
            const categoryGroup = document.createElement('div');
            categoryGroup.className = 'goal-category-group';
            categoryGroup.innerHTML = `<h3 class="goal-category-title">${tag}</h3><div class="goals-grid"></div>`;
            const grid = categoryGroup.querySelector('.goals-grid');
            const goalsForTag = groupedGoals[tag] || [];
            
            // Se não houver metas para a categoria, exibe uma mensagem
            if (goalsForTag.length === 0) {
                grid.innerHTML = '<p style="font-family: var(--font-secondary); color: var(--text-medium);">Nenhuma meta definida para esta categoria ainda.</p>';
            } else {
                // Cria e insere o cartão para cada meta na categoria
                goalsForTag.forEach(goal => {
                    let statusClass, statusText;
                    if (goal.progress >= 100) { statusClass = 'status-completed'; statusText = 'Concluído'; }
                    else if (goal.progress >= 85) { statusClass = 'status-almost'; statusText = 'Quase lá'; }
                    else { statusClass = 'status-in-progress'; statusText = 'Em andamento'; }

                    const goalCard = document.createElement('div');
                    goalCard.className = 'goal-card';
                    goalCard.dataset.id = goal.id;
                    goalCard.innerHTML = `
                        <div class="goal-card-header"><h3>${goal.title}</h3><div class="goal-card-actions"><button class="edit-btn"><i class="fas fa-pencil-alt"></i></button><button class="delete-btn"><i class="fas fa-trash-alt"></i></button></div></div>
                        <p class="goal-card-description">${goal.description}</p>
                        <div class="progress-bar-container"><div class="progress-bar" style="width: ${goal.progress}%;"></div></div>
                        <div class="goal-card-footer"><span class="goal-status ${statusClass}">${statusText}</span><span>Meta: ${goal.progress}%</span><span><i class="fas fa-calendar-alt"></i> Meta: ${goal.deadline}</span></div>`;
                    grid.appendChild(goalCard);
                });
            }
            goalsContainer.appendChild(categoryGroup);
        });
    }

    /**
     * Renderiza a lista de tags no modal de gerenciamento e preenche o select de categorias no formulário de metas.
     */
    function renderTags() {
        tagsList.innerHTML = tags.map(tag => `<div class="tag-item"><span>${tag}</span><button class="delete-tag-btn" data-tag="${tag}">&times;</button></div>`).join('');
        categorySelect.innerHTML = tags.map(tag => `<option value="${tag}">${tag}</option>`).join('');
    }

    /**
     * Exibe um modal.
     * @param {HTMLElement} modal - O elemento do modal a ser exibido.
     */
    const openModal = (modal) => modal.style.display = 'flex';
    /**
     * Fecha um modal.
     * @param {HTMLElement} modal - O elemento do modal a ser fechado.
     */
    const closeModal = (modal) => modal.style.display = 'none';

    /**
     * Abre o modal de metas para adicionar uma nova meta ou editar uma existente.
     * @param {Object|null} goal - O objeto da meta a ser editada. Se for null, abre para criar uma nova meta.
     */
    function openGoalModal(goal = null) {
        goalForm.reset();
        editingGoalId = goal ? goal.id : null;
        modalTitle.textContent = goal ? 'Editar Meta' : 'Adicionar Nova Meta';
        if(goal) {
            // Preenche o formulário com os dados da meta existente
            document.getElementById('goal-id').value = goal.id;
            document.getElementById('goal-title').value = goal.title;
            document.getElementById('goal-description').value = goal.description;
            document.getElementById('goal-progress').value = goal.progress;
            document.getElementById('goal-deadline').value = goal.deadline;
            categorySelect.value = goal.category;
        }
        openModal(goalModal);
    }

    // --- EVENT LISTENERS ---

    /**
     * Manipula o envio do formulário de metas (criação/edição).
     */
    goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const goalData = { 
            id: editingGoalId || Date.now(), 
            title: document.getElementById('goal-title').value, 
            description: document.getElementById('goal-description').value, 
            progress: parseInt(document.getElementById('goal-progress').value), 
            deadline: parseInt(document.getElementById('goal-deadline').value), 
            category: categorySelect.value 
        };
        if (editingGoalId) { 
            // Atualiza a meta existente
            goals = goals.map(g => g.id === editingGoalId ? goalData : g); 
        }
        else { 
            // Adiciona a nova meta
            goals.push(goalData); 
        }
        saveGoals(); renderGoals(); closeModal(goalModal);
    });

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
=======
    /**
     * Manipula cliques nos botões de editar e excluir dentro dos cartões de meta.
     */
    goalsContainer.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-btn');
        if(editBtn) { 
            const goalId = parseInt(editBtn.closest('.goal-card').dataset.id);
            const goalToEdit = goals.find(g => g.id === goalId);
            openGoalModal(goalToEdit); 
        }
        const deleteBtn = e.target.closest('.delete-btn');
        if(deleteBtn && confirm('Tem certeza que deseja excluir esta meta?')) {
            const goalId = parseInt(deleteBtn.closest('.goal-card').dataset.id);
            goals = goals.filter(g => g.id !== goalId);
            saveGoals(); renderGoals();
        }
    });

    
    /**
     * Manipula o envio do formulário para adicionar uma nova categoria (tag).
     */
    addTagForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTagName = document.getElementById('new-tag-name').value.trim();
        if (newTagName && !tags.includes(newTagName)) { tags.push(newTagName); saveTags(); renderTags(); }
        addTagForm.reset();
    });

    /**
     * Manipula cliques no botão de excluir uma categoria (tag).
     */
    tagsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-tag-btn')) {
            const tagToDelete = e.target.dataset.tag;
            if (confirm(`Excluir a categoria "${tagToDelete}"? Todas as metas associadas a ela também serão removidas.`)) {
                tags = tags.filter(t => t !== tagToDelete);
                goals = goals.filter(g => g.category !== tagToDelete);
                saveTags(); saveGoals(); renderTags(); renderGoals();
            }
        }
    });

    // Botões para abrir os modais
    addGoalBtn.addEventListener('click', () => openGoalModal());
    manageTagsBtn.addEventListener('click', () => openModal(tagsModal));

    // Botões para fechar qualquer modal
    document.querySelectorAll('.close-btn').forEach(btn => btn.addEventListener('click', (e) => {
        closeModal(e.target.closest('.modal'));
    }));

    /**
     * Sincroniza as metas entre abas/janelas do navegador.
     */
    window.addEventListener('storage', (e) => { 
        if (e.key === 'esgGoals') { 
            goals = JSON.parse(e.newValue); 
            renderGoals(); 
        } 
    });

    // --- INTEGRAÇÃO COM CHATBOT ---
    /**
     * Ouve o evento personalizado disparado pelo chatbot para adicionar uma ou mais metas.
     */
    document.addEventListener('add-goal-from-chat', (e) => {
        const goalsToAdd = e.detail; // Pode ser um array de metas

        if (Array.isArray(goalsToAdd) && goalsToAdd.length > 0) {
            goalsToAdd.forEach(newGoal => {
                if (newGoal && newGoal.title && newGoal.category) {
                    // Garante que a nova categoria seja adicionada se não existir
                    if (!tags.includes(newGoal.category)) {
                        tags.push(newGoal.category);
                        saveTags();
                        renderTags();
                    }

                    // Adiciona a nova meta ao array de metas
                    goals.push({
                        id: Date.now() + Math.random(), // Adiciona random para evitar colisões
                        title: newGoal.title,
                        description: newGoal.description || 'Descrição não fornecida.',
                        progress: newGoal.progress || 0,
                        deadline: newGoal.deadline || new Date().getFullYear() + 1,
                        category: newGoal.category
                    });
                } else {
                     console.error('Dados da meta recebidos do chatbot são inválidos:', newGoal);
                }
            });

            saveGoals();
            renderGoals();
            console.log('Metas adicionadas via chatbot:', goalsToAdd);

        } else {
            console.error('Nenhuma meta válida recebida do chatbot:', goalsToAdd);
        }
    });


    // --- INICIALIZAÇÃO ---
    renderTags();
    renderGoals();
});