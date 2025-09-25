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
    get serverState() { return serverState; },
    set serverState(value) { serverState = value; },

    get clientState() { return clientState; },
    set clientState(value) { clientState = value; },

    get botActiveState() { return botActiveState; },
    set botActiveState(value) { botActiveState = value; },

    get botAIState() { return botAIState; },
    set botAIState(value) { botAIState = value; },

    get conectado() { return conectado; },
    set conectado(value) { conectado = value; },

    get imageData() { return imageData; },
    set imageData(value) { imageData = value; },

    get reiniciando() { return reiniciando; },
    set reiniciando(value) { reiniciando = value; },

    resetImageData() {
        imageData = null;
    },

    resetAll() {
        serverState = false;
        clientState = false;
        botActiveState = false;
        botAIState = false;
        conectado = false;
        imageData = null;
        reiniciando = false;
    }
};