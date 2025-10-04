Política de Privacidade - Cognito Assistant
Última atualização: 03 de outubro de 2025
Versão da Extensão: 2.0.0
1. Introdução
O Cognito Assistant ("nós", "nosso" ou "extensão") respeita sua privacidade e está comprometido em proteger seus dados pessoais. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos suas informações ao usar nossa extensão.
Princípio Fundamental: Seus dados são seus. Não coletamos, não vendemos, não compartilhamos e não temos acesso às suas informações pessoais ou credenciais de API.
2. Informações que Coletamos
2.1 Dados Armazenados Localmente
A extensão armazena as seguintes informações apenas no seu navegador:

API Key do Google Gemini: Necessária para comunicação com a IA
API Key do Trello: Necessária para criar cards
Token de Autorização do Trello: Necessário para acessar seus boards
ID do Board Selecionado: Para identificar onde criar os cards
ID da Lista Preferida: Para lembrar sua preferência de lista
Logs de Erro: Armazenados temporariamente para debug (últimos 50 erros)

2.2 Dados que NÃO Coletamos

Não coletamos conversas ou mensagens do chat
Não coletamos conteúdo de páginas visitadas
Não coletamos histórico de navegação
Não coletamos dados pessoais identificáveis
Não coletamos informações de cartão de crédito
Não usamos cookies de rastreamento
Não usamos analytics ou telemetria

3. Como Usamos Suas Informações
3.1 Uso de Credenciais
Suas credenciais de API são usadas exclusivamente para:

Gemini API: Enviar prompts e receber respostas da IA
Trello API: Listar boards, criar cards e gerenciar etiquetas

3.2 Comunicação com APIs de Terceiros
A extensão se comunica diretamente com:

Google Gemini API (generativelanguage.googleapis.com)

Finalidade: Processar conversas e gerar planos de projeto
Dados enviados: Apenas os prompts que você digita
Política de Privacidade: Google AI Terms


Trello API (api.trello.com)

Finalidade: Criar cards, listar boards e gerenciar listas
Dados enviados: Nome de cards, descrições e configurações
Política de Privacidade: Trello Privacy



Importante: Não há servidor intermediário. Toda comunicação é ponto-a-ponto entre você e as APIs oficiais.
4. Armazenamento e Segurança
4.1 Onde Seus Dados São Armazenados

Chrome Storage Sync: Credenciais sincronizadas entre dispositivos logados na mesma conta Google
Chrome Storage Local: Logs de erro armazenados apenas no dispositivo atual
Nenhum servidor nosso: Não mantemos banco de dados ou servidores

4.2 Medidas de Segurança

Credenciais armazenadas usando a API de armazenamento seguro do Chrome
Comunicação com APIs sempre via HTTPS
Campos de senha com tipo password (ofuscados na interface)
Sem transmissão de dados para servidores de terceiros não autorizados
Código-fonte aberto para auditoria pública

4.3 Criptografia
O Chrome criptografa automaticamente os dados do chrome.storage.sync quando sincronizados entre dispositivos. No entanto, recomendamos:

Nunca compartilhar suas API Keys
Revogar tokens em caso de dispositivo perdido
Usar senhas fortes nas contas Google e Trello

5. Compartilhamento de Dados
NÃO compartilhamos seus dados com terceiros.
As únicas entidades que recebem informações são:

Google (via Gemini API): Recebe apenas os prompts que você envia
Trello (via API): Recebe apenas os dados necessários para criar cards

Não há:

Venda de dados
Compartilhamento com anunciantes
Analytics de terceiros
Rastreamento de comportamento

6. Seus Direitos
Você tem direito a:
6.1 Acesso aos Dados

Todas as suas credenciais podem ser visualizadas em Configurações
Logs de erro podem ser exportados via DevTools

6.2 Exclusão de Dados
Para excluir seus dados:

Abra as Configurações
Limpe os campos de API Keys
Clique em "Salvar Credenciais"
Desinstale a extensão (opcional)

6.3 Portabilidade
Suas credenciais podem ser:

Copiadas manualmente das configurações
Usadas em outras ferramentas
Exportadas para backup pessoal

6.4 Revogação de Acesso
Para revogar o acesso da extensão:
Gemini:

Acesse Google Cloud Console
Desative ou delete a API Key

Trello:

Acesse Trello Apps
Revogue o token da extensão

7. Permissões da Extensão
7.1 Permissões Solicitadas
json"permissions": [
  "storage",      // Armazenar credenciais localmente
  "sidePanel",    // Exibir interface lateral
  "scripting",    // Injetar scripts em páginas (futuro)
  "tabs"          // Acessar informações de abas (futuro)
]
7.2 Host Permissions
json"host_permissions": [
  "https://api.trello.com/*",                      // Trello API
  "https://generativelanguage.googleapis.com/*",   // Gemini API
  "<all_urls>"                                     // Futuro: ler conteúdo de páginas
]
Nota sobre <all_urls>: Atualmente não usado. Planejado para futura funcionalidade de resumir páginas web.
8. Dados de Menores
Esta extensão não é direcionada a menores de 13 anos. Não coletamos intencionalmente dados de crianças. Se você é responsável por um menor que usou a extensão, entre em contato para que possamos auxiliar na remoção dos dados.
9. Mudanças nesta Política
Podemos atualizar esta Política de Privacidade periodicamente. Mudanças significativas serão comunicadas através de:

Atualização da versão da extensão
Notificação na interface
Changelog no repositório GitHub

Recomendamos revisar esta política regularmente.
10. Conformidade Legal
10.1 LGPD (Lei Geral de Proteção de Dados - Brasil)
Esta extensão está em conformidade com a LGPD:

Não coletamos dados pessoais sensíveis
Processamento de dados é mínimo e transparente
Usuário tem controle total sobre seus dados
Dados não são compartilhados ou vendidos

10.2 GDPR (General Data Protection Regulation - EU)
Embora não operemos na EU, respeitamos os princípios do GDPR:

Transparência no processamento
Minimização de dados
Direito ao esquecimento
Portabilidade de dados

10.3 CCPA (California Consumer Privacy Act - EUA)
Não vendemos dados pessoais (nunca fizemos, nunca faremos).
11. Segurança de APIs de Terceiros
11.1 Responsabilidade do Usuário
Você é responsável por:

Manter suas API Keys seguras
Não compartilhar credenciais
Monitorar uso das APIs
Respeitar limites de uso gratuito

11.2 Limites de API
Gemini (plano gratuito):

15 requisições por minuto
1,500 requisições por dia
Consulte Gemini Pricing

Trello:

300 requisições por 10 segundos
100 requisições por 10 segundos por token
Consulte Trello Rate Limits

12. Código Aberto
Esta extensão é código aberto:

Código disponível no GitHub
Auditável por qualquer pessoa
Contribuições da comunidade são bem-vindas
Transparência total no funcionamento

Repositório: github.com/seu-usuario/cognito-assistant
13. Contato
Para questões sobre privacidade, dúvidas ou solicitações:

GitHub Issues: github.com/seu-usuario/cognito-assistant/issues
Portfolio: tiagobaptista0.github.io/portifolio
Email: Disponível no portfolio

Tempo de resposta: Geralmente dentro de 48-72 horas.
14. Isenção de Responsabilidade

Esta extensão é fornecida "como está"
Não nos responsabilizamos por perda de dados de APIs de terceiros
Recomendamos fazer backup de projetos importantes
Use suas próprias credenciais de API (gratuitas)
Não há custos ocultos ou taxas de assinatura

15. Consentimento
Ao usar o Cognito Assistant, você consente com:

Esta Política de Privacidade
Armazenamento local de credenciais
Comunicação direta com APIs Google e Trello
Termos de Serviço das APIs utilizadas

Você pode retirar seu consentimento a qualquer momento desinstalando a extensão e revogando as credenciais nas respectivas plataformas.

Resumo (TL;DR)
✅ Seus dados ficam no seu navegador
✅ Não coletamos, não vendemos, não compartilhamos
✅ Código aberto e auditável
✅ Comunicação direta com APIs oficiais
✅ Você controla tudo
❌ Sem servidores nossos
❌ Sem rastreamento
❌ Sem analytics
❌ Sem cookies
❌ Sem custos ocultos

Esta extensão respeita sua privacidade porque acreditamos que seus dados são seus.
Última revisão: 03 de outubro de 2025
Versão: 2.0.0