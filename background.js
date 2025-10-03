// background.js

// Permite que o usuário abra a barra lateral clicando no ícone da extensão
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Script de instalação (opcional, mas bom para futuras configurações)
chrome.runtime.onInstalled.addListener(() => {
    console.log('Cognito Assistant instalado com sucesso!');
});