document.addEventListener('DOMContentLoaded', () => {
    const goalsContainer = document.getElementById('goals-container');
    const addTagBtn = document.getElementById('add-tag-btn');
    const goalModal = document.getElementById('goal-modal');
    const tagModal = document.getElementById('tag-modal');
    const goalForm = document.getElementById('goal-form');
    const tagForm = document.getElementById('tag-form');
    let currentEditingGoalId = null;
    let currentEditingTagId = null;

    // Dados de exemplo (em um app real, viria de um backend)
    let tags = [
        { id: 1, name: 'Ambiental' },
        { id: 2, name: 'Social' },
        { id: 3, name: 'Governança' }
    ];

    let goals = [
        { id: 1, tagId: 1, title: 'Neutralidade de Carbono', description: 'Redução de 100% das emissões de GEE escopo 1 e 2.', progress: 78, deadline: 2030 },
        { id: 2, tagId: 1, title: 'Energia Renovável', description: '100% da energia consumida de fontes renováveis.', progress: 92, deadline: 2025 },
        { id: 3, tagId: 2, title: 'Diversidade de Gênero', description: '50% de mulheres em posições de liderança.', progress: 85, deadline: 2025 },
    ];

    function getStatus(progress) {
        if (progress >= 100) return { text: 'Concluído', class: 'done' };
        if (progress >= 90) return { text: 'Quase concluído', class: 'almost-done' };
        return { text: 'Em andamento', class: 'in-progress' };
    }
    
    function renderGoals() {
        goalsContainer.innerHTML = '';
        tags.forEach(tag => {
            const tagSection = document.createElement('div');
            tagSection.className = 'tag-section';
            tagSection.innerHTML = `
                <div class="goals-section-header">
                    <h3>${tag.name}</h3>
                    <div>
                        <button class="btn-add add-goal-btn" data-tag-id="${tag.id}"><i class="fas fa-plus"></i> Nova Meta</button>
                        <button class="card-actions-btn edit-tag-btn" data-tag-id="${tag.id}"><i class="fas fa-pencil-alt"></i></button>
                        <button class="card-actions-btn delete-tag-btn" data-tag-id="${tag.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="goal-cards" id="tag-goals-${tag.id}"></div>
            `;
            goalsContainer.appendChild(tagSection);

            const tagGoalsContainer = document.getElementById(`tag-goals-${tag.id}`);
            const filteredGoals = goals.filter(goal => goal.tagId === tag.id);

            if (filteredGoals.length > 0) {
                filteredGoals.forEach(goal => {
                    const status = getStatus(goal.progress);
                    const goalCard = document.createElement('div');
                    goalCard.className = 'goal-card';
                    goalCard.innerHTML = `
                        <div class="card-actions">
                            <button class="edit-goal-btn" data-goal-id="${goal.id}"><i class="fas fa-pencil-alt"></i></button>
                            <button class="delete-goal-btn" data-goal-id="${goal.id}"><i class="fas fa-trash"></i></button>
                        </div>
                        <h4>${goal.title}</h4>
                        <p class="description">${goal.description}</p>
                        <p class="progress-text">${goal.progress}%</p>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${goal.progress}%;"></div>
                        </div>
                        <div class="goal-footer">
                            <span class="status-tag status-tag.${status.class}">${status.text}</span>
                            <span class="deadline"><i class="fas fa-calendar-alt"></i> Meta: ${goal.deadline}</span>
                        </div>
                    `;
                    tagGoalsContainer.appendChild(goalCard);
                });
            } else {
                tagGoalsContainer.innerHTML = '<p>Nenhuma meta nesta categoria ainda.</p>';
            }
        });
        updateEventListeners();
    }

    function populateTagDropdown() {
        const select = document.getElementById('goal-tag');
        select.innerHTML = '';
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.id;
            option.textContent = tag.name;
            select.appendChild(option);
        });
    }

    function openGoalModal(goalId = null, tagId = null) {
        goalForm.reset();
        populateTagDropdown();
        currentEditingGoalId = goalId;
        if (goalId) {
            const goal = goals.find(g => g.id === goalId);
            document.getElementById('modal-title').textContent = 'Editar Meta';
            document.getElementById('goal-id').value = goal.id;
            document.getElementById('goal-title').value = goal.title;
            document.getElementById('goal-description').value = goal.description;
            document.getElementById('goal-tag').value = goal.tagId;
            document.getElementById('goal-progress').value = goal.progress;
            document.getElementById('goal-deadline').value = goal.deadline;
        } else {
            document.getElementById('modal-title').textContent = 'Nova Meta';
            if (tagId) {
                document.getElementById('goal-tag').value = tagId;
            }
        }
        goalModal.style.display = 'block';
    }

    function openTagModal(tagId = null) {
        tagForm.reset();
        currentEditingTagId = tagId;
        if (tagId) {
            const tag = tags.find(t => t.id === tagId);
            document.getElementById('tag-modal-title').textContent = 'Editar Categoria';
            document.getElementById('tag-id').value = tag.id;
            document.getElementById('tag-name').value = tag.name;
        } else {
            document.getElementById('tag-modal-title').textContent = 'Nova Categoria';
        }
        tagModal.style.display = 'block';
    }

    function closeModal() {
        goalModal.style.display = 'none';
        tagModal.style.display = 'none';
    }

    goalForm.addEventListener('submit', e => {
        e.preventDefault();
        const formData = {
            title: document.getElementById('goal-title').value,
            description: document.getElementById('goal-description').value,
            tagId: parseInt(document.getElementById('goal-tag').value),
            progress: parseInt(document.getElementById('goal-progress').value),
            deadline: document.getElementById('goal-deadline').value,
        };
        if (currentEditingGoalId) {
            const index = goals.findIndex(g => g.id === currentEditingGoalId);
            goals[index] = { ...goals[index], ...formData };
        } else {
            formData.id = Date.now();
            goals.push(formData);
        }
        renderGoals();
        closeModal();
    });

    tagForm.addEventListener('submit', e => {
        e.preventDefault();
        const tagName = document.getElementById('tag-name').value;
        if (currentEditingTagId) {
            const index = tags.findIndex(t => t.id === currentEditingTagId);
            tags[index].name = tagName;
        } else {
            const newTag = { id: Date.now(), name: tagName };
            tags.push(newTag);
        }
        renderGoals();
        closeModal();
    });

    function updateEventListeners() {
        document.querySelectorAll('.add-goal-btn').forEach(btn => {
            btn.onclick = () => openGoalModal(null, parseInt(btn.dataset.tagId));
        });
        document.querySelectorAll('.edit-goal-btn').forEach(btn => {
            btn.onclick = () => openGoalModal(parseInt(btn.dataset.goalId));
        });
        document.querySelectorAll('.delete-goal-btn').forEach(btn => {
            btn.onclick = () => {
                if (confirm('Tem certeza que deseja excluir esta meta?')) {
                    goals = goals.filter(g => g.id !== parseInt(btn.dataset.goalId));
                    renderGoals();
                }
            };
        });
        document.querySelectorAll('.edit-tag-btn').forEach(btn => {
            btn.onclick = () => openTagModal(parseInt(btn.dataset.tagId));
        });
        document.querySelectorAll('.delete-tag-btn').forEach(btn => {
            btn.onclick = () => {
                    if (confirm('Tem certeza que deseja excluir esta categoria e todas as suas metas?')) {
                    const tagIdToDelete = parseInt(btn.dataset.tagId);
                    tags = tags.filter(t => t.id !== tagIdToDelete);
                    goals = goals.filter(g => g.tagId !== tagIdToDelete);
                    renderGoals();
                }
            };
        });
    }
    
    addTagBtn.onclick = () => openTagModal();
    document.querySelectorAll('.close-button').forEach(btn => btn.onclick = closeModal);
    window.onclick = e => {
        if (e.target == goalModal || e.target == tagModal) closeModal();
    };

    renderGoals();
});
