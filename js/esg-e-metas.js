
document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DA PÁGINA DE METAS ---
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

    let goals = JSON.parse(localStorage.getItem('esgGoals')) || [
        { id: 1, title: 'Neutralidade de Carbono', description: 'Redução de 100% das emissões de GEE escopo 1 e 2.', progress: 78, deadline: 2030, category: 'Ambiental' },
        { id: 2, title: 'Energia Renovável', description: '100% da energia consumida de fontes renováveis.', progress: 92, deadline: 2025, category: 'Ambiental' },
        { id: 3, title: 'Diversidade de Gênero', description: '50% de mulheres em posições de liderança.', progress: 85, deadline: 2025, category: 'Social' },
        { id: 4, title: 'Compliance 100%', description: 'Conformidade total com regulamentações.', progress: 100, deadline: 2024, category: 'Governança' }
    ];
    let tags = JSON.parse(localStorage.getItem('esgTags')) || ['Ambiental', 'Social', 'Governança'];
    let editingGoalId = null;

    const saveGoals = () => localStorage.setItem('esgGoals', JSON.stringify(goals));
    const saveTags = () => localStorage.setItem('esgTags', JSON.stringify(tags));

    function renderGoals() {
        const existingHeader = goalsContainer.querySelector('.goals-header');
        goalsContainer.innerHTML = '';
        if(existingHeader) goalsContainer.appendChild(existingHeader);

        const groupedGoals = goals.reduce((acc, goal) => {
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
                grid.innerHTML = '<p style="font-family: var(--font-secondary); color: var(--text-medium);">Nenhuma meta definida para esta categoria ainda.</p>';
            } else {
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

    function renderTags() {
        tagsList.innerHTML = tags.map(tag => `<div class="tag-item"><span>${tag}</span><button class="delete-tag-btn" data-tag="${tag}">&times;</button></div>`).join('');
        categorySelect.innerHTML = tags.map(tag => `<option value="${tag}">${tag}</option>`).join('');
    }

    const openModal = (modal) => modal.style.display = 'flex';
    const closeModal = (modal) => modal.style.display = 'none';

    function openGoalModal(goal = null) {
        goalForm.reset();
        editingGoalId = goal ? goal.id : null;
        modalTitle.textContent = goal ? 'Editar Meta' : 'Adicionar Nova Meta';
        if(goal) {
            document.getElementById('goal-id').value = goal.id;
            document.getElementById('goal-title').value = goal.title;
            document.getElementById('goal-description').value = goal.description;
            document.getElementById('goal-progress').value = goal.progress;
            document.getElementById('goal-deadline').value = goal.deadline;
            categorySelect.value = goal.category;
        }
        openModal(goalModal);
    }

    goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const goalData = { id: editingGoalId || Date.now(), title: document.getElementById('goal-title').value, description: document.getElementById('goal-description').value, progress: parseInt(document.getElementById('goal-progress').value), deadline: parseInt(document.getElementById('goal-deadline').value), category: categorySelect.value };
        if (editingGoalId) { goals = goals.map(g => g.id === editingGoalId ? goalData : g); }
        else { goals.push(goalData); }
        saveGoals(); renderGoals(); closeModal(goalModal);
    });

    goalsContainer.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-btn');
        if(editBtn) { openGoalModal(goals.find(g => g.id === parseInt(editBtn.closest('.goal-card').dataset.id))); }
        const deleteBtn = e.target.closest('.delete-btn');
        if(deleteBtn && confirm('Tem certeza?')) {
            goals = goals.filter(g => g.id !== parseInt(deleteBtn.closest('.goal-card').dataset.id));
            saveGoals(); renderGoals();
        }
    });
    
    addTagForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTagName = document.getElementById('new-tag-name').value.trim();
        if (newTagName && !tags.includes(newTagName)) { tags.push(newTagName); saveTags(); renderTags(); }
        addTagForm.reset();
    });

    tagsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-tag-btn')) {
            const tagToDelete = e.target.dataset.tag;
            if (confirm(`Excluir a categoria "${tagToDelete}"? Todas as metas associadas serão removidas.`)) {
                tags = tags.filter(t => t !== tagToDelete);
                goals = goals.filter(g => g.category !== tagToDelete);
                saveTags(); saveGoals(); renderTags(); renderGoals();
            }
        }
    });

    addGoalBtn.addEventListener('click', () => openGoalModal());
    manageTagsBtn.addEventListener('click', () => openModal(tagsModal));
    document.querySelectorAll('.close-btn').forEach(btn => btn.addEventListener('click', (e) => {
        closeModal(e.target.closest('.modal'));
    }));
    window.addEventListener('storage', (e) => { if (e.key === 'esgGoals') { goals = JSON.parse(e.newValue); renderGoals(); } });
    
    renderTags();
    renderGoals();

    // --- LÓGICA DO CHATBOT ---
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatWidget = document.getElementById('chat-widget');
    const chatHeader = document.getElementById('chat-header');
    const chatToggleButton = document.getElementById('chat-toggle-btn');
    const chatCloseButton = document.getElementById('chat-close-btn');
    const chatMinimizeButton = document.getElementById('chat-minimize-btn');
    const chatFullscreenButton = document.getElementById('chat-fullscreen-btn');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const attachFileBtn = document.getElementById('attach-file-btn');
    const fileInput = document.getElementById('file-input');
    const speechToTextBtn = document.getElementById('speech-to-text-btn');
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    let chatHistory = [];
    let pendingGoal = null;
    let attachedFile = null;
    let isDragging = false;
    let offsetX, offsetY;

    const frequentQuestions = [
        "Quais metas usar para o meu nicho?",
        "Como criar metas de gasto de água?",
        "Analisar meu dashboard",
        "O que é ESG?"
    ];

    function initChat() {
        appendMessage("Olá! Sou o Assistente ESG da EcoManager. Como posso ajudá-lo hoje?", 'bot');
        showQuickReplies();
    }

    function showQuickReplies() {
        let buttonsHTML = '<div class="bot-options-container">';
        frequentQuestions.forEach(q => {
            buttonsHTML += `<button class="quick-reply-btn">${q}</button>`;
        });
        buttonsHTML += '</div>';
        appendMessage(buttonsHTML, 'bot bot-options', true);
    }

    function handleQuickReply(e) {
        if (e.target.classList.contains('quick-reply-btn')) {
            const question = e.target.textContent;
            const optionsContainer = e.target.closest('.bot-options');
            if (optionsContainer) optionsContainer.remove();
            
            appendMessage(question, 'user');
            getAIResponse(question, null);
        }
    }

    function handleConfirmation(e) {
            if (e.target.classList.contains('confirm-btn') && pendingGoal) {
            const confirmation = e.target.dataset.confirm === 'yes';
            e.target.closest('.bot-options').remove();
            if (confirmation) {
                goals.push(pendingGoal);
                saveGoals();
                renderGoals();
                appendMessage(`Certo! Adicionei a meta "${pendingGoal.title}" na categoria ${pendingGoal.category}.`, 'bot');
            } else {
                appendMessage('Entendido. A meta não foi adicionada. Como mais posso ajudar?', 'bot');
            }
            pendingGoal = null;
        }
    }

    chatMessages.addEventListener('click', (e) => {
        handleQuickReply(e);
        handleConfirmation(e);
    });
    
    attachFileBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        attachedFile = file;
        const reader = new FileReader();
        
        reader.onload = (event) => {
            let filePreviewHTML;
            const historyText = `[Arquivo Anexado: ${file.name}]`;

            if (file.type.startsWith('image/')) {
                filePreviewHTML = `<img src="${event.target.result}" alt="${file.name}">`;
            } else {
                filePreviewHTML = `<div class="file-preview"><i class="fas fa-file-pdf"></i> ${file.name}</div>`;
            }
            const displayHTML = `Anexei o seguinte arquivo:<br>${filePreviewHTML}`;
            appendMessage(displayHTML, 'user', true, historyText);
        };
        
        reader.readAsDataURL(file);
        fileInput.value = '';
    });


    function openChat() {
        chatWidget.classList.add('open');
        chatToggleButton.classList.add('hidden');
        if (chatMessages.children.length < 2) {
            initChat();
        }
    }

    function closeChat() {
        chatWidget.classList.remove('open');
        chatToggleButton.classList.remove('hidden');

        if (chatbotContainer.classList.contains('fullscreen')) {
            toggleFullscreen();
        }
        
        // Reset position to default when closing
        chatbotContainer.style.left = '';
        chatbotContainer.style.top = '';
        chatbotContainer.style.right = '20px';
        chatbotContainer.style.bottom = '20px';

        if (chatHistory.length > 1) {
            console.log("Histórico da Conversa para Salvar:", JSON.stringify(chatHistory, null, 2));
        }
    }
    
    function toggleFullscreen() {
        const isFullscreen = chatbotContainer.classList.toggle('fullscreen');
        chatWidget.classList.toggle('fullscreen');
        const icon = chatFullscreenButton.querySelector('i');

        if (isFullscreen) {
            // Ao entrar em tela cheia, removemos os estilos de posição para que o CSS assuma.
            chatbotContainer.style.left = '';
            chatbotContainer.style.top = '';
            chatbotContainer.style.right = '';
            chatbotContainer.style.bottom = '';

            icon.classList.remove('fa-expand');
            icon.classList.add('fa-compress');
            chatFullscreenButton.title = "Sair da Tela Cheia";
        } else {
            // Ao sair da tela cheia, restauramos a posição padrão.
            chatbotContainer.style.left = 'auto';
            chatbotContainer.style.top = 'auto';
            chatbotContainer.style.right = '20px';
            chatbotContainer.style.bottom = '20px';
            
            icon.classList.remove('fa-compress');
            icon.classList.add('fa-expand');
            chatFullscreenButton.title = "Tela Cheia";
        }
    }

    function onDragStart(event) {
        if (chatWidget.classList.contains('fullscreen')) return;
        if (event.target !== chatHeader) return;
        
        document.body.classList.add('is-dragging-chatbot');
        isDragging = true;
        const rect = chatbotContainer.getBoundingClientRect();

        if (getComputedStyle(chatbotContainer).position === 'fixed') {
                offsetX = event.clientX - rect.left;
                offsetY = event.clientY - rect.top;
        } else {
            offsetX = event.clientX - chatbotContainer.offsetLeft;
            offsetY = event.clientY - chatbotContainer.offsetTop;
        }
        
        document.addEventListener('mousemove', onDragging);
        document.addEventListener('mouseup', onDragEnd);
    }

    function onDragging(event) {
        if (!isDragging) return;
        event.preventDefault();

        let newX = event.clientX - offsetX;
        let newY = event.clientY - offsetY;

        const containerWidth = chatbotContainer.offsetWidth;
        const containerHeight = chatbotContainer.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Limita o movimento dentro do viewport
        newX = Math.max(0, Math.min(newX, viewportWidth - containerWidth));
        newY = Math.max(0, Math.min(newY, viewportHeight - containerHeight));

        chatbotContainer.style.left = `${newX}px`;
        chatbotContainer.style.top = `${newY}px`;
        chatbotContainer.style.right = 'auto';
        chatbotContainer.style.bottom = 'auto';
    }

    function onDragEnd() {
        isDragging = false;
        document.body.classList.remove('is-dragging-chatbot');
        document.removeEventListener('mousemove', onDragging);
        document.removeEventListener('mouseup', onDragEnd);
    }

    chatHeader.addEventListener('mousedown', onDragStart);
    chatToggleButton.addEventListener('click', openChat);
    chatCloseButton.addEventListener('click', closeChat);
    chatMinimizeButton.addEventListener('click', closeChat);
    chatFullscreenButton.addEventListener('click', toggleFullscreen);
    
    speechToTextBtn.addEventListener('click', async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    audioChunks = [];
                    transcribeAudio(audioBlob);
                };
                mediaRecorder.start();
                isRecording = true;
                speechToTextBtn.innerHTML = '<i class="fas fa-stop-circle"></i>';
                speechToTextBtn.style.color = '#ef4444';
            } catch (error) {
                console.error("Erro ao acessar o microfone:", error);
                alert("Não foi possível acessar seu microfone. Por favor, verifique as permissões do navegador.");
            }
        } else {
            mediaRecorder.stop();
            isRecording = false;
            speechToTextBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            speechToTextBtn.style.color = 'var(--text-medium)';
        }
    });

    async function transcribeAudio(audioBlob) {
        const apiKey = "SUA_CHAVE_DA_API_DA_OPENAI_AQUI"; 
        const apiUrl = "https://api.openai.com/v1/audio/transcriptions";
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('model', 'whisper-1');
        formData.append('language', 'pt');
        chatInput.placeholder = "Transcrevendo áudio...";
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Authorization': `Bearer ${apiKey}` }, body: formData });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro da API: ${errorData.error.message}`);
            }
            const data = await response.json();
            chatInput.value = data.text;
        } catch (error) {
            console.error("Erro ao transcrever o áudio:", error);
            alert("Ocorreu um erro ao tentar transcrever o áudio. Tente novamente.");
        } finally {
            chatInput.placeholder = "Digite sua pergunta sobre ESG...";
        }
    }


    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageText = chatInput.value.trim();
        if (!messageText && !attachedFile) return;

        if (messageText) {
            appendMessage(messageText, 'user');
        }
        chatInput.value = '';
        
        await getAIResponse(messageText, attachedFile);
        attachedFile = null;
    });

    function appendMessage(content, sender, isHtml = false, historyContent = null) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        if (isHtml) {
            messageElement.innerHTML = content;
        } else {
            messageElement.textContent = content;
        }
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (!sender.includes('bot-options') && !sender.includes('typing-indicator')) {
            const contentToSave = historyContent !== null ? historyContent : content;
                chatHistory.push({ 
                role: sender.includes('user') ? 'user' : 'bot', 
                content: contentToSave, 
                timestamp: new Date().toISOString() 
            });
        }
    }
    
    async function getAIResponse(userInput, file) {
        appendMessage('<div class="typing-indicator"><span></span><span></span><span></span></div>', 'bot typing-indicator', true);
        const typingIndicator = chatMessages.lastChild;

        await new Promise(resolve => setTimeout(resolve, 1500));
        typingIndicator.remove();

        if (file || userInput.toLowerCase().includes('analis')) {
            const fileName = file ? file.name : "dashboard_agua_24_04_2025";
            pendingGoal = {
                id: Date.now(),
                title: `Redução do Consumo de Água`,
                description: `Implementar um plano para reduzir em 15% o consumo de água, com base na análise do arquivo ${fileName}.`,
                progress: 0,
                deadline: 2026,
                category: 'Ambiental'
            };

            let response = `Aqui está a análise do seu dashboard (${fileName}) e um plano de diminuição:<br>
            <ul>
                <li><strong>Ponto Crítico:</strong> Consumo de água elevado no setor de produção.</li>
                <li><strong>Sugestão:</strong> Instalar redutores de vazão e criar um sistema de reutilização da água da chuva.</li>
                <li><strong>Meta Proposta:</strong> Reduzir o consumo total em 15% nos próximos 18 meses.</li>
            </ul>
            <p>Irei adicionar automaticamente esses dados na página de ESG & Metas se você me permitir!</p>
            <div class="bot-options-container">
                <button class="confirm-btn" data-confirm="yes">Sim, por favor!</button>
                <button class="confirm-btn" data-confirm="no">Não, obrigado.</button>
            </div>`;
            appendMessage(response, 'bot bot-options', true);
        } else if (userInput.toLowerCase().includes('nicho')) {
            appendMessage("Claro! Me informe o nicho do seu negócio e eu criarei metas ESG personalizadas para sua empresa.", 'bot');
        } else if (userInput.toLowerCase().includes('o que é esg')) {
            let response = `ESG é a sigla em inglês para "Environmental, Social and Governance" (Ambiental, Social e Governança). É um conjunto de critérios usados para medir as práticas de sustentabilidade e o impacto ético de uma empresa.<br><br>
            Quer que eu te ajude a criar metas sustentáveis com base nos seus dashboards? É só mandar que eu resolvo tudo para você! 😉`;
            appendMessage(response, 'bot', true);
        } else {
                appendMessage("Não tenho certeza de como ajudar com isso. Poderia reformular ou tentar uma das opções abaixo?", 'bot');
                showQuickReplies();
        }
    }
});