// src/utils/helpers.js
const fs = require('fs');
const path = require('path');

function temClienteSalvo(clientId = "client-Alex") {
    const dirPath = path.join("LocalAuth_salves", `session-${clientId}`);

    if (!fs.existsSync(dirPath)) {
        console.log(`❌ Pasta "${dirPath}" não existe`);
        return false;
    }

    const files = fs.readdirSync(dirPath);
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

module.exports = { temClienteSalvo };