/**
 * @file Gerencia toda a lógica do Chatbot Assistente ESG, incluindo a interface,
 * interações do usuário, comunicação com a API da OpenAI e funcionalidades
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
                filePreviewHTML = `<img src="${event.target.result}" alt="${file.name}" style="max-width: 100%; border-radius: 8px;">`;
            } else {
                filePreviewHTML = `<div class="file-preview" style="padding: 10px; background-color: #f0f0f0; border-radius: 8px;"><i class="fas fa-file-alt"></i> ${file.name}</div>`;
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
        if (chatMessages.children.length === 0) {
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
        if (chatHistory.length > 0) {
            console.log("Histórico da Conversa:", JSON.stringify(chatHistory, null, 2));
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

    function onDragStart(event) {
        if (chatbotContainer.classList.contains('fullscreen') || event.target.closest('.chat-header-actions')) return;
        
        isDragging = true;
        chatHeader.style.cursor = 'grabbing';
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
        document.removeEventListener('mousemove', onDragging);
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
                appendMessage("Não consegui acessar seu microfone. Por favor, verifique as permissões do navegador.", 'bot');
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
     * Envia o áudio gravado para a API da OpenAI (Whisper) para transcrição.
     * @param {Blob} audioBlob - O áudio gravado como um Blob.
     */
    async function transcribeAudio(audioBlob) {
        // ATENÇÃO: Substitua "COLE_SUA_CHAVE_DA_API_DA_OPENAI_AQUI" pela sua chave de API real.
        const apiKey = "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"; 
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
            appendMessage("Ocorreu um erro ao tentar transcrever o áudio. Tente novamente.", 'bot');
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

        let userMessage = messageText;
        chatInput.value = '';
        
        // Se houver um arquivo, exibe a mensagem de anexo
        if (attachedFile) {
             appendMessage(`Anexei o arquivo: ${attachedFile.name}`, 'user');
        } else {
            appendMessage(userMessage, 'user');
        }
        
        // Obtém a resposta da IA
        await getAIResponse(userMessage, attachedFile);
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
            const p = document.createElement('p');
            p.textContent = content;
            messageElement.appendChild(p);
        }
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        if (!sender.includes('bot-options') && !sender.includes('typing-indicator')) {
            const contentToSave = historyContent !== null ? historyContent : content;
            const role = sender.includes('user') ? 'user' : 'assistant';
            chatHistory.push({ role: role, content: contentToSave });
        }
    }
    
    /**
     * Envia a conversa para a API da OpenAI e processa a resposta.
     * @param {string} userInput - A mensagem do usuário.
     * @param {File|null} file - O arquivo anexado.
     */
    async function getAIResponse(userInput, file) {
        appendMessage('<div class="typing-indicator"><span></span><span></span><span></span></div>', 'bot typing-indicator', true);
        const typingIndicator = chatMessages.lastChild;

        // ATENÇÃO: Substitua pela sua chave da API da OpenAI.
        const apiKey = "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";
        const apiUrl = "https://api.openai.com/v1/chat/completions";
        
        // Prompt do sistema aprimorado para melhor compreensão e respostas
        const systemPrompt = `Você é um Consultor especialista em ESG da empresa EcoManager. Sua função é analisar os dados de dashboards de sustentabilidade (luz, água, resíduos, etc.) e ajudar os usuários a criar metas ESG. Responda de forma clara, objetiva e amigável.
        - Se o usuário informar um nicho (ex: "mercado", "escritório", "indústria"), forneça 3 sugestões de metas ESG específicas para aquele setor.
        - Se o usuário pedir para criar uma meta ou enviar um arquivo para análise, forneça uma análise concisa e um JSON com a sugestão de meta no seguinte formato: \`{\"sugestaoMeta\":{\"title\":\"...\",\"description\":\"...\",\"category\":\"Ambiental|Social|Governança\",\"deadline\":AAAA,\"progress\":0}}\`.
        - Para perguntas gerais sobre ESG, explique o conceito de forma simples.
        - Sempre se comporte como um assistente prestativo.
        - Seja sempre específico antes de criar a meta. Pergunte ao usuário até que ano ele quer alcançar a meta (prazo), quantos % de diminuição ou aumento e uma descrição concisa da meta.`;

        let messages = [
            { role: "system", content: systemPrompt },
            ...chatHistory // Inclui o histórico anterior para dar contexto à IA
        ];

        // Se houver um arquivo, lê o conteúdo e adiciona à mensagem do usuário
        if (file) {
            try {
                const fileContent = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsText(file);
                });
                
                // Adiciona o conteúdo do arquivo à mensagem do usuário para a IA
                userInput += `\n\n--- CONTEÚDO DO ARQUIVO ANEXADO (${file.name}) ---\n${fileContent}\n--- FIM DO ARQUIVO ---`;

            } catch (e) {
                console.error("Não foi possível ler o arquivo de texto.", e);
                appendMessage("Desculpe, só consigo ler o conteúdo de arquivos de texto (.txt, .csv, etc.). Para outros tipos, por favor, descreva o conteúdo.", 'bot');
                typingIndicator.remove();
                return;
            }
        }

        // Adiciona a mensagem atual do usuário ao corpo da requisição
        messages.push({ role: "user", content: userInput });
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4.1-2025-04-14",
                    messages: messages
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro da API: ${errorData.error.message}`);
            }

            const data = await response.json();
            const botResponse = data.choices[0].message.content;

            typingIndicator.remove();
            
            // Tenta extrair um JSON de sugestão de meta da resposta
            try {
                // Regex aprimorada para encontrar o JSON de forma mais robusta
                const jsonMatch = botResponse.match(/```json\s*(\{[\s\S]*?\})\s*```|(\{[\s\S]*?"sugestaoMeta"[\s\S]*?\})/);
                if (jsonMatch) {
                    const jsonString = jsonMatch[1] || jsonMatch[2];
                    const parsedJson = JSON.parse(jsonString);
                    
                    if (parsedJson.sugestaoMeta) {
                        pendingGoal = parsedJson.sugestaoMeta;
                        
                        // Remove o bloco JSON da resposta para uma exibição mais limpa
                        let cleanResponse = botResponse.replace(jsonMatch[0], '').trim();
                        if (cleanResponse) {
                             appendMessage(cleanResponse.replace(/\n/g, '<br>'), 'bot', true);
                        }
                       
                        const confirmationHTML = `<p>Posso adicionar esta meta sugerida na sua página?</p>
                        <div class="bot-options-container">
                            <button class="confirm-btn" data-confirm="yes">Sim, por favor!</button>
                            <button class="confirm-btn" data-confirm="no">Não, obrigado.</button>
                        </div>`;
                        appendMessage(confirmationHTML, 'bot bot-options', true);
                        
                        // Adiciona a resposta da IA (sem o JSON) ao histórico
                        chatHistory.push({ role: 'assistant', content: cleanResponse });
                        return; // Interrompe a função aqui
                    }
                }
            } catch (e) {
                console.error("Erro ao parsear JSON da IA:", e, "String JSON:", botResponse);
                // Se o parse falhar, a resposta completa será exibida abaixo
            }

            // Se não houver JSON de meta, apenas exibe a resposta e adiciona ao histórico
            appendMessage(botResponse.replace(/\n/g, '<br>'), 'bot', true);
            chatHistory.push({ role: 'assistant', content: botResponse });


        } catch (error) {
            console.error("Erro ao chamar a API da OpenAI:", error);
            typingIndicator.remove();
            appendMessage("Desculpe, estou com problemas para me conectar. Verifique sua chave de API e tente novamente mais tarde.", 'bot');
        }
    }
});

// PADRÃO PARA USAR
// model: "gpt-4.1-2025-04-14"
// const apiKey = "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"; 
// const systemPrompt = `Você é um Consultor especialista em ESG da empresa EcoManager. Sua função é analisar os dados de dashboards de sustentabilidade (luz, água, resíduos, etc.) e ajudar os usuários a criar metas ESG. Responda de forma clara, objetiva e amigável.
//         - Se o usuário informar um nicho (ex: "mercado", "escritório", "indústria"), forneça 3 sugestões de metas ESG específicas para aquele setor.
//         - Se o usuário pedir para criar uma meta ou enviar um arquivo para análise, forneça uma análise concisa e um JSON com a sugestão de meta no seguinte formato: \`{\"sugestaoMeta\":{\"title\":\"...\",\"description\":\"...\",\"category\":\"Ambiental|Social|Governança\",\"deadline\":AAAA,\"progress\":0}}\`.
//         - Para perguntas gerais sobre ESG, explique o conceito de forma simples.
//         - Sempre se comporte como um assistente prestativo.
//         - Seja sempre específico antes de criar a meta. Pergunte ao usuário até que ano ele quer alcançar a meta (prazo), quantos % de diminuição ou aumento e uma descrição concisa da meta.`;
