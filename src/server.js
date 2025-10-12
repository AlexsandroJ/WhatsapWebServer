// src/server.js
require('dotenv').config();
const { initSocket } = require('./websocket/socketManager');
const { startClient, sendStates } = require('./whatsapp/clientManager');
const { destroyClient } = require('./whatsapp/clientManager');
const states = require('./util/states');

// Inicializa Socket
initSocket();

// Inicializa WhatsApp Client
startClient();

// Trata encerramento limpo
process.on('SIGINT', async () => {
    //await axios.patch(`${uri}/api/activate-tenant/${userId}`,{status: "deleted"});
    
    
    states.serverState = false;
    states.clientState = false;
    states.resetImageData();
    sendStates();
    console.log("\n🛑 Encerrando servidor...");
    await destroyClient();
    console.log("✅ Servidor encerrado com sucesso.");
    process.exit(0);
});

console.log('🚀 Servidor iniciado. Aguardando conexões...');