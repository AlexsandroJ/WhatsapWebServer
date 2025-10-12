// src/utils/states.js

let serverState = false;
let clientState = false;
let botActiveState = false;
let botAIState = false;
let conectado = false;
let imageData = null;
let reiniciando = false;

// Exporta getters e setters
module.exports = {
    // estado do servidor WebSocket (ativo/inativo)
    get serverState() { return serverState; },
    set serverState(value) { serverState = value; },

    // estado da conexão (ativo/inativo)
    get conectado() { return conectado; },
    set conectado(value) { conectado = value; },

    // estado do cliente WhatsApp (ativo/inativo)
    get clientState() { return clientState; },
    set clientState(value) { clientState = value; },

    // estado do bot (ativo/inativo)
    get botActiveState() { return botActiveState; },
    set botActiveState(value) { botActiveState = value; },

    // estado da IA do bot (ativo/inativo)
    get botAIState() { return botAIState; },
    set botAIState(value) { botAIState = value; },



    // dados da imagem
    get imageData() { return imageData; },
    set imageData(value) { imageData = value; },

    // estado de reinicialização (ativo/inativo)
    get reiniciando() { return reiniciando; },
    set reiniciando(value) { reiniciando = value; },

    resetImageData() {
        imageData = null;
    },

    resetAll() {
        // Reseta todos os estados para valores iniciais
        serverState = false;
        clientState = false;
        botActiveState = false;
        botAIState = false;
        conectado = false;
        imageData = null;
        reiniciando = false;
    }
};