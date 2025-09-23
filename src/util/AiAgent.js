const axios = require('axios');
require('dotenv').config();

const dataTest = require('./productsTest');

const uri = process.env.API_URL;

const apiKey = process.env.API_KEY_OPENROUTER_AI;;

// ---------------------Const e var -------------------------------//
const precision = 2;

let agora = new Date();
let horas = agora.getHours();

if (horas >= 5 && horas < 12) {
    saudacao = "Bom dia ☀️";
    despedida = "Tenha um Ótimo Dia ☀️";
} else if (horas >= 12 && horas < 18) {
    saudacao = "Boa tarde ☀️";
    despedida = "Tenha uma Ótima Tarde ☀️";
} else {
    saudacao = "Boa noite 🌛​";
    despedida = "Tenha uma Ótima Noite 🌛​";
}

const company_name = "Beto Pizza";
let msgInitial = `🟢​\t${saudacao}\n\nBem vindo ao atendimento ${company_name}\n`;


let allSabores = '';

dataTest.products.forEach(categoria => {
    allSabores += categoria.tipo + ': '
    categoria.item.forEach(pizza => {
        allSabores += pizza.sabor + ', ';
    });
    allSabores += ', '
});

let agentAtendent = {
    role: "assistant", 
    content: `Você é um assistente de vendas amigável da pizzaria ${company_name}.

        Seu objetivo é coletar as seguintes informações do cliente de forma conversacional e natural, uma por vez:
        1. Nome completo do cliente
        2. Endereço completo: rua, número e bairro
        3. Sabor da pizza desejada (os sabores disponíveis são: ${allSabores})
        4. Acompanhamentos desejados (ex: refrigerante, borda recheada, etc)

        Não pergunte tudo de uma vez. Espere a resposta do cliente antes de seguir para a próxima pergunta.
        Como exemplo de mensagem de boas vindas: ${msgInitial}
        Após coletar todas as informações, confirme os dados com o cliente perguntando se está tudo correto.

        Se o cliente confirmar, responda com exatamente esta frase:
        "Obrigado, os dados foram confirmados!"

        Além disso, antes de finalizar, confirme gentilmente o número de telefone do cliente para contato:
        "Para finalizarmos, poderia confirmar seu número de telefone para contato?" 

        Sua linguagem deve ser simpática, clara e profissional.`
        };

let agentExtrator = {
    role: "assistant",
    content: `Você é um extrator de informações. A partir do histórico da conversa abaixo, extraia os seguintes campos:
        {
            "nome": "extraia o nome do cliente",
            "endereco": "extraia o endereço do cliente",
            "pizzas": "extraia as pizzas dejesada pelo cliente",
            "acompanhameto:" "caso o cliente solicite"
        }
        Retorne APENAS o JSON com os campos preenchidos.
        Conversar:`
};

async function addClient(msg) {
    try {
        const newUser = await axios.post(`${uri}/api/client/`, {
            phone: msg.from
        })
        agentAtendent.content += msg.from;
        return sendRequestAiApi("user", msg.body, [agentAtendent], "agente-de-vendas-ia", msg);

    } catch (error) {
        console.error('addClient: erro:', error);
        process.exit(1);
    }
}
function isValidOrderJson(json) {
    // Verifica se é um objeto e não é null
    if (typeof json !== 'object' || json === null) {
        console.error("❌ Resposta não é um objeto JSON válido.");
        return false;
    }
    // Campos obrigatórios
    const requiredFields = ['nome', 'endereco', 'pizzas', 'acompanhamento'];
    // Verifica cada campo
    for (const field of requiredFields) {
        if (!(field in json)) {
            console.error(`❌ Campo obrigatório ausente: ${field}`);
            return false;
        }
        // Valida que os campos não estejam vazios (opcional)
        if (json[field] === null || json[field] === '') {
            console.warn(`⚠️ Campo "${field}" está vazio.`);
        }
    }
    return true;
}

async function extratorJson(chatHistory) {
    let string = '';
    chatHistory.forEach(element => {
        string += "role: " + element.role + ', ';
        string += "content: " + element.content + '; ';
    });
    agentExtrator.content += string;
    try {
        // Passo 1: Obter resposta do bot
        const chatResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "X-Title": XTitle
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-scout:free",
                messages: agentExtrator,
                temperature: 0.7,
                max_tokens: 300
            })
        });
        const chatData = await chatResponse.json();
        const botReply = chatData.choices[0].message.content.trim();

        return botReply;
    } catch (error) {
        console.error("extratorJson: Erro durante envio:", error);
    }
}

async function sendRequestAiApi(role, content, chatHistory, XTitle, msg) {
    chatHistory.push({ role: role, content: content });
    try {
        // Passo 1: Obter resposta do bot
        const chatResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "X-Title": XTitle
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-scout:free",
                messages: chatHistory,
                temperature: 0.7,
                max_tokens: 200
            })
        });
        const chatData = await chatResponse.json();
        const botReply = chatData.choices[0].message.content.trim();

        let AuxAgent = {
            role: "assistant", content: botReply
        }
        chatHistory.push(AuxAgent);

        try {
            for (const element of chatHistory) {
                //console.log(element);
                await axios.post(`${uri}/api/client/history/${msg.from}`, element);
            }
        } catch (error) {
            console.error("Erro ao adicionar histórico:", error.response?.data || error.message);
        }
        return botReply;
    } catch (error) {
        console.error("sendRequestAiApi: Erro durante envio:", error);
    }
}
// Função principal para executar o menu dinâmico
async function AiAgent(msg) {
    try {
        // buscar dados de cliente
        try {
            const result = await axios.get(`${uri}/api/client/${msg.from}`);
            if (result.status === 200) {
                const client = await axios.get(`${uri}/api/client/history/${msg.from}`);
                // Chama a função que envia pro modelo de IA e recebe a resposta
                const aiResponse = await sendRequestAiApi("user", msg.body, client.data.history, "agente-de-vendas-ia", msg);
                // Verifica se a resposta contém a frase desejada
                if (aiResponse && aiResponse.includes("Obrigado, os dados foram confirmados!")) {
                    const json = extratorJson(client.data.history);
                    //if (isValidOrderJson(json)) {
                    // add data to the database 
                    console.log(json);
                    //}
                } else {
                    return aiResponse;
                }
            }
        } catch (error) {
            // Tratamento de erros
            if (error.response) {
                // O servidor respondeu com um status diferente de 2xx
                const { status, data } = error.response;
                if (status === 404) {
                    // Cadastro de cliente
                    return await addClient(msg);
                } else if (status === 500) {
                    return "Erro interno no servidor da API";
                } else {
                    return `Erro desconhecido na API (Status: ${status})`;
                }
            } else if (error.request) {
                // A requisição foi feita, mas não houve resposta do servidor
                console.error("Nenhuma resposta recebida do servidor:", error.request);
                return "Falha ao conectar com o servidor da API";
            } else {
                // Outros erros (ex.: problemas de configuração)
                console.error("Erro ao fazer a requisição:", error.message);
                return "Erro ao acessar a API";
            }
        }
    } catch (error) {
        console.error('AiAgent erro:', error);
        process.exit(1);
    }
}

module.exports = AiAgent;