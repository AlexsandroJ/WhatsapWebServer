const { Client, LocalAuth } = require("whatsapp-web.js");

const QRCode = require('qrcode');
const fs = require("fs");
const path = require("path");
const dataMenu = require('./util/dataMenu');

const uri = `${process.env.API_URL}:${process.env.PORT}`;
const socketserverStateUrl = uri;

const { io } = require('socket.io-client'); // Importa o socket.io-client

let client = null;
let token;
let userId;

// flag de controle de reinicialização para evitar loops
let reiniciando = false;

// flag do estado do servidor
let serverState = false

// flag do estado do client
let clientState = false;

// flag do do estatdo do bot
let botState = false;

// dados do qrCode
let qrImage;

// flag de conexão via qrCode
let conectado = false;

// Conecta ao servidor WebSocket
const socket = io(socketserverStateUrl, {
    reconnection: true,
    reconnectionAttempts: Infinity,
    randomizationFactor: 0.5
});

// Escuta eventos do servidor WebSocket
socket.on('connect', () => {
    console.log('🔌 Conectado ao servidor WebSocket');
    serverState = true;
    sendStates();
});

socket.on('disconnect', (reason) => {
    console.log('🔌 Desconectado do servidor:', reason);
    serverState = false;
    clientState = false;
    sendStates();
});

// Recebe atualizações em tempo real
socket.on('atualizacao', async (data) => {

    if (data.type === 'system' && serverState) {
        if (data.comand === true) {
            console.log('▶️ Comando system: Ligar');
            clientState = true;
            sendStates();
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
            clientState = false;
            sendStates();
        }
    }

    if (data.type === 'getStates') {
        console.log('💬 Comando getStates:');
        sendStates();
    }

    if (data.type === 'setBotState') {
        console.log('🤖 Comando setBotState:', data.botState ? 'ON' : 'OFF');
        botState = data.botState;
        token = data.token;
        userId = data.userId;
        sendStates();
    }

});

function temClienteSalvo(clientId = "client-Alex") {
    const dirPath = path.join("LocalAuth_salves", `session-${clientId}`);

    if (!fs.existsSync(dirPath)) {
        console.log(`❌ Pasta "${dirPath}" não existe`);
        return false;
    }

    const files = fs.readdirSync(dirPath);

    // Verifica se há algum arquivo de credenciais ou estado
    const hasCreds = files.some(f => f.startsWith('WACreds'));
    const hasState = files.some(f => f.startsWith('WAState'));

    if (hasCreds && hasState) {
        console.log("✅ Sessão encontrada: Credenciais + Estado");
        return true;
    } else {
        console.log("❌ Sessão incompleta ou inválida");
        return false;
    }

}

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
            qrImage = null;
        }
    }

    // ✅ Cria novo cliente
    client = new Client({
        puppeteer: {
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-logging',
                '--log-level=3' // Silencia logs do Chromium
            ],
        },
        authStrategy: new LocalAuth({
            dataPath: 'LocalAuth_salves',
            clientId: "client-Alex"
        })
    });


    try {
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

                if (serverState && clientState) {
                    conectado = false;
                    imageData = qrImage.toString('base64');
                    sendStates();
                    console.log('✅ QR Code enviado via WebSocket');
                }

            } catch (error) {
                console.error("❌ Erro ao gerar QR Code:", error.message);
            }
        });

        // Evento: autenticação bem-sucedida
        client.on("authenticated", () => {
            console.log("AUTHENTICATED");
            imageData = null;
        });

        // Evento: falha na autenticação
        client.on("auth_failure", async (msg) => {
            console.error("AUTHENTICATION FAILURE", msg);
            imageData = null;
            conectado = false;
            restartClient();
            sendStates();
        });

        // Evento: pronto para uso
        client.on("ready", async () => {
            console.log("CLIENTE PRONTO");
            console.log("USER:", client.info.wid.user);
            conectado = true;
            imageData = null;
            sendStates();
        });

        // Evento: desconectado
        client.on("disconnected", (reason) => {
            console.log("CLIENTE DESCONECTADO:", reason);
            conectado = false;
            imageData = null;
            restartClient();
            sendStates();
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

        await client.initialize();
    } catch (err) {
        console.error('❌ Erro ao inicializar cliente:', err.message);
        restartClient();
    }
}

// Reinicia cliente após desconexão
async function restartClient() {
    console.log("🔄 Reiniciando cliente...");
    if (reiniciando) return;
    reiniciando = true;

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
    serverState = false;
    clientState = false;
    imageData = null;
    sendStates();
    if (client) {
        client.destroy()
            .then(() => console.log("Cliente destruído"))
            .catch(err => console.error("Erro ao destruir cliente:", err));
    }
    process.exit(0);
});

function sendStates() {
    if (!socket.connected) {
        console.warn('🟡 Não foi possível enviar estados - socket desconectado');
        return;
    }
    socket.emit('atualizacao', {
        type: 'conected',
        serverState: serverState,
        clientState: clientState,
        conectado: conectado,
        botState: botState,
        imageData: imageData
    });
}