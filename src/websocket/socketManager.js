// src/websocket/socketManager.js
const { io } = require('socket.io-client');
const env = require('../config/env');
const states = require('../util/states');

let socket = null;
let onGetStatesCallback = null; // ← Callback para getStates
let onSetBotStateCallback = null; // ← Callback para setbotState

function initSocket() {
    socket = io(env.API_URL, {
        reconnection: true,
        reconnectionAttempts: Infinity,
        randomizationFactor: 0.5
    });

    socket.on('connect', () => {
        console.log('🔌 Conectado ao servidor WebSocket');
        states.serverState = true;
        states.clientState = true;
        // Não chama sendStates aqui diretamente — quem consome o socket deve se inscrever
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 Desconectado do servidor:', reason);
        states.serverState = false;
        states.clientState = false;
    });

    socket.on('atualizacao', async (data) => {
        if (data.userId !== env.USERID) return;

        if (data.type === 'getStates' && typeof onGetStatesCallback === 'function') {
            console.log('💬 Comando getStates:');
            onGetStatesCallback();
        }

        if (data.type === 'setbotState' && typeof onSetBotStateCallback === 'function') {
            console.log('🤖 Comando botState:', data.botActiveState ? 'ON' : 'OFF', "Tipo do Bot:", data.botAIState ? 'IA' : 'MENU');
            onSetBotStateCallback(data.botActiveState, data.botAIState);
        }
    });

    return socket;
}

function getSocket() {
    return socket;
}

// Novo: permite registrar callbacks externos
function onGetStates(callback) {
    onGetStatesCallback = callback;
}

function onSetBotState(callback) {
    onSetBotStateCallback = callback;
}

module.exports = { initSocket, getSocket, onGetStates, onSetBotState };