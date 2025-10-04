# 🧠 Cognito Assistant

Assistente de IA inteligente integrado ao navegador para planejamento de projetos e produtividade.

## 📋 Sobre

Cognito Assistant é uma extensão para navegadores baseados em Chromium que combina o poder da IA Gemini com a organização do Trello. Através de uma interface elegante na barra lateral, você pode conversar com uma IA, planejar projetos complexos e criar automaticamente cards organizados no Trello.

## ✨ Funcionalidades

### 🤖 Chat Inteligente
- Conversação natural com IA usando Gemini 2.5 Flash
- Respostas contextualizadas e relevantes
- Interface moderna e responsiva

### 🚀 Planejamento de Projeto
- Fluxo guiado de criação de projetos
- Geração automática de 15-30 tarefas detalhadas
- Análise de complexidade e prazos
- Criação automática de cards no Trello
- Atribuição inteligente de prioridades

### 🎯 Integração com Trello
- Seleção de boards e listas
- Criação automática de etiquetas de prioridade
- Sincronização em tempo real
- Mapeamento completo de listas e labels

### ⚙️ Sistema de Configuração
- Gerenciamento seguro de credenciais
- Interface intuitiva com abas organizadas
- FAQ completo e documentação integrada
- Indicadores de status em tempo real

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **APIs**: 
  - Google Gemini AI (generativelanguage.googleapis.com)
  - Trello REST API
- **Chrome APIs**: 
  - chrome.storage (sincronização de dados)
  - chrome.sidePanel (interface lateral)
  - chrome.runtime (comunicação)
  - chrome.tabs (acesso a abas)

## 📦 Instalação

### Requisitos
- Navegador baseado em Chromium (Chrome, Edge, Brave, etc.)
- Conta Google (para API Gemini)
- Conta Trello (para integração)

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/cognito-assistant.git
cd cognito-assistant
```

2. **Instale no navegador**
   - Abra `chrome://extensions/` (ou `edge://extensions/`)
   - Ative o "Modo do desenvolvedor"
   - Clique em "Carregar sem compactação"
   - Selecione a pasta do projeto

3. **Configure as credenciais**
   - Clique no ícone da extensão
   - Acesse as Configurações (ícone de engrenagem)
   - Siga as instruções na aba "Ajuda"

## 🔑 Obtendo Credenciais

### API Key do Gemini
1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie e cole nas configurações

### Credenciais do Trello
1. Acesse [Trello API Key](https://trello.com/app-key)
2. Copie a **API Key**
3. Clique no link "Token" e autorize
4. Copie o **Token** gerado
5. Cole ambos nas configurações

## 🎨 Estrutura do Projeto

```
cognito-assistant/
│
├── manifest.json           # Configuração da extensão
├── background.js           # Service worker
├── content_script.js       # Script de conteúdo
│
├── sidebar.html            # Interface principal
├── sidebar.js              # Lógica da interface
├── styles.css              # Estilos
│
├── icons/                  # Ícones da extensão
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
│
├── README.md               # Este arquivo
├── PRIVACY.md              # Política de privacidade
└── LICENSE                 # Licença MIT
```

## 💡 Como Usar

### Modo Chat Inteligente
1. Abra a extensão clicando no ícone
2. Digite sua pergunta no campo de texto
3. Pressione Enter ou clique no botão enviar
4. Receba respostas contextualizadas da IA

### Modo Planejamento de Projeto
1. Selecione "Planejamento de Projeto" no seletor de modo
2. Responda as perguntas sequenciais:
   - Nome do projeto
   - Descrição detalhada
   - Objetivos principais
   - Prazo de conclusão
   - Complexidade (simples/médio/complexo)
   - Lista destino no Trello
3. Confirme o plano gerado
4. Aguarde a criação automática dos cards

## 🔒 Segurança e Privacidade

- **Armazenamento Local**: Credenciais armazenadas apenas no Chrome Storage
- **Sem Servidores Externos**: Comunicação direta com APIs oficiais
- **Criptografia**: Dados protegidos pelo Chrome
- **Código Aberto**: Transparência total no funcionamento

Leia nossa [Política de Privacidade](PRIVACY.md) completa.

## 🐛 Solução de Problemas

### Erro na API do Gemini
- Verifique se a API Key está correta
- Confirme se não excedeu o limite gratuito
- Teste gerando uma nova chave

### Erro no Trello
- Verifique API Key e Token
- Confirme se o board existe
- Tente gerar novas credenciais

### Cards não são criados
- Verifique as permissões do Trello
- Confirme se a lista existe
- Teste com um board diferente

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📝 Roadmap

- [ ] Modo Criação de Conteúdo
- [ ] Modo Agenda e Prazos
- [ ] Modo Análise de Concorrentes
- [ ] Suporte a outros boards (Notion, Asana)
- [ ] Exportação de projetos em PDF
- [ ] Temas personalizáveis
- [ ] Atalhos de teclado configuráveis
- [ ] Modo offline com cache

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Tiago Baptista**

- Portfolio: [tiagobaptista0.github.io/portifolio](https://tiagobaptista0.github.io/portifolio/)
- GitHub: [@tiagobaptista0](https://github.com/tiagobaptista0)

## 🙏 Agradecimentos

- Google Gemini pela API de IA
- Trello pela API de gerenciamento
- Comunidade open source

## 📞 Suporte

Encontrou um bug ou tem uma sugestão?
- Abra uma [Issue](https://github.com/seu-usuario/cognito-assistant/issues)
- Entre em contato através do [Portfolio](https://tiagobaptista0.github.io/portifolio/)

---

**Nota**: Esta extensão requer credenciais de APIs de terceiros (Google Gemini e Trello) que você deve obter gratuitamente seguindo as instruções acima.

Feito com dedicação para otimizar sua produtividade 🚀