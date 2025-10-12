// src/whatsapp/clientManager.js
const { Client, LocalAuth } = require("whatsapp-web.js");
const axios = require('axios');
const QRCode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const states = require('../util/states');
const { handleMessage } = require('./messageHandler');
const { getSocket, sendStates } = require('../websocket/socketManager');
const { temClienteSalvo } = require('../util/helpers');
const { stat } = require("fs");

let client = null;
const uri = `${process.env.API_URL}`;

let token = process.env.TOKEN || "";
let userId = process.env.USERID || "";



async function startClient() {
    if (client) {
        console.warn('⚠️ Cliente já existe. Destruindo antes de reiniciar...');
        await destroyClient();
    } else {
        console.log('✅ Criando/Carregando cliente WhatsApp...');
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
            console.log('✅ QR Code gerado e enviado via WebSocket/Terminal');

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
        // Ativa o tenant se houver cliente salvo

        //await axios.patch(`${uri}/api/activate-tenant/${userId}`,{status: "active"});
        states.clientState = true;
        sendStates();
    } catch (err) {
        console.error('❌ Falha ao inicializar cliente:', err.message);
        states.clientState = false;
        sendStates();
    }
}

async function destroyClient() {
    if (!client) return;
    try {
        await client.destroy();
        console.log('✅ Cliente destruído com sucesso.');
        sendStates();
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