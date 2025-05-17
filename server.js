const { Client, LocalAuth } = require("whatsapp-web.js");
const axios = require('axios');
const QRCode = require('qrcode');
const qrcode = require("qrcode-terminal");
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const dataMenu = require('./util/dataMenu');

const uri = `${process.env.API_URL}:${process.env.PORT}`;

let client = null;
let token;
let userId;
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
    await client.on("qr", async (qr) => {
        try {
            // Gera o QR Code como Buffer (binário)
            const qrImage = await QRCode.toBuffer(qr, {
                type: 'png',
                width: 300,
                margin: 2,
                color: { dark: '#000000FF' }, // Cor preta
                background: { light: '#FFFFFFFF' } // Fundo branco
            });

            // Caminho completo com nome do arquivo
            const filePath = path.join('./', 'whatsapp-qr.png');

            // Salva o arquivo no sistema
            fs.writeFileSync(filePath, qrImage);
            console.log(`QR Code salvo em: ${filePath}`);

            // Envia via API (se quiser)
            await sendQrCode(qr);

            // Mostra no terminal
            qrcode.generate(qr, { small: true });

        } catch (error) {
            console.error("Erro ao gerar ou salvar QR Code:", error.message);
        }
    });

    client.on("authenticated", () => {
        console.log("AUTHENTICATED");
    });

    client.on("auth_failure", (msg) => {
        console.error("AUTHENTICATION FAILURE", msg);
        restartClient();
    });

    client.on("ready", async () => {
        console.log("CLIENTE PRONTO");
        console.log("USER:", client.info.wid.user);
    });

    client.on("disconnected", (reason) => {
        console.log("CLIENTE DESCONECTADO:", reason);
        restartClient();
    });

    client.on("message", async (msg) => {
        msg.userId = userId;
        msg.token = token;
        client.sendMessage(msg.from, await dataMenu(msg));
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

// Função para enviar QR Code para API
async function sendQrCode(qrCode) {
    const email = 'alex@example.com';
    const password = 'password321';
    try {
        const resLogin = await axios.post(`${uri}/api/sessions/login`, {
            email,
            password
        });

        token = resLogin.data.token;
        userId = resLogin.data.userId;

        const qrBuffer = await QRCode.toBuffer(qrCode, {
            type: 'png',
            width: 300,
            margin: 2,
            color: { dark: '#000000FF' },
            background: { light: '#FFFFFFFF' }
        });

        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('file', qrBuffer, {
            filename: 'whatsapp-qr.png',
            contentType: 'image/png'
        });

        await axios.post(`${uri}/api/subscriptions/qr`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        console.log('QR Code enviado para API');

    } catch (error) {
        console.error('Erro ao enviar QR Code:', error.message);
    }
}

// Inicializa o cliente pela primeira vez
startClient();
