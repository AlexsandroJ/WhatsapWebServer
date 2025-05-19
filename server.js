const { Client, LocalAuth } = require("whatsapp-web.js");
const axios = require('axios');
const QRCode = require('qrcode');
const qrcode = require("qrcode-terminal");

const dataMenu = require('./util/dataMenu');

const uri = `${process.env.API_URL}:${process.env.PORT}`;
const socketServerUrl = uri; // Endereço do servidor WebSocket

const { io } = require('socket.io-client'); // ✅ Importa o socket.io-client

let client = null;
let token;
let userId;
let qrImage;
let conectado = false;
let botState = false;

// ✅ Conecta ao servidor WebSocket
const socket = io(socketServerUrl, {
    reconnection: true,
    reconnectionAttempts: Infinity,
    randomizationFactor: 0.5
});

// Escuta eventos do servidor WebSocket
socket.on('connect', () => {
    console.log('🔌 Conectado ao servidor WebSocket');
});

socket.on('disconnect', (reason) => {
    console.log('🔌 Desconectado do servidor:', reason);
});

// ✅ Exemplo: quando o servidor emitir "atualizacao", execute algo
socket.on('atualizacao', async (data) => {
    //console.log('📥 Atualização WebSocket:');
    /*
    if (data.type === 'login') {
        console.log('🔐 Login solicitado via WebSocket');
        console.log('🔐 :', data.token);
        token = data.token;
        //await loginNoSistema(data.credentials || {});
    }
    */
    if (data.type === 'getStates') {
        console.log('💬​ Comando getStates:');
        socket.emit('atualizacao', {
            type: 'conected',
            conectado: conectado,
            
            botState: botState
        });
    }
    if (data.type === 'botState') {
        console.log('🤖 Comando WebSocket:');
        botState = data.botState;
        token = data.token;
        userId = data.userId;

        if (botState) {
            console.log('Bot: ✔️');
        } else {
            console.log('Bot: ​❌ ');
        }
    }

    if (data.type === 'logout') {
        console.log('🚪 Logout solicitado via WebSocket');
        if (client) {
            await client.logout();
            await client.destroy();
        }
    }

});


// Função para reiniciar o cliente
async function startClient() {
    if (client) {
        try {
            const state = await client.getState();
            if (state !== 'UNPAIRED') {
                console.log('Desconectando sessão atual...');
                await client.logout();
            }
            await client.destroy();
        } catch (err) {
            console.warn('Cliente já foi destruído:', err.message);
        }
    }
    // Criar novo cliente
    client = new Client({
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
        authStrategy: new LocalAuth({
            dataPath: 'LocalAuth_salves',
            clientId: "client-Alex"
        })
    });

    // Eventos
    client.on("qr", async (qr) => {
        try {
            qrImage = await QRCode.toBuffer(qr, {
                type: 'png',
                width: 300,
                margin: 2,
                color: { dark: '#000000FF' },
                background: { light: '#FFFFFFFF' }
            });

            socket.emit('atualizacao', {
                type: 'conected',
                conectado: false,
                imageData: qrImage.toString('base64'),
                botState: botState
            });
            conectado = false;
            // Mostra no terminal
            //qrcode.generate(qr, { small: true });

            console.log('✅ QrCode via WebSocket:');

        } catch (error) {
            console.error("Erro ao gerar ou salvar QR Code:", error.message);
        }
    });

    client.on("authenticated", () => {
        console.log("AUTHENTICATED");

    });

    client.on("auth_failure", (msg) => {
        console.error("AUTHENTICATION FAILURE", msg);
        socket.emit('atualizacao', {
            type: 'conected',
            conectado: false,
            imageData: qrImage.toString('base64'),
            botState: botState
        });
        conectado = false;
        restartClient();
    });

    client.on("ready", async () => {
        console.log("CLIENTE CONECTADO");
        console.log("USER:", client.info.wid.user);
        socket.emit('atualizacao', {
            type: 'conected',
            conectado: true,
            botState: botState
        });
        conectado = true;
    });

    client.on("disconnected", (reason) => {
        console.log("CLIENTE DESCONECTADO:", reason);
        socket.emit('atualizacao', {
            type: 'conected',
            conectado: false,
            imageData: qrImage.toString('base64'),
            botState: botState
        });
        conectado = false;
        restartClient();
    });

    client.on("message", async (msg) => {
        msg.userId = userId;
        msg.token = token;
        //console.log("token:",token);
        if (botState) {
            client.sendMessage(msg.from, await dataMenu(msg));
        }
    });

    await client.initialize();
}

// Reiniciar cliente após desconexão
function restartClient() {
    console.log("🔄 Reiniciando cliente...");
    setTimeout(() => {
        startClient();
    }, 5000); // Espera 5 segundos para evitar flood
}

// Trata encerramento limpo
process.on('SIGINT', () => {
    console.log("Encerrando servidor...");
    if (client) {
        client.destroy()
            .then(() => console.log("Cliente destruído"))
            .catch(err => console.error("Erro ao destruir cliente:", err));
    }
    process.exit(0);
});



// Inicializa o cliente pela primeira vez
startClient();
