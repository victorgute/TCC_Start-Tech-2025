/**
 * @file Gerencia toda a lógica do Chatbot Assistente ESG, incluindo a interface,
 * interações do usuário, comunicação com API (simulada) e funcionalidades
 * como anexar arquivos e reconhecimento de voz.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DO CHATBOT ---

    // Seletores de elementos do DOM para o chatbot
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

    // Variáveis de estado do chatbot
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;
    let chatHistory = [];
    let pendingGoal = null; // Armazena uma meta sugerida pelo bot, aguardando confirmação do usuário
    let attachedFile = null;
    
    // Variáveis para a funcionalidade de arrastar o chat
    let isDragging = false;
    let offsetX, offsetY;

    // Perguntas frequentes para exibição como respostas rápidas
    const frequentQuestions = [
        "Quais metas usar para o meu nicho?",
        "Como criar metas de gasto de água?",
        "Analisar meu dashboard",
        "O que é ESG?"
    ];

    /**
     * Inicia o chat com uma mensagem de boas-vindas e opções de perguntas frequentes.
     */
    function initChat() {
        appendMessage("Olá! Sou o Assistente ESG da EcoManager. Como posso ajudá-lo hoje?", 'bot');
        showQuickReplies();
    }

    /**
     * Exibe os botões de perguntas frequentes no chat.
     */
    function showQuickReplies() {
        let buttonsHTML = '<div class="bot-options-container">';
        frequentQuestions.forEach(q => {
            buttonsHTML += `<button class="quick-reply-btn">${q}</button>`;
        });
        buttonsHTML += '</div>';
        appendMessage(buttonsHTML, 'bot bot-options', true);
    }

    /**
     * Manipula o clique em um botão de resposta rápida.
     * @param {Event} e - O evento de clique.
     */
    function handleQuickReply(e) {
        if (e.target.classList.contains('quick-reply-btn')) {
            const question = e.target.textContent;
            const optionsContainer = e.target.closest('.bot-options');
            if (optionsContainer) optionsContainer.remove(); // Remove as opções após o clique
            
            appendMessage(question, 'user');
            getAIResponse(question, null);
        }
    }

    /**
     * Manipula a confirmação (Sim/Não) do usuário para adicionar uma meta sugerida pelo bot.
     * @param {Event} e - O evento de clique.
     */
    function handleConfirmation(e) {
        if (e.target.classList.contains('confirm-btn') && pendingGoal) {
            const confirmation = e.target.dataset.confirm === 'yes';
            e.target.closest('.bot-options').remove(); // Remove os botões de confirmação

            if (confirmation) {
                // Dispara um evento personalizado para que o script de metas possa adicionar a nova meta.
                // Isso desacopla o chatbot da lógica de gerenciamento de metas.
                const addGoalEvent = new CustomEvent('add-goal-from-chat', { detail: pendingGoal });
                document.dispatchEvent(addGoalEvent);
                
                appendMessage(`Certo! Adicionei a meta "${pendingGoal.title}" na categoria ${pendingGoal.category}.`, 'bot');
            } else {
                appendMessage('Entendido. A meta não foi adicionada. Como mais posso ajudar?', 'bot');
            }
            pendingGoal = null; // Limpa a meta pendente
        }
    }

    // Listener de eventos no container de mensagens para respostas rápidas e confirmações
    chatMessages.addEventListener('click', (e) => {
        handleQuickReply(e);
        handleConfirmation(e);
    });
    
    // Abre o seletor de arquivos ao clicar no botão de anexo
    attachFileBtn.addEventListener('click', () => fileInput.click());

    /**
     * Manipula a seleção de um arquivo para anexo.
     * Exibe uma pré-visualização do arquivo na janela do chat.
     */
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
        fileInput.value = ''; // Limpa o input para permitir anexar o mesmo arquivo novamente
    });

    /**
     * Abre a janela do chatbot.
     */
    function openChat() {
        chatWidget.classList.add('open');
        chatToggleButton.classList.add('hidden');
        // Inicia o chat se for a primeira vez que é aberto
        if (chatMessages.children.length < 2) {
            initChat();
        }
    }

    /**
     * Fecha a janela do chatbot.
     */
    function closeChat() {
        chatWidget.classList.remove('open');
        chatToggleButton.classList.remove('hidden');

        // Sai do modo de tela cheia se estiver ativo
        if (chatbotContainer.classList.contains('fullscreen')) {
            toggleFullscreen();
        }
        
        // Reseta a posição do chat para o padrão
        chatbotContainer.style.left = '';
        chatbotContainer.style.top = '';
        chatbotContainer.style.right = '20px';
        chatbotContainer.style.bottom = '20px';

        // Loga o histórico da conversa no console ao fechar (pode ser usado para salvar)
        if (chatHistory.length > 1) {
            console.log("Histórico da Conversa para Salvar:", JSON.stringify(chatHistory, null, 2));
        }
    }
    
    /**
     * Alterna o modo de tela cheia para o chatbot.
     */
    function toggleFullscreen() {
        const isFullscreen = chatbotContainer.classList.toggle('fullscreen');
        chatWidget.classList.toggle('fullscreen');
        const icon = chatFullscreenButton.querySelector('i');

        if (isFullscreen) {
            // Remove estilos de posicionamento para que o CSS de tela cheia seja aplicado
            chatbotContainer.style.left = '';
            chatbotContainer.style.top = '';
            chatbotContainer.style.right = '';
            chatbotContainer.style.bottom = '';

            icon.classList.remove('fa-expand');
            icon.classList.add('fa-compress');
            chatFullscreenButton.title = "Sair da Tela Cheia";
        } else {
            // Restaura a posição padrão ao sair da tela cheia
            chatbotContainer.style.left = 'auto';
            chatbotContainer.style.top = 'auto';
            chatbotContainer.style.right = '20px';
            chatbotContainer.style.bottom = '20px';
            
            icon.classList.remove('fa-compress');
            icon.classList.add('fa-expand');
            chatFullscreenButton.title = "Tela Cheia";
        }
    }

    // --- LÓGICA PARA ARRASTAR O CHAT ---

    /**
     * Inicia o processo de arrastar o chat.
     * @param {MouseEvent} event 
     */
    function onDragStart(event) {
        if (chatWidget.classList.contains('fullscreen')) return; // Não arrastar em tela cheia
        if (event.target !== chatHeader) return; // Arrastar apenas pelo cabeçalho
        
        document.body.classList.add('is-dragging-chatbot');
        isDragging = true;
        const rect = chatbotContainer.getBoundingClientRect();

        // Calcula o deslocamento inicial do mouse em relação ao canto superior esquerdo do container
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

    /**
     * Atualiza a posição do chat enquanto é arrastado.
     * @param {MouseEvent} event 
     */
    function onDragging(event) {
        if (!isDragging) return;
        event.preventDefault();

        let newX = event.clientX - offsetX;
        let newY = event.clientY - offsetY;

        // Limita o movimento para dentro da janela de visualização
        const containerWidth = chatbotContainer.offsetWidth;
        const containerHeight = chatbotContainer.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        newX = Math.max(0, Math.min(newX, viewportWidth - containerWidth));
        newY = Math.max(0, Math.min(newY, viewportHeight - containerHeight));

        // Define a nova posição
        chatbotContainer.style.left = `${newX}px`;
        chatbotContainer.style.top = `${newY}px`;
        chatbotContainer.style.right = 'auto';
        chatbotContainer.style.bottom = 'auto';
    }

    /**
     * Finaliza o processo de arrastar.
     */
    function onDragEnd() {
        isDragging = false;
        document.body.classList.remove('is-dragging-chatbot');
        document.removeEventListener('mousemove', onDragging);
        document.removeEventListener('mouseup', onDragEnd);
    }

    // --- EVENT LISTENERS DO CHATBOT ---

    chatHeader.addEventListener('mousedown', onDragStart);
    chatToggleButton.addEventListener('click', openChat);
    chatCloseButton.addEventListener('click', closeChat);
    chatMinimizeButton.addEventListener('click', closeChat); // Minimizar também fecha o chat
    chatFullscreenButton.addEventListener('click', toggleFullscreen);
    
    /**
     * Manipula o clique no botão de gravação de voz (Speech-to-Text).
     */
    speechToTextBtn.addEventListener('click', async () => {
        if (!isRecording) {
            try {
                // Solicita permissão e inicia a gravação
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.ondataavailable = event => audioChunks.push(event.data);
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    audioChunks = [];
                    transcribeAudio(audioBlob); // Envia o áudio para transcrição
                };
                mediaRecorder.start();
                isRecording = true;
                speechToTextBtn.innerHTML = '<i class="fas fa-stop-circle"></i>';
                speechToTextBtn.style.color = '#ef4444'; // Vermelho para indicar gravação
            } catch (error) {
                console.error("Erro ao acessar o microfone:", error);
                alert("Não foi possível acessar seu microfone. Por favor, verifique as permissões do navegador.");
            }
        } else {
            // Para a gravação
            mediaRecorder.stop();
            isRecording = false;
            speechToTextBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            speechToTextBtn.style.color = 'var(--text-medium)';
        }
    });

    /**
     * Envia o áudio gravado para uma API de transcrição (ex: OpenAI Whisper).
     * @param {Blob} audioBlob - O áudio gravado como um Blob.
     */
    async function transcribeAudio(audioBlob) {
        // ATENÇÃO: Substitua "SUA_CHAVE_DA_API_DA_OPENAI_AQUI" pela sua chave de API real.
        const apiKey = "SUA_CHAVE_DA_API_DA_OPENAI_AQUI"; 
        const apiUrl = "https://api.openai.com/v1/audio/transcriptions";
        
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('model', 'whisper-1');
        formData.append('language', 'pt');

        chatInput.placeholder = "Transcrevendo áudio...";
        try {
            const response = await fetch(apiUrl, { 
                method: 'POST', 
                headers: { 'Authorization': `Bearer ${apiKey}` }, 
                body: formData 
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro da API: ${errorData.error.message}`);
            }
            const data = await response.json();
            chatInput.value = data.text; // Preenche o input com o texto transcrito
        } catch (error) {
            console.error("Erro ao transcrever o áudio:", error);
            alert("Ocorreu um erro ao tentar transcrever o áudio. Tente novamente.");
        } finally {
            chatInput.placeholder = "Digite sua pergunta sobre ESG...";
        }
    }

    /**
     * Manipula o envio do formulário de chat (envio de mensagem).
     */
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageText = chatInput.value.trim();
        if (!messageText && !attachedFile) return;

        if (messageText) {
            appendMessage(messageText, 'user');
        }
        chatInput.value = '';
        
        // Obtém a resposta da "IA"
        await getAIResponse(messageText, attachedFile);
        attachedFile = null; // Limpa o arquivo anexado após o envio
    });

    /**
     * Adiciona uma mensagem à janela do chat e ao histórico.
     * @param {string} content - O conteúdo da mensagem (pode ser HTML).
     * @param {string} sender - O remetente ('user' ou 'bot').
     * @param {boolean} [isHtml=false] - Se o conteúdo é HTML.
     * @param {string|null} [historyContent=null] - Conteúdo alternativo para salvar no histórico.
     */
    function appendMessage(content, sender, isHtml = false, historyContent = null) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        if (isHtml) {
            messageElement.innerHTML = content;
        } else {
            messageElement.textContent = content;
        }
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Rola para a última mensagem

        // Adiciona ao histórico, exceto para indicadores de digitação ou opções de botões
        if (!sender.includes('bot-options') && !sender.includes('typing-indicator')) {
            const contentToSave = historyContent !== null ? historyContent : content;
            chatHistory.push({ 
                role: sender.includes('user') ? 'user' : 'bot', 
                content: contentToSave, 
                timestamp: new Date().toISOString() 
            });
        }
    }
    
    /**
     * Simula a obtenção de uma resposta de uma IA.
     * @param {string} userInput - A mensagem do usuário.
     * @param {File|null} file - O arquivo anexado.
     */
    async function getAIResponse(userInput, file) {
        // Exibe o indicador de "digitando..."
        appendMessage('<div class="typing-indicator"><span></span><span></span><span></span></div>', 'bot typing-indicator', true);
        const typingIndicator = chatMessages.lastChild;

        // Simula o tempo de resposta da IA
        await new Promise(resolve => setTimeout(resolve, 1500));
        typingIndicator.remove();

        // Lógica de resposta simulada baseada na entrada do usuário
        if (file || userInput.toLowerCase().includes('analis')) {
            const fileName = file ? file.name : "dashboard_agua_24_04_2025";
            // Cria uma meta pendente para o usuário confirmar
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
            <p>Posso adicionar esta meta na sua página de ESG & Metas para você?</p>
            <div class="bot-options-container">
                <button class="confirm-btn" data-confirm="yes">Sim, por favor!</button>
                <button class="confirm-btn" data-confirm="no">Não, obrigado.</button>
            </div>`;
            appendMessage(response, 'bot bot-options', true);
        } else if (userInput.toLowerCase().includes('nicho')) {
            appendMessage("Claro! Me informe o nicho do seu negócio e eu criarei metas ESG personalizadas para sua empresa.", 'bot');
        } else if (userInput.toLowerCase().includes('o que é esg')) {
            let response = `ESG é a sigla em inglês para "Environmental, Social and Governance" (Ambiental, Social e Governança). É um conjunto de critérios usados para medir as práticas de sustentabilidade e o impacto ético de uma empresa.<br><br>
            Quer que eu te ajude a criar metas sustentáveis com base nos seus dashboards? É só me enviar o arquivo que eu analiso para você! 😉`;
            appendMessage(response, 'bot', true);
        } else {
            appendMessage("Não tenho certeza de como ajudar com isso. Poderia reformular ou tentar uma das opções abaixo?", 'bot');
            showQuickReplies();
        }
    }
});
