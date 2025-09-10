/**
 * @file Gerencia toda a lógica do Chatbot Assistente ESG, incluindo a interface,
 * interações do usuário, comunicação com a API e funcionalidades
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
    let pendingGoals = []; // Armazena metas sugeridas pelo bot
    let attachedFile = null;

    // Variáveis para a funcionalidade de arrastar o chat
    let isDragging = false;
    let offsetX, offsetY;

    // Perguntas frequentes para exibição como respostas rápidas
    const frequentQuestions = [
        "Analise meu dashboard e me ajude a criar metas ESG",
        "Quais metas de diminuição de gastos de água posso criar?",
        "Quais metas de diminuição de gastos de energia posso criar?",
        "Quais metas de diminuição posso utilizar no meu negócio?"
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
     * Manipula o clique em um botão de resposta rápida ou de sugestão de categoria.
     * @param {Event} e - O evento de clique.
     */
    function handleQuickReply(e) {
        const target = e.target;
        let question = '';
        let isButtonClick = false;

        if (target.classList.contains('quick-reply-btn')) {
            question = target.textContent;
            isButtonClick = true;
        } else if (target.classList.contains('category-suggestion-btn')) {
            const category = target.dataset.category;
            question = `Sugira mais 3 metas na categoria ${category}`;
            isButtonClick = true;
        }
        
        if(isButtonClick){
            const optionsContainer = target.closest('.bot-options');
            if (optionsContainer) optionsContainer.remove();

            appendMessage(question, 'user');
            getAIResponse(question, null);
        }
    }
    
    /**
     * Manipula a confirmação do usuário para adicionar uma ou mais metas.
     * @param {Event} e - O evento de clique.
     */
    function handleConfirmation(e) {
        const target = e.target;
        if (target.classList.contains('confirm-btn') && pendingGoals.length > 0) {
            const action = target.dataset.action;
            const goalsToAdd = [];

            if (action === 'all') {
                goalsToAdd.push(...pendingGoals);
            } else if (action.startsWith('meta-')) {
                const index = parseInt(action.split('-')[1], 10) - 1;
                if (pendingGoals[index]) {
                    goalsToAdd.push(pendingGoals[index]);
                }
            }

            if (goalsToAdd.length > 0) {
                // Dispara um evento personalizado para que o script de metas possa adicionar a(s) nova(s) meta(s).
                const addGoalEvent = new CustomEvent('add-goal-from-chat', {
                    detail: goalsToAdd
                });
                document.dispatchEvent(addGoalEvent);

                const titles = goalsToAdd.map(g => `"${g.title}"`).join(', ');
                appendMessage(`Certo! Adicionei a(s) meta(s): ${titles}.`, 'bot');

                // Adiciona a mensagem com os botões de categoria
                const suggestionHTML = `<p>Quer mais algumas sugestões de metas? Selecione nos botões abaixo a categoria e eu vou te propor mais 3 metas com base no seu negócio.</p>
                <div class="bot-options-container">
                    <button class="category-suggestion-btn" data-category="Ambiental">Ambiental</button>
                    <button class="category-suggestion-btn" data-category="Social">Social</button>
                    <button class="category-suggestion-btn" data-category="Governança">Governança</button>
                </div>`;
                appendMessage(suggestionHTML, 'bot bot-options', true);
            }
            
            // Limpa as metas pendentes e remove os botões de confirmação
            pendingGoals = [];
             const optionsContainer = target.closest('.bot-options');
            if (optionsContainer) {
                optionsContainer.remove();
            }

        } else if (target.classList.contains('more-goals-btn')) {
             const optionsContainer = target.closest('.bot-options');
            if (optionsContainer) {
                optionsContainer.remove();
            }
            appendMessage("Ok, me diga qual o seu nicho para eu criar mais 3 metas.", 'user');
            getAIResponse("Crie mais 3 metas de diminuição, por favor.", null);
        }
    }


    // Listener de eventos no container de mensagens
    chatMessages.addEventListener('click', (e) => {
        handleQuickReply(e);
        handleConfirmation(e);
    });

    // Abre o seletor de arquivos ao clicar no botão de anexo
    attachFileBtn.addEventListener('click', () => fileInput.click());

    /**
     * Manipula a seleção de um arquivo para anexo.
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
                filePreviewHTML = `<img src="${event.target.result}" alt="${file.name}" style="max-width: 100%; border-radius: 8px;">`;
            } else {
                filePreviewHTML = `<div class="file-preview" style="padding: 10px; background-color: #f0f0f0; border-radius: 8px;"><i class="fas fa-file-alt"></i> ${file.name}</div>`;
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
        if (chatMessages.children.length === 0) {
            initChat();
        }
    }

    function closeChat() {
        chatWidget.classList.remove('open');
        chatToggleButton.classList.remove('hidden');
        if (chatbotContainer.classList.contains('fullscreen')) {
            toggleFullscreen();
        }
        chatbotContainer.style.left = '';
        chatbotContainer.style.top = '';
        chatbotContainer.style.right = '20px';
        chatbotContainer.style.bottom = '20px';
        if (chatHistory.length > 0) {
            console.log("Histórico da Conversa:", JSON.stringify(chatHistory, null, 2));
        }
    }

    function toggleFullscreen() {
        const isFullscreen = chatbotContainer.classList.toggle('fullscreen');
        chatWidget.classList.toggle('fullscreen');
        const icon = chatFullscreenButton.querySelector('i');
        if (isFullscreen) {
            chatbotContainer.style.left = '';
            chatbotContainer.style.top = '';
            chatbotContainer.style.right = '';
            chatbotContainer.style.bottom = '';
            icon.classList.replace('fa-expand', 'fa-compress');
            chatFullscreenButton.title = "Sair da Tela Cheia";
        } else {
            chatbotContainer.style.right = '20px';
            chatbotContainer.style.bottom = '20px';
            icon.classList.replace('fa-compress', 'fa-expand');
            chatFullscreenButton.title = "Tela Cheia";
        }
    }
    
    // Lógica para expandir textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';
    });
    
    // Lógica de arrastar
    function onDragStart(event) {
        if (chatbotContainer.classList.contains('fullscreen') || event.target.closest('.chat-header-actions')) return;
        isDragging = true;
        chatHeader.style.cursor = 'grabbing';
        document.body.classList.add('is-dragging-chatbot');
        const rect = chatbotContainer.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
        document.addEventListener('mousemove', onDragging);
        document.addEventListener('mouseup', onDragEnd, { once: true });
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
        newX = Math.max(0, Math.min(newX, viewportWidth - containerWidth));
        newY = Math.max(0, Math.min(newY, viewportHeight - containerHeight));
        chatbotContainer.style.left = `${newX}px`;
        chatbotContainer.style.top = `${newY}px`;
        chatbotContainer.style.right = 'auto';
        chatbotContainer.style.bottom = 'auto';
    }

    function onDragEnd() {
        isDragging = false;
        chatHeader.style.cursor = 'move';
        document.body.classList.remove('is-dragging-chatbot');
        document.removeEventListener('mousemove', onDragging);
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
                appendMessage("Não consegui acessar seu microfone. Por favor, verifique as permissões do navegador.", 'bot');
            }
        } else {
            mediaRecorder.stop();
            isRecording = false;
            speechToTextBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            speechToTextBtn.style.color = 'var(--text-medium)';
        }
    });

    async function transcribeAudio(audioBlob) {
        const apiKey = "";
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
            chatInput.value = data.text;
            chatInput.dispatchEvent(new Event('input')); // Dispara o evento de input para ajustar a altura
        } catch (error) {
            console.error("Erro ao transcrever o áudio:", error);
            appendMessage("Ocorreu um erro ao tentar transcrever o áudio. Tente novamente.", 'bot');
        } finally {
            chatInput.placeholder = "Digite sua pergunta sobre ESG...";
        }
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageText = chatInput.value.trim();
        if (!messageText && !attachedFile) return;

        chatInput.value = '';
        chatInput.style.height = 'auto'; // Reseta a altura

        if (attachedFile) {
            appendMessage(`Anexei o arquivo: ${attachedFile.name}`, 'user');
        }
        if (messageText) {
            appendMessage(messageText, 'user');
        }

        await getAIResponse(messageText, attachedFile);
        attachedFile = null;
    });
    
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });


    function appendMessage(content, sender, isHtml = false, historyContent = null) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        if (isHtml) {
            messageElement.innerHTML = content;
        } else {
            messageElement.innerHTML = content.replace(/\n/g, '<br>'); // Substitui quebras de linha por <br>
        }
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (!sender.includes('bot-options') && !sender.includes('typing-indicator')) {
            const contentToSave = historyContent !== null ? historyContent : content;
            const role = sender.includes('user') ? 'user' : 'assistant';
            chatHistory.push({ role: role, content: contentToSave });
        }
    }

    async function getAIResponse(userInput, file) {
        appendMessage('<div class="typing-indicator"><span></span><span></span><span></span></div>', 'bot typing-indicator', true);
        const typingIndicator = chatMessages.lastChild;

        const apiKey = "";
        const apiUrl = "https://api.openai.com/v1/chat/completions";
        
        const systemPrompt = `Você é um Consultor especialista em ESG da empresa EcoManager. Sua função é analisar dados de dashboards de sustentabilidade (luz, água, resíduos, etc.) e ajudar os usuários a criar metas ESG.

        **Instruções Principais:**
        1.  **Seja Proativo:** Se o usuário não fornecer informações suficientes (nicho da empresa, % de redução, ano da meta), FAÇA PERGUNTAS para obter os detalhes necessários. Ex: "Qual é o ramo da sua empresa (ex: varejo, escritório, indústria)?", "Qual a porcentagem de redução que você almeja?", "Até que ano você pretende alcançar essa meta?".
        2.  **Analise Dashboards:** Se um arquivo for enviado, presuma que é um dashboard. Analise os dados e sugira metas baseadas nos pontos críticos (ex: alto consumo de energia, baixa taxa de reciclagem).
        3.  **Crie Metas Múltiplas:** Se o usuário pedir "metas" (no plural) ou se a análise do dashboard justificar, crie até 3 metas simultaneamente, sendo uma Ambiental, uma Social e uma de Governança, todas personalizadas para o nicho do usuário.
        4.  **Formato de Saída (JSON Obrigatório):** Ao sugerir metas, SEMPRE inclua no final da sua resposta um bloco de código JSON com a(s) meta(s) no seguinte formato:
            \`\`\`json
            {
              "sugestaoMetas": [
                {
                  "title": "Título Conciso da Meta 1",
                  "description": "Plano de ação detalhado e passo a passo para implementar a meta. Seja bem descritivo aqui, não economize nos detalhes.",
                  "category": "Ambiental",
                  "deadline": 2027,
                  "progress": 0
                },
                {
                  "title": "Título Conciso da Meta 2",
                  "description": "Plano de ação detalhado...",
                  "category": "Social",
                  "deadline": 2028,
                  "progress": 0
                },
                {
                  "title": "Título Conciso da Meta 3",
                  "description": "Plano de ação detalhado para a meta de governança...",
                  "category": "Governança",
                  "deadline": 2029,
                  "progress": 0
                }
              ]
            }
            \`\`\`
        5.  **Plano de Ação Detalhado:** A "description" de cada meta DEVE ser um plano de ação completo, com passos claros e práticos de como a empresa pode atingir o objetivo.
        6.  **Tom Amigável:** Mantenha um tom profissional, mas amigável e prestativo.
        7.  **Pós-Confirmação:** Após o usuário confirmar a adição de uma meta, ofereça proativamente mais sugestões com a mensagem: "Quer mais algumas sugestões de metas? Selecione nos botões abaixo a categoria e eu vou te propor mais 3 metas com base no seu negócio." e forneça botões para "Ambiental", "Social" e "Governança".`;


        let messages = [{ role: "system", content: systemPrompt }, ...chatHistory];

        if (file) {
            try {
                // Para simplificar, vamos apenas informar a IA sobre o arquivo.
                // A análise de imagem/PDF real precisaria de um modelo multimodal (GPT-4o, etc.)
                userInput += `\n\n[ANÁLISE DE ARQUIVO: O usuário anexou o arquivo '${file.name}'. Por favor, analise os dados contidos nele e sugira metas ESG relevantes.]`;
            } catch (e) {
                console.error("Erro ao processar o arquivo:", e);
                appendMessage("Desculpe, tive um problema ao analisar o arquivo.", 'bot');
                typingIndicator.remove();
                return;
            }
        }

        messages.push({ role: "user", content: userInput });

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ model: "gpt-4", messages: messages })
            });

            if (!response.ok) throw new Error(`Erro da API: ${response.statusText}`);

            const data = await response.json();
            const botResponse = data.choices[0].message.content;

            typingIndicator.remove();

            const jsonMatch = botResponse.match(/```json\s*(\{[\s\S]*?\})\s*```/);
            if (jsonMatch) {
                const jsonString = jsonMatch[1];
                let cleanResponse = botResponse.replace(jsonMatch[0], '').trim();

                appendMessage(cleanResponse, 'bot');

                const parsedJson = JSON.parse(jsonString);
                if (parsedJson.sugestaoMetas && parsedJson.sugestaoMetas.length > 0) {
                    pendingGoals = parsedJson.sugestaoMetas;

                    let confirmationHTML = `<p>Posso adicionar essa(s) meta(s) na sua página? Quer que eu adicione qual?</p>
                                            <div class="bot-options-container">`;

                    pendingGoals.forEach((goal, index) => {
                        confirmationHTML += `<button class="confirm-btn" data-action="meta-${index + 1}">Meta ${index + 1}: ${goal.title}</button>`;
                    });
                    
                    if(pendingGoals.length > 1) {
                         confirmationHTML += `<button class="confirm-btn" data-action="all">Todas as Metas</button>`;
                    }
                   
                    confirmationHTML += `<button class="more-goals-btn">Ver mais metas</button></div>`;
                    appendMessage(confirmationHTML, 'bot bot-options', true);
                }
            } else {
                appendMessage(botResponse, 'bot');
            }
             chatHistory.push({ role: 'assistant', content: botResponse });

        } catch (error) {
            console.error("Erro na API da OpenAI:", error);
            typingIndicator.remove();
            appendMessage("Desculpe, estou com problemas no momento. Tente novamente mais tarde.", 'bot');
        }
    }
});

