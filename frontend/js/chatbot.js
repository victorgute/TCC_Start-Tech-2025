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
            e.target.closest('.bot-options')?.remove();
            appendMessage(question, 'user');
            getAIResponse(question, null);
        }
    }

    function handleConfirmation(e) {
        if (e.target.classList.contains('confirm-btn') && pendingGoal) {
            const confirmation = e.target.dataset.confirm === 'yes';
            e.target.closest('.bot-options').remove();
            if (confirmation) {
                const addGoalEvent = new CustomEvent('add-goal-from-chat', { detail: pendingGoal });
                document.dispatchEvent(addGoalEvent);
                appendMessage(`Certo! Adicionei a meta "${pendingGoal.title}" na sua página de Metas.`, 'bot');
            } else {
                appendMessage('Entendido. A meta não foi adicionada.', 'bot');
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
            const filePreviewHTML = file.type.startsWith('image/')
                ? `<img src="${event.target.result}" alt="${file.name}">`
                : `<div class="file-preview"><i class="fas fa-file-alt"></i> ${file.name}</div>`;
            appendMessage(`Anexei o seguinte arquivo:<br>${filePreviewHTML}`, 'user', true, `[Arquivo Anexado: ${file.name}]`);
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
        chatbotContainer.style.left = '';
        chatbotContainer.style.top = '';
        chatbotContainer.style.right = '20px';
        chatbotContainer.style.bottom = '20px';
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

    function onDragStart(event) {
        if (chatWidget.classList.contains('fullscreen') || event.target !== chatHeader) return;
        isDragging = true;
        const rect = chatbotContainer.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;
        document.addEventListener('mousemove', onDragging);
        document.addEventListener('mouseup', onDragEnd);
    }

    function onDragging(event) {
        if (!isDragging) return;
        event.preventDefault();
        let newX = event.clientX - offsetX;
        let newY = event.clientY - offsetY;
        chatbotContainer.style.left = `${newX}px`;
        chatbotContainer.style.top = `${newY}px`;
        chatbotContainer.style.right = 'auto';
        chatbotContainer.style.bottom = 'auto';
    }

    function onDragEnd() {
        isDragging = false;
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
                speechToTextBtn.classList.add('is-recording');
            } catch (error) {
                alert("Não foi possível acessar seu microfone.");
            }
        } else {
            mediaRecorder.stop();
            isRecording = false;
            speechToTextBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            speechToTextBtn.classList.remove('is-recording');
        }
    });

    async function transcribeAudio(audioBlob) {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
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
            if (!response.ok) throw new Error('Erro da API da OpenAI.');
            const data = await response.json();
            chatInput.value = data.text;
        } catch (error) {
            alert("Ocorreu um erro ao transcrever o áudio.");
        } finally {
            chatInput.placeholder = "Digite sua pergunta sobre ESG...";
        }
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageText = chatInput.value.trim();
        if (!messageText && !attachedFile) return;
        if (messageText) appendMessage(messageText, 'user');
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
            chatHistory.push({ 
                role: sender.includes('user') ? 'user' : 'bot', 
                content: historyContent || content, 
            });
        }
    }
    
    async function getAIResponse(userInput, file) {
        appendMessage('<div class="typing-indicator"><span></span><span></span><span></span></div>', 'bot typing-indicator', true);
        const typingIndicator = chatMessages.lastChild;
        await new Promise(resolve => setTimeout(resolve, 1500));
        typingIndicator.remove();

        if (file || userInput.toLowerCase().includes('analis')) {
            pendingGoal = { title: `Redução do Consumo de Água`, description: `Reduzir em 15% o consumo de água.`, progress: 0, deadline: 2026, category: 'Ambiental' };
            const response = `<p>Analisei seu dashboard. Sugiro uma meta de redução de 15% no consumo de água. Posso adicioná-la?</p>
            <div class="bot-options-container"><button class="confirm-btn" data-confirm="yes">Sim</button><button class="confirm-btn" data-confirm="no">Não</button></div>`;
            appendMessage(response, 'bot bot-options', true);
        } else if (userInput.toLowerCase().includes('o que é esg')) {
            appendMessage("ESG significa Environmental, Social, and Governance (Ambiental, Social e Governança).", 'bot');
        } else {
            appendMessage("Não tenho certeza de como ajudar. Tente uma das opções abaixo.", 'bot');
            showQuickReplies();
        }
    }
});