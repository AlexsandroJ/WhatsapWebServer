// src/whatsapp/messageHandler.js
const dataMenu = require('../util/dataMenu');
const AiAgent = require('../util/AiAgent');
const states = require('../util/states');

async function handleMessage(client, msg) {
    msg.userId = process.env.USERID || "";
    msg.token = process.env.TOKEN || "";

    if (!client || typeof client.sendMessage !== 'function') {
        console.warn('⚠️ Cliente não está pronto para enviar mensagens.');
        return;
    }

    try {
        if (!states.botAIState && states.botActiveState) {
            const reply = await dataMenu(msg);
            await client.sendMessage(msg.from, reply);
        } else if (states.botAIState && states.botActiveState) {
            const reply = await AiAgent(msg);
            await client.sendMessage(msg.from, reply);
        }
    } catch (err) {
        console.error('❌ Erro ao enviar resposta:', err.message);
    }
}

module.exports = { handleMessage };