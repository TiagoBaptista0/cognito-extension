// content_script.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Verifica se a mensagem é para obter o conteúdo da página
  if (request.action === "getPageContent") {
    // Extrai o texto visível do corpo da página
    const pageText = document.body.innerText;
    sendResponse({ content: pageText });
  }
  // Retorna true para indicar que a resposta será enviada de forma assíncrona
  return true; 
});