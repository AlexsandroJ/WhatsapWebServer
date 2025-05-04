const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const axios = require('axios');
const qrcode = require("qrcode-terminal");
const QRCode = require('qrcode');

const dataMenu = require('./util/dataMenu');

const uri = `${process.env.API_URL}:${process.env.PORT}`;


// Desconectar o banco ao encerrar o servidor
process.on('SIGINT', async () => {
    await disconnectDB();
    process.exit(0);
});

//Criação de cliente e strategia de salvamento local
const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },

    authStrategy: new LocalAuth({
        dataPath: 'LocalAuth_salves',
        clientId: "client-Alex"
    })
});
client.on("qr", qr => {
    qrcode.generate(qr, { small: true });
});
client.on("authenticated", () => {
    console.log("AUTHENTICATED");
});
client.on("auth_failure", msg => {
    // Fired if session restore was unsuccessful
    console.error("AUTHENTICATION FAILURE", msg);
});
client.on("ready", async () => {   
    console.log("READY");
    console.log("USER:", client.info.wid.user);
});
let result = [];

client.initialize();
client.on("message", async msg => {
    //msg.userId = UserId;
    client.sendMessage(msg.from, await dataMenu(msg));
    /*
    result = await ClientPedidos.findOne({ phone: msg.from });
    if (result) {
        if (result.money == "Pix") {
            // Salva o QR Code como uma imagem temporária
            // Dados para o QR Code (pode ser um link, texto, etc.)
            const qrData = 'https://www.exemplo.com'; // Substitua pelo conteúdo desejado

            // Caminho para salvar a imagem do QR Code
            const qrCodePath = './custom_qrcode.png';

            try {
                // Gera o QR Code como uma imagem
                await QRCode.toFile(qrCodePath, qrData);

                // Cria um objeto MessageMedia a partir do arquivo de imagem
                const media = MessageMedia.fromFilePath(qrCodePath);

                // Envia o QR Code como uma imagem para o número especificado
                await client.sendMessage(msg.from, media);
                console.log('QR Code enviado com sucesso!');
            } catch (error) {
                console.error('Erro ao gerar ou enviar o QR Code:', error);
            }
        }
    }
        */
});