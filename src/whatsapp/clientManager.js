// src/whatsapp/clientManager.js
const { Client , LocalAuth} = require("whatsapp-web.js");
const QRCode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const states = require('../util/states');
const { handleMessage } = require('./messageHandler');
const { getSocket } = require('../websocket/socketManager');
const { temClienteSalvo } = require('../util/helpers');

let client = null;

function sendStates() {

    const socket = getSocket();
    if (!socket || !socket.connected) {
        console.warn('🟡 Não foi possível enviar estados - socket desconectado');
        return;
    }


    socket.emit('atualizacao', {
        type: 'conected',
        token: process.env.TOKEN || "",
        userId: process.env.USERID || "",
        serverState: states.serverState,
        clientState: states.clientState,
        conectado: states.conectado,
        botActiveState: states.botActiveState,
        botAIState: states.botAIState,
        imageData: states.imageData
    });

}

async function startClient() {
    if (client) {
        console.warn('⚠️ Cliente já existe. Destruindo antes de reiniciar...');
        await destroyClient();
    } else {
        console.log('✅ Criando novo cliente WhatsApp...');
        client = new Client({
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            },

            authStrategy: new LocalAuth({
                dataPath: 'LocalAuth_salves',
                clientId: "client-Alex"
            })
        });
    }

    // Eventos do cliente
    client.on('qr', async (qr) => {
        try {
            const qrBuffer = await QRCode.toBuffer(qr, {
                type: 'png',
                width: 300,
                margin: 2,
                color: { dark: '#000000FF' },
                background: { light: '#FFFFFFFF' }
            });

            states.imageData = qrBuffer.toString('base64');
            states.conectado = false;
            sendStates();
            qrcodeTerminal.generate(qr, { small: true });
            console.log('✅ QR Code gerado e enviado via WebSocket');

        } catch (error) {
            console.error("❌ Erro ao gerar QR Code:", error.message);
        }
    });

    client.on('ready', () => {
        console.log("✅ CLIENTE PRONTO");
        console.log("USER:", client.info.wid.user);
        states.conectado = true;
        states.imageData = null;
        sendStates();

    });

    client.on('authenticated', () => {
        console.log("✅ AUTHENTICATED");
    });

    client.on('auth_failure', async (msg) => {
        console.error("❌ AUTHENTICATION FAILURE", msg);
        states.resetImageData();
        states.conectado = false;
        await restartClient();
        sendStates();
    });

    client.on('disconnected', (reason) => {
        console.log("❌ CLIENTE DESCONECTADO:", reason);
        states.conectado = false;
        states.resetImageData();
        restartClient();
        sendStates();
    });

    client.on('message', (msg) => {
        handleMessage(client, msg);
    });

    try {
        await client.initialize();
        console.log('✅ Inicializado cliente WhatsApp');
        states.clientState = true;
    } catch (err) {
        console.error('❌ Falha ao inicializar cliente:', err.message);
        states.clientState = false;
    }
}

async function destroyClient() {
    if (!client) return;
    try {
        await client.destroy();
        console.log('✅ Cliente destruído com sucesso.');
    } catch (err) {
        console.warn('⚠️ Erro ao destruir cliente:', err.message);
    } finally {
        client = null;
    }
}

async function restartClient() {
    if (states.reiniciando) return;
    states.reiniciando = true;

    console.log("🔄 Reiniciando cliente em 5s...");
    setTimeout(async () => {
        await destroyClient();
        startClient();
        states.reiniciando = false;
    }, 5000);
}

// Exporta funções e estado
module.exports = {
    startClient,
    restartClient,
    destroyClient,
    sendStates,
    getClient: () => client
};