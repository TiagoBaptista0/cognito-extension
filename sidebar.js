document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DA INTERFACE ---
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const clearChatBtn = document.getElementById('clearChat');
    const charCounter = document.getElementById('charCounter');
    
    // Configuração
    const configToggleBtn = document.getElementById('configToggle');
    const configSection = document.getElementById('configSection');
    const saveConfigBtn = document.getElementById('saveConfig');
    const closeConfigBtn = document.getElementById('closeConfig');
    const geminiKeyInput = document.getElementById('geminiKey');
    const trelloKeyInput = document.getElementById('trelloKey');
    const trelloTokenInput = document.getElementById('trelloToken');
    const boardIdInput = document.getElementById('boardId');
    const boardSelector = document.getElementById('boardSelector');
    const currentBoardName = document.getElementById('currentBoardName');
    const listMappingContainer = document.getElementById('listMappingContainer');
    const labelContainer = document.getElementById('labelContainer');

    // Tabs de configuração
    const configTabs = document.querySelectorAll('.config-tab');
    const configTabContents = document.querySelectorAll('.config-tab-content');

    // Seletor de modo
    const modeSelectorBtn = document.getElementById('modeSelectorBtn');
    const modeDropdown = document.getElementById('modeDropdown');
    const currentModeText = document.getElementById('currentModeText');

    // FAQ
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    // --- ESTADO ---
    let config = {};
    let conversationState = { 
        waitingFor: null, 
        data: {},
        projectStep: 0,
        projectSteps: ['name', 'description', 'objectives', 'deadline', 'complexity', 'list_selection', 'confirmation'],
        availableLists: [],
        selectedListId: null
    };
    let currentMode = 'chat';

    // --- TRATAMENTO DE ERROS ROBUSTO ---
    class CognitoError extends Error {
        constructor(message, type, details = null) {
            super(message);
            this.name = 'CognitoError';
            this.type = type;
            this.details = details;
            this.timestamp = new Date().toISOString();
        }
    }

    const ErrorTypes = {
        NETWORK: 'network',
        API: 'api',
        AUTH: 'auth',
        VALIDATION: 'validation',
        UNKNOWN: 'unknown'
    };

    function handleError(error, context = '') {
        console.error(`[Cognito Error - ${context}]`, error);
        
        let userMessage = '';
        let icon = '';
        
        if (error instanceof CognitoError) {
            switch (error.type) {
                case ErrorTypes.NETWORK:
                    icon = '🌐';
                    userMessage = `Erro de conexão: ${error.message}. Verifique sua internet e tente novamente.`;
                    break;
                case ErrorTypes.API:
                    icon = '🔌';
                    userMessage = `Erro na API: ${error.message}. Verifique suas credenciais nas configurações.`;
                    break;
                case ErrorTypes.AUTH:
                    icon = '🔐';
                    userMessage = `Erro de autenticação: ${error.message}. Suas credenciais podem estar incorretas ou expiradas.`;
                    break;
                case ErrorTypes.VALIDATION:
                    icon = '⚠️';
                    userMessage = `Validação: ${error.message}`;
                    break;
                default:
                    icon = '❌';
                    userMessage = `Erro: ${error.message}`;
            }
        } else {
            icon = '❌';
            userMessage = `Erro inesperado: ${error.message || 'Algo deu errado'}. Tente novamente.`;
        }
        
        addMessage(`${icon} ${userMessage}`, 'assistant');
        
        // Log para debug (pode ser enviado para analytics)
        logError({
            error: error.message,
            type: error.type || ErrorTypes.UNKNOWN,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
    }

    function logError(errorData) {
        // Armazena logs de erro localmente para debug
        chrome.storage.local.get(['errorLogs'], (result) => {
            const logs = result.errorLogs || [];
            logs.push(errorData);
            
            // Mantém apenas os últimos 50 erros
            if (logs.length > 50) logs.shift();
            
            chrome.storage.local.set({ errorLogs: logs });
        });
    }

    function validateConfig() {
        const errors = [];
        
        if (!config.geminiKey?.trim()) {
            errors.push('API Key do Gemini não configurada');
        }
        
        if (!config.trelloKey?.trim()) {
            errors.push('API Key do Trello não configurada');
        }
        
        if (!config.trelloToken?.trim()) {
            errors.push('Token do Trello não configurado');
        }
        
        if (!config.boardId?.trim()) {
            errors.push('Board do Trello não selecionado');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    // --- FUNÇÕES DE INTERFACE ---
    function addMessage(text, sender) {
        const welcomeSection = chatContainer.querySelector('.welcome-section');
        if (welcomeSection) welcomeSection.remove();

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.innerHTML = formatMessage(text);
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function formatMessage(text) {
        text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return text.replace(/\n/g, '<br>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="message-link">$1</a>');
    }

    function updateCharCounter() {
        const currentLength = userInput.value.length;
        charCounter.textContent = `${currentLength}/2000`;
        
        if (currentLength > 1800) {
            charCounter.style.color = 'var(--error)';
        } else if (currentLength > 1500) {
            charCounter.style.color = 'var(--warning)';
        } else {
            charCounter.style.color = 'var(--text-muted)';
        }
    }

    function autoResizeTextarea() {
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'assistant-message', 'typing-indicator');
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        chatContainer.appendChild(typingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }
    
    // --- CONFIGURAÇÃO ---
    function loadConfig() {
        chrome.storage.sync.get(['geminiKey', 'trelloKey', 'trelloToken', 'boardId'], (result) => {
            config = result;
            geminiKeyInput.value = result.geminiKey || '';
            trelloKeyInput.value = result.trelloKey || '';
            trelloTokenInput.value = result.trelloToken || '';
            boardIdInput.value = result.boardId || '';
            updateStatusIndicators();
            if (config.boardId) loadBoardDetails(config.boardId);
        });
    }

    function updateStatusIndicators() {
        const geminiStatus = document.getElementById('geminiStatus');
        const trelloStatus = document.getElementById('trelloStatus');
        
        geminiStatus.classList.toggle('connected', config.geminiKey?.trim());
        geminiStatus.classList.toggle('error', !config.geminiKey?.trim());
        
        trelloStatus.classList.toggle('connected', config.trelloKey && config.trelloToken && config.boardId);
        trelloStatus.classList.toggle('error', !(config.trelloKey && config.trelloToken && config.boardId));
    }

    async function loadUserBoards() {
        if (!config.trelloKey || !config.trelloToken) {
            boardSelector.innerHTML = '<option>Credenciais Trello necessárias</option>';
            return;
        }

        boardSelector.innerHTML = '<option>Carregando boards...</option>';
        
        try {
            const response = await fetch(`https://api.trello.com/1/members/me/boards?key=${config.trelloKey}&token=${config.trelloToken}&filter=open`);
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new CognitoError('Credenciais inválidas ou expiradas', ErrorTypes.AUTH);
                }
                throw new CognitoError('Erro ao buscar boards', ErrorTypes.API);
            }
            
            const boards = await response.json();
            boardSelector.innerHTML = '<option value="">Selecione um board</option>';
            
            boards.forEach(board => {
                const option = document.createElement('option');
                option.value = board.id;
                option.textContent = board.name;
                if (board.id === config.boardId) option.selected = true;
                boardSelector.appendChild(option);
            });
        } catch (error) {
            if (error instanceof CognitoError) {
                boardSelector.innerHTML = `<option>${error.message}</option>`;
                handleError(error, 'loadUserBoards');
            } else {
                throw new CognitoError('Erro de rede ao buscar boards', ErrorTypes.NETWORK, error);
            }
        }
    }
    
    async function loadBoardDetails(boardId) {
        if (!boardId || !config.trelloKey || !config.trelloToken) return;

        currentBoardName.textContent = 'Carregando...';
        listMappingContainer.textContent = 'Carregando...';
        labelContainer.textContent = 'Carregando...';

        try {
            const [listsRes, labelsRes, boardRes] = await Promise.all([
                fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${config.trelloKey}&token=${config.trelloToken}`),
                fetch(`https://api.trello.com/1/boards/${boardId}/labels?key=${config.trelloKey}&token=${config.trelloToken}`),
                fetch(`https://api.trello.com/1/boards/${boardId}?key=${config.trelloKey}&token=${config.trelloToken}`)
            ]);

            if (!listsRes.ok || !labelsRes.ok || !boardRes.ok) {
                throw new CognitoError('Falha ao carregar detalhes do board', ErrorTypes.API);
            }

            const lists = await listsRes.json();
            const labels = await labelsRes.json();
            const board = await boardRes.json();

            currentBoardName.textContent = board.name;
            
            listMappingContainer.innerHTML = lists.map(list => 
                `<p style="margin: 4px 0; font-size: 12px;">• ${list.name}</p>`
            ).join('');

            labelContainer.innerHTML = labels.length === 0 
                ? '<span style="font-size: 12px;">Nenhuma etiqueta</span>'
                : labels.map(label => 
                    `<span style="background: ${getLabelColor(label.color)}; padding: 2px 6px; border-radius: 4px; color: white; font-size: 11px;">${label.name || '(sem nome)'}</span>`
                  ).join('');

        } catch (error) {
            currentBoardName.textContent = `Erro ao carregar`;
            handleError(error, 'loadBoardDetails');
        }
    }

    function getLabelColor(colorName) {
        const colors = {
            green: '#61bd4f', yellow: '#f2d600', orange: '#ff9f1a', red: '#eb5a46',
            purple: '#c377e0', blue: '#0079bf', sky: '#00c2e0', lime: '#51e898',
            pink: '#ff78cb', black: '#344563'
        };
        return colors[colorName] || '#999';
    }

    // --- TABS DE CONFIGURAÇÃO ---
    configTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            configTabs.forEach(t => t.classList.remove('active'));
            configTabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.querySelector(`[data-content="${targetTab}"]`).classList.add('active');
        });
    });

    // --- FAQ INTERATIVO ---
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const wasOpen = faqItem.classList.contains('open');
            
            // Fecha todos os outros itens
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('open');
            });
            
            // Abre o item clicado se estava fechado
            if (!wasOpen) {
                faqItem.classList.add('open');
            }
        });
    });

    // Event listeners de configuração
    configToggleBtn.addEventListener('click', () => {
        configSection.classList.add('show');
        loadUserBoards();
    });
    
    closeConfigBtn.addEventListener('click', () => configSection.classList.remove('show'));
    configSection.addEventListener('click', (e) => {
        if (e.target === configSection) configSection.classList.remove('show');
    });

    saveConfigBtn.addEventListener('click', () => {
        const newConfig = {
            geminiKey: geminiKeyInput.value.trim(),
            trelloKey: trelloKeyInput.value.trim(),
            trelloToken: trelloTokenInput.value.trim(),
            boardId: boardIdInput.value.trim()
        };
        
        chrome.storage.sync.set(newConfig, () => {
            config = newConfig;
            updateStatusIndicators();
            configSection.classList.remove('show');
            addMessage('✅ Configurações salvas com sucesso!', 'assistant');
        });
    });

    boardSelector.addEventListener('change', () => {
        const newBoardId = boardSelector.value;
        if (newBoardId) {
            boardIdInput.value = newBoardId;
            config.boardId = newBoardId;
            chrome.storage.sync.set({ boardId: newBoardId });
            loadBoardDetails(newBoardId);
        }
    });

    // --- FUNÇÕES AUXILIARES ---
    function findSelectedList(userInput, lists) {
        const input = userInput.trim().toLowerCase();
        
        const numberMatch = input.match(/^\d+$/);
        if (numberMatch) {
            const index = parseInt(numberMatch[0]) - 1;
            if (index >= 0 && index < lists.length) {
                return lists[index];
            }
        }
        
        let found = lists.find(list => list.name.toLowerCase() === input);
        if (found) return found;
        
        found = lists.find(list => list.name.toLowerCase().includes(input));
        if (found) return found;
        
        return null;
    }

    async function askForTargetList() {
        try {
            const listsRes = await fetch(`https://api.trello.com/1/boards/${config.boardId}/lists?key=${config.trelloKey}&token=${config.trelloToken}`);
            
            if (!listsRes.ok) {
                throw new CognitoError('Erro ao buscar listas', ErrorTypes.API);
            }
            
            const lists = await listsRes.json();
            conversationState.availableLists = lists;
            
            chrome.storage.sync.get(['preferredListId'], (result) => {
                let listOptions = '**Listas disponíveis no seu board:**\n\n';
                lists.forEach((list, index) => {
                    const isPreferred = list.id === result.preferredListId ? ' ⭐ (padrão)' : '';
                    listOptions += `${index + 1}. ${list.name}${isPreferred}\n`;
                });
                
                addMessage(`${listOptions}\n\n**Em qual lista deseja criar os cards?** Digite o **número** ou o **nome** da lista.`, 'assistant');
            });
            
        } catch (error) {
            handleError(error, 'askForTargetList');
            conversationState.projectStep = conversationState.projectSteps.indexOf('confirmation');
            conversationState.waitingFor = 'project_confirmation';
            addMessage('Digite **"sim"** para criar o projeto ou **"não"** para cancelar.', 'assistant');
        }
    }

    // --- SELETOR DE MODO ---
    function switchMode(newMode) {
        currentMode = newMode;
        conversationState = { 
            waitingFor: null, 
            data: {},
            projectStep: 0,
            projectSteps: ['name', 'description', 'objectives', 'deadline', 'complexity', 'list_selection', 'confirmation'],
            availableLists: [],
            selectedListId: null
        };
        
        const modes = {
            chat: { text: 'Chat Inteligente', placeholder: 'Faça uma pergunta ou peça ajuda...' },
            project: { text: 'Planejamento de Projeto', placeholder: 'Descreva sua ideia de projeto...' }
        };
        
        currentModeText.textContent = modes[newMode].text;
        userInput.placeholder = modes[newMode].placeholder;
        modeDropdown.parentElement.classList.remove('open');

        if (newMode === 'project') handleProjectMode();
    }

    modeSelectorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        modeDropdown.parentElement.classList.toggle('open');
    });

    document.querySelectorAll('.mode-dropdown .mode-option').forEach(option => {
        if (option.dataset.mode === 'chat' || option.dataset.mode === 'project') {
            option.addEventListener('click', () => switchMode(option.dataset.mode));
        }
    });

    document.addEventListener('click', (e) => {
        if (!modeSelectorBtn.parentElement.contains(e.target)) {
            modeDropdown.parentElement.classList.remove('open');
        }
    });

    // --- FUNÇÕES DE WORKFLOW DO PROJETO ---
    async function handleUserInput() {
        const userText = userInput.value.trim();
        if (!userText) return;

        addMessage(userText, 'user');
        userInput.value = '';
        updateCharCounter();
        autoResizeTextarea();
        
        if (conversationState.waitingFor?.startsWith('project_')) {
            await handleProjectWorkflow(userText);
            return;
        }

        if (currentMode === 'chat') {
            await handleChatMode(userText);
        }
    }

    async function handleChatMode(userText) {
        try {
            const validation = validateConfig();
            if (!validation.valid) {
                throw new CognitoError(
                    `Configure as APIs primeiro: ${validation.errors.join(', ')}`,
                    ErrorTypes.VALIDATION
                );
            }
            
            showTypingIndicator();
            const response = await generateGeminiContent(userText, config.geminiKey);
            hideTypingIndicator();
            addMessage(response, 'assistant');
            
        } catch (error) {
            hideTypingIndicator();
            handleError(error, 'handleChatMode');
        }
    }

    function handleProjectMode() {
        const validation = validateConfig();
        if (!validation.valid) {
            addMessage(`⚙️ Configure as APIs primeiro: ${validation.errors.join(', ')}`, 'assistant');
            return;
        }
        
        conversationState.waitingFor = 'project_name';
        conversationState.projectStep = 0;
        conversationState.data = {};
        
        addMessage('🚀 Vamos criar um plano de projeto! Qual é o **nome do projeto**?', 'assistant');
    }

    async function handleProjectWorkflow(userText) {
        const step = conversationState.projectSteps[conversationState.projectStep];
        
        try {
            switch (step) {
                case 'name':
                    conversationState.data.name = userText;
                    conversationState.projectStep++;
                    conversationState.waitingFor = 'project_description';
                    addMessage(`📋 Ótimo! Agora descreva: **o que é o projeto "${userText}"?**`, 'assistant');
                    break;
                    
                case 'description':
                    conversationState.data.description = userText;
                    conversationState.projectStep++;
                    conversationState.waitingFor = 'project_objectives';
                    addMessage('🎯 Perfeito! Quais são os **principais objetivos** deste projeto?', 'assistant');
                    break;
                    
                case 'objectives':
                    conversationState.data.objectives = userText;
                    conversationState.projectStep++;
                    conversationState.waitingFor = 'project_deadline';
                    addMessage('📅 Qual é o **prazo** para conclusão? (ex: 30 dias, 2 meses, 15/12/2025)', 'assistant');
                    break;
                    
                case 'deadline':
                    conversationState.data.deadline = userText;
                    conversationState.projectStep++;
                    conversationState.waitingFor = 'project_complexity';
                    addMessage('⚡ Como classificaria a **complexidade**? (Digite: **simples**, **médio** ou **complexo**)', 'assistant');
                    break;
                    
                case 'complexity':
                    conversationState.data.complexity = userText.toLowerCase();
                    conversationState.projectStep++;
                    conversationState.waitingFor = 'project_list_selection';
                    await askForTargetList();
                    break;
                    
                case 'list_selection':
                    const selectedList = findSelectedList(userText, conversationState.availableLists);
                    
                    if (selectedList) {
                        conversationState.selectedListId = selectedList.id;
                        chrome.storage.sync.set({ preferredListId: selectedList.id });
                        
                        addMessage(`✅ Lista selecionada: **${selectedList.name}**

📊 **Resumo Final do Projeto:**

**Nome:** ${conversationState.data.name}
**Descrição:** ${conversationState.data.description}
**Objetivos:** ${conversationState.data.objectives}
**Prazo:** ${conversationState.data.deadline}
**Complexidade:** ${conversationState.data.complexity}
**Lista destino:** ${selectedList.name}

Digite **"sim"** para criar o projeto ou **"não"** para cancelar.`, 'assistant');
                        
                        conversationState.projectStep++;
                        conversationState.waitingFor = 'project_confirmation';
                    } else {
                        let listOptions = '⚠️ **Opção inválida!** Por favor, escolha uma lista válida:\n\n';
                        conversationState.availableLists.forEach((list, index) => {
                            listOptions += `${index + 1}. ${list.name}\n`;
                        });
                        listOptions += '\nDigite o **número** (ex: 1, 2, 3) ou o **nome da lista**:';
                        addMessage(listOptions, 'assistant');
                    }
                    break;
                    
                case 'confirmation':
                    if (userText.toLowerCase().includes('sim')) {
                        await createProjectPlan();
                    } else {
                        conversationState.waitingFor = null;
                        conversationState.data = {};
                        conversationState.projectStep = 0;
                        addMessage('❌ Projeto cancelado', 'assistant');
                    }
                    break;
                    
                default:
                    throw new CognitoError('Passo desconhecido no fluxo', ErrorTypes.VALIDATION);
            }
        } catch (error) {
            handleError(error, 'handleProjectWorkflow');
            conversationState.waitingFor = null;
            conversationState.data = {};
            conversationState.projectStep = 0;
        }
    }

    async function createProjectPlan() {
        try {
            showTypingIndicator();
            addMessage('🤖 Gerando plano detalhado...', 'assistant');
            
            const prompt = `Crie uma lista NUMERADA com MÍNIMO 15 tarefas específicas para este projeto:

**PROJETO:** ${conversationState.data.name}
**DESCRIÇÃO:** ${conversationState.data.description}
**OBJETIVOS:** ${conversationState.data.objectives}
**PRAZO:** ${conversationState.data.deadline}
**COMPLEXIDADE:** ${conversationState.data.complexity}

**FORMATO OBRIGATÓRIO:**
1. Primeira tarefa específica e acionável
2. Segunda tarefa específica e acionável
3. Terceira tarefa específica e acionável
[... continue até pelo menos 15 tarefas]

**REGRAS:**
- Cada tarefa deve ser específica e clara
- Numere todas as tarefas (1. 2. 3. etc.)
- Inclua tarefas de planejamento, execução e entrega
- Mínimo 15, máximo 30 tarefas`;

            let planDetails = await generateGeminiContent(prompt, config.geminiKey);
            
            if (!planDetails || planDetails.length < 50) {
                planDetails = generateFallbackPlan(conversationState.data);
            }
            
            hideTypingIndicator();
            addMessage(`📋 **Plano Gerado:**\n\n${planDetails}`, 'assistant');
            
            addMessage('📄 Criando cards no Trello...', 'assistant');
            await createTrelloCards(planDetails);
            
        } catch (error) {
            hideTypingIndicator();
            handleError(error, 'createProjectPlan');
        } finally {
            conversationState.waitingFor = null;
            conversationState.data = {};
            conversationState.projectStep = 0;
        }
    }

    function generateFallbackPlan(projectData) {
        return `**Plano Padrão para: ${projectData.name}**

1. Análise detalhada dos requisitos do projeto
2. Definição da arquitetura e tecnologias necessárias
3. Criação do cronograma detalhado de entregas
4. Setup do ambiente de desenvolvimento
5. Definição dos padrões e boas práticas
6. Implementação da estrutura base do projeto
7. Desenvolvimento das funcionalidades principais
8. Criação da interface do usuário
9. Integração entre componentes
10. Implementação de testes unitários
11. Testes de integração completos
12. Criação da documentação técnica
13. Testes de usabilidade e ajustes
14. Correção de bugs identificados
15. Preparação para deploy em produção
16. Deploy e monitoramento inicial
17. Treinamento da equipe
18. Coleta de feedback inicial
19. Ajustes finais baseados no feedback
20. Entrega final e documentação completa`;
    }

    async function createTrelloCards(planDetails) {
        try {
            const priorityLabels = await ensurePriorityLabels();
            window.priorityLabelIds = priorityLabels;
            
            const listsRes = await fetch(`https://api.trello.com/1/boards/${config.boardId}/lists?key=${config.trelloKey}&token=${config.trelloToken}`);
            
            if (!listsRes.ok) {
                throw new CognitoError('Erro ao acessar listas do Trello', ErrorTypes.API);
            }
            
            const lists = await listsRes.json();
            
            let todoList;
            if (conversationState.selectedListId) {
                todoList = lists.find(list => list.id === conversationState.selectedListId);
            }
            
            if (!todoList) {
                todoList = lists.find(list => 
                    list.name.toLowerCase().includes('todo') || 
                    list.name.toLowerCase().includes('fazer') ||
                    list.name.toLowerCase().includes('backlog') ||
                    list.name.toLowerCase().includes('pendente') ||
                    list.name.toLowerCase().includes('ideias')
                ) || lists[0];
            }

            const taskMatches = planDetails.match(/^\d+\.\s+.+$/gm) || [];
            const tasks = taskMatches.slice(0, 30);
            
            if (tasks.length === 0) {
                throw new CognitoError('Nenhuma tarefa encontrada no plano', ErrorTypes.VALIDATION);
            }

            let created = 0;
            const totalTasks = tasks.length;
            
            for (let i = 0; i < tasks.length; i++) {
                const task = tasks[i];
                const taskName = task.replace(/^\d+\.\s+/, '').trim();
                const priority = determinePriority(i, totalTasks, conversationState.data.complexity);
                
                const cardData = {
                    key: config.trelloKey,
                    token: config.trelloToken,
                    idList: todoList.id,
                    name: taskName,
                    desc: `**Projeto:** ${conversationState.data.name}\n\n**Prioridade:** ${priority.name}\n\n**Contexto:** ${conversationState.data.description}\n\n**Tarefa:** ${taskName}\n\n**Posição:** ${i + 1} de ${totalTasks}`
                };
                
                if (priority.labelId) {
                    cardData.idLabels = priority.labelId;
                }
                
                const response = await fetch('https://api.trello.com/1/cards', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cardData)
                });

                if (!response.ok) {
                    throw new CognitoError(`Erro ao criar card ${i + 1}`, ErrorTypes.API);
                }
                
                created++;
                if (created % 5 === 0 || created === totalTasks) {
                    addMessage(`✅ ${created}/${totalTasks} cards criados...`, 'assistant');
                }
                
                await new Promise(resolve => setTimeout(resolve, 150));
            }

            addMessage(`🎉 **Projeto criado com sucesso!**

✅ **${created} cards** criados no Trello
📋 Lista: **${todoList.name}**
🏷️ Etiquetas de prioridade aplicadas
📊 Cards organizados por importância`, 'assistant');
            
        } catch (error) {
            handleError(error, 'createTrelloCards');
        }
    }

    async function ensurePriorityLabels() {
        try {
            const labelsRes = await fetch(`https://api.trello.com/1/boards/${config.boardId}/labels?key=${config.trelloKey}&token=${config.trelloToken}`);
            if (!labelsRes.ok) return { high: null, medium: null, low: null };
            
            const labels = await labelsRes.json();
            const priorityLabels = { high: null, medium: null, low: null };
            
            priorityLabels.high = labels.find(l => 
                l.name.toLowerCase().includes('alta') || 
                l.name.toLowerCase().includes('high') ||
                l.name === 'Prioridade Alta'
            )?.id;
            
            priorityLabels.medium = labels.find(l => 
                l.name.toLowerCase().includes('média') || 
                l.name.toLowerCase().includes('media') ||
                l.name.toLowerCase().includes('medium') ||
                l.name === 'Prioridade Média'
            )?.id;
            
            priorityLabels.low = labels.find(l => 
                l.name.toLowerCase().includes('baixa') || 
                l.name.toLowerCase().includes('low') ||
                l.name === 'Prioridade Baixa'
            )?.id;
            
            const labelsToCreate = [
                { key: 'high', name: 'Prioridade Alta', color: 'red' },
                { key: 'medium', name: 'Prioridade Média', color: 'yellow' },
                { key: 'low', name: 'Prioridade Baixa', color: 'blue' }
            ];
            
            for (const labelData of labelsToCreate) {
                if (!priorityLabels[labelData.key]) {
                    try {
                        const response = await fetch('https://api.trello.com/1/labels', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                key: config.trelloKey,
                                token: config.trelloToken,
                                name: labelData.name,
                                color: labelData.color,
                                idBoard: config.boardId
                            })
                        });
                        
                        if (response.ok) {
                            const newLabel = await response.json();
                            priorityLabels[labelData.key] = newLabel.id;
                        }
                    } catch (error) {
                        console.error(`Erro ao criar etiqueta ${labelData.name}:`, error);
                    }
                }
            }
            
            return priorityLabels;
            
        } catch (error) {
            console.error('Erro ao gerenciar etiquetas:', error);
            return { high: null, medium: null, low: null };
        }
    }

    function determinePriority(taskIndex, totalTasks, complexity) {
        const progressPercentage = (taskIndex / totalTasks) * 100;
        
        if (!window.priorityLabelIds) {
            window.priorityLabelIds = { high: null, medium: null, low: null };
        }
        
        let priorityName, labelKey;
        
        if (complexity === 'complexo') {
            if (progressPercentage < 20) {
                priorityName = 'Alta';
                labelKey = 'high';
            } else if (progressPercentage < 60) {
                priorityName = 'Média';
                labelKey = 'medium';
            } else {
                priorityName = 'Baixa';
                labelKey = 'low';
            }
        } else if (complexity === 'médio' || complexity === 'medio') {
            if (progressPercentage < 15) {
                priorityName = 'Alta';
                labelKey = 'high';
            } else if (progressPercentage < 50) {
                priorityName = 'Média';
                labelKey = 'medium';
            } else {
                priorityName = 'Baixa';
                labelKey = 'low';
            }
        } else {
            if (progressPercentage < 10) {
                priorityName = 'Alta';
                labelKey = 'high';
            } else if (progressPercentage < 35) {
                priorityName = 'Média';
                labelKey = 'medium';
            } else {
                priorityName = 'Baixa';
                labelKey = 'low';
            }
        }
        
        return {
            name: priorityName,
            labelId: window.priorityLabelIds?.[labelKey] || null
        };
    }

    // --- API GEMINI ---
    async function generateGeminiContent(prompt, apiKey) {
        if (!apiKey) {
            throw new CognitoError('API Key do Gemini não configurada', ErrorTypes.VALIDATION);
        }
        
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048
                    }
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                if (response.status === 401 || response.status === 403) {
                    throw new CognitoError('API Key inválida ou sem permissão', ErrorTypes.AUTH);
                }
                throw new CognitoError(error.error?.message || 'Erro na API Gemini', ErrorTypes.API);
            }
            
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!text || text.trim().length < 10) {
                throw new CognitoError('Resposta vazia da API', ErrorTypes.API);
            }
            
            return text.trim();
            
        } catch (error) {
            if (error instanceof CognitoError) {
                throw error;
            }
            throw new CognitoError('Erro de conexão com Gemini AI', ErrorTypes.NETWORK, error);
        }
    }

    // --- EVENT LISTENERS ---
    sendButton.addEventListener('click', handleUserInput);
    
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserInput();
        }
    });

    userInput.addEventListener('input', () => {
        updateCharCounter();
        autoResizeTextarea();
    });
    
    clearChatBtn.addEventListener('click', () => {
        conversationState = { 
            waitingFor: null, 
            data: {},
            projectStep: 0,
            projectSteps: ['name', 'description', 'objectives', 'deadline', 'complexity', 'list_selection', 'confirmation'],
            availableLists: [],
            selectedListId: null
        };
        
        chatContainer.innerHTML = `
            <div class="welcome-section">
                <div><img src="icons/icon-128.png" alt="Cognito Logo"></div>
                <h3>Como posso ajudar hoje?</h3>
                <p>Escolha uma opção abaixo ou digite sua pergunta</p>
            </div>
        `;
    });

    // Inicializa
    loadConfig();
    updateCharCounter();
});