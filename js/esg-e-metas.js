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
                        <div class="goal-card-footer"><span class="goal-status ${statusClass}">${statusText}</span><span>Progresso: ${goal.progress}%</span><span><i class="fas fa-calendar-alt"></i> Meta: ${goal.deadline}</span></div>`;
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
     * Se o localStorage for alterado em outra aba, atualiza a visualização.
     */
    window.addEventListener('storage', (e) => { 
        if (e.key === 'esgGoals') { 
            goals = JSON.parse(e.newValue); 
            renderGoals(); 
        } 
    });

    // --- INICIALIZAÇÃO ---
    renderTags();
    renderGoals();

});