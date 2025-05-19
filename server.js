const { Client, LocalAuth } = require("whatsapp-web.js");
const axios = require('axios');
const QRCode = require('qrcode');
const qrcode = require("qrcode-terminal");

const dataMenu = require('./util/dataMenu');

const uri = `${process.env.API_URL}:${process.env.PORT}`;
const socketServerUrl = uri;

const { io } = require('socket.io-client'); // Importa o socket.io-client

let client = null;
let token;
let userId;
let qrImage;
let conectado = false;
let botState = false;
let systemState = false;
let whatsappWebServer = false

// Conecta ao servidor WebSocket
const socket = io(socketServerUrl, {
    reconnection: true,
    reconnectionAttempts: Infinity,
    randomizationFactor: 0.5
});

// Escuta eventos do servidor WebSocket
socket.on('connect', () => {
    console.log('🔌 Conectado ao servidor WebSocket');
    whatsappWebServer = true;
    socket.emit('atualizacao', {
        type: 'conected',
        whatsappWebServer: whatsappWebServer,
        systemState: systemState,
        conectado: conectado,
        botState: botState
    });
});

socket.on('disconnect', (reason) => {
    console.log('🔌 Desconectado do servidor:', reason);
    whatsappWebServer = false;
    systemState = false;
    socket.emit('atualizacao', {
        type: 'conected',
        whatsappWebServer: whatsappWebServer,
        systemState: systemState,
        conectado: conectado,
        botState: botState
    });
});

// Recebe atualizações em tempo real
socket.on('atualizacao', async (data) => {

    if (data.type === 'system') {
        if (data.comand === true) {
            console.log('▶️ Comando system: Ligar');
            systemState = true;
            socket.emit('atualizacao', { type: 'getStates' });
            await startClient();
        }
        if (data.comand === false) {
            console.log('⛔ Comando system: Desligar');
            if (client) {
                try {
                    await client.logout();
                } catch (err) {
                    console.warn('⚠️ Erro ao fazer logout:', err.message);
                }
            }
            systemState = false;
            socket.emit('atualizacao', { type: 'getStates' });
        }
    }

    if (data.type === 'getStates') {
        console.log('💬 Comando getStates:');
        socket.emit('atualizacao', {
            type: 'conected',
            whatsappWebServer: whatsappWebServer,
            systemState: systemState,
            conectado: conectado,
            botState: botState
        });
    }

    if (data.type === 'setBotState') {
        console.log('🤖 Comando setBotState:', data.botState ? 'ON' : 'OFF');
        botState = data.botState;
        token = data.token;
        userId = data.userId;
    }

});

// Função principal para iniciar o cliente WhatsApp
async function startClient() {
    // ❗ Destroi qualquer instância anterior com segurança
    if (client) {
        try {
            const state = await client.getState().catch(() => 'UNPAIRED');
            if (state !== 'UNPAIRED') {
                console.log('🔄 Desconectando sessão...');
                await client.logout();
            }
            await client.destroy().catch(err => {
                console.warn('⚠️ Erro ao destruir cliente:', err.message);
            });
        } catch (err) {
            console.warn('⚠️ Cliente já foi destruído ou não existe:', err.message);
        } finally {
            client = null; // Garante que a referência seja limpa
        }
    }

    // ✅ Cria novo cliente
    client = new Client({
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
        authStrategy: new LocalAuth({
            dataPath: 'LocalAuth_salves',
            clientId: "client-Alex"
        })
    });

    // Evento: QR Code gerado
    client.on("qr", async (qr) => {
        try {
            qrImage = await QRCode.toBuffer(qr, {
                type: 'png',
                width: 300,
                margin: 2,
                color: { dark: '#000000FF' },
                background: { light: '#FFFFFFFF' }
            });

            if (socket.connected) {
                socket.emit('atualizacao', {
                    type: 'conected',
                    whatsappWebServer: whatsappWebServer,
                    systemState: systemState,
                    conectado: false,
                    imageData: qrImage.toString('base64'),
                    botState: botState
                });
            }

            console.log('✅ QR Code enviado via WebSocket');

        } catch (error) {
            console.error("❌ Erro ao gerar QR Code:", error.message);
        }
    });

    // Evento: autenticação bem-sucedida
    client.on("authenticated", () => {
        console.log("AUTHENTICATED");
    });

    // Evento: falha na autenticação
    client.on("auth_failure", async (msg) => {
        console.error("AUTHENTICATION FAILURE", msg);

        if (socket.connected && qrImage) {
            socket.emit('atualizacao', {
                type: 'conected',
                whatsappWebServer: whatsappWebServer,
                systemState: systemState,
                conectado: false,
                botState: botState,
                imageData: qrImage.toString('base64'),
            });
            conectado = false;
        }

        restartClient();
    });

    // Evento: pronto para uso
    client.on("ready", async () => {
        console.log("CLIENTE PRONTO");
        console.log("USER:", client.info.wid.user);

        if (socket.connected) {
            socket.emit('atualizacao', {
                type: 'conected',
                whatsappWebServer: whatsappWebServer,
                systemState: systemState,
                conectado: true,
                botState: botState
            });
        }
        conectado = true;
    });

    // Evento: desconectado
    client.on("disconnected", (reason) => {
        console.log("CLIENTE DESCONECTADO:", reason);

        if (socket.connected) {
            socket.emit('atualizacao', {
                type: 'conected',
                whatsappWebServer: whatsappWebServer,
                systemState: systemState,
                conectado: false,
                botState: botState,
                imageData: qrImage?.toString('base64'), // Evita erro se for null
            });
        }

        conectado = false;
        restartClient();
    });

    // Evento: recepção de mensagem
    client.on("message", async (msg) => {
        msg.userId = userId;
        msg.token = token;

        if (botState && client && typeof client.sendMessage === 'function') {
            try {
                await client.sendMessage(msg.from, await dataMenu(msg));
            } catch (err) {
                console.error('❌ Erro ao enviar resposta:', err.message);
            }
        }
    });

    // Inicializa o cliente
    try {
        await client.initialize();
    } catch (err) {
        console.error('❌ Erro ao inicializar cliente:', err.message);
        restartClient();
    }
}

// Reinicia cliente após desconexão
async function restartClient() {
    console.log("🔄 Reiniciando cliente...");

    setTimeout(async () => {
        if (client) {
            try {
                await client.destroy().catch(() => { });
            } catch (e) {
                console.warn('⚠️ Erro ao destruir cliente durante reinício:', e.message);
            }
            client = null;
        }

        startClient();
    }, 5000);
}

// Trata encerramento limpo
process.on('SIGINT', () => {
    console.log("Encerrando servidor...");
    whatsappWebServer = false;
    systemState = false;
    socket.emit('atualizacao', {
        type: 'conected',
        whatsappWebServer: whatsappWebServer,
        systemState: systemState,
        conectado: conectado,
        botState: botState
    });
    if (client) {
        client.destroy()
            .then(() => console.log("Cliente destruído"))
            .catch(err => console.error("Erro ao destruir cliente:", err));
    }
    process.exit(0);
});