const axios = require('axios');
require('dotenv').config();
const Groq = require("groq-sdk");


const dataTest = require('./productsTest');

const API_URL = process.env.API_URL;
const TOKEN = process.env.TOKEN;

const API_AI_LINK = process.env.API_AI_LINK;
const APIKEY = process.env.API_KEY_GROQ_AI;

const GROQ_API_KEY = process.env.API_KEY_GROQ_AI;
const model = process.env.MODEL;
const max_tokens = (process.env.MAX_TOKENS) ? parseInt(process.env.MAX_TOKENS) : 500;

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

dataTest.products.forEach(Element => {
    allSabores += Element.category + ': '
    Element.item.forEach(pizza => {
        allSabores += pizza.type + ', ';
    });
});

let agentAtendent = {
    role: "assistant",
    content: `Você é um assistente de vendas amigável da pizzaria ${company_name}.
        
    Seu objetivo é coletar as seguintes informações dos clientes de forma conversacional e natural, uma por vez:
        
    1. Nome completo do cliente
    2. Sabor da pizza desejada (os sabores disponíveis são: ${allSabores}), apresente-os de forma clara em uma lista, apenas os sabores disponíveis no cardápio
    3. Endereço completo: rua, número e bairro
    4. Acompanhamentos desejados (ex: refrigerante, borda recheada, etc)
    5. Confirmação de pedido

    Não pergunte tudo de uma vez. Espere a resposta do cliente antes de seguir para a próxima pergunta.
    Como exemplo de mensagem de boas vindas: ${msgInitial}
    Após coletar todas as informações, confirme os dados com o cliente perguntando se está tudo correto.
    Siga as estapas na ordem acima.
    Ofereça apenas os sabores disponíveis no cardápio.
    Se o cliente confirmar, responda com exatamente esta frase:
    "Obrigado, os dados foram confirmados!" em seguida com os dados coletados mostre um resumo ao cliente.
    Sua linguagem deve ser simpática, clara e profissional.
    Historico da conversa será fornecido abaixo`

};

let agentExtrator = {
    role: "assistant",
    content: `Você é um extrator de informações. A partir do histórico da conversa que será fornecido, extraia os seguintes campos:
        {
            "nome": "nome do cliente",
            "endereco": "endereço do cliente",
            "pizzas": "pizzas desejadas pelo cliente",
            "acompanhameto": "Vazio se nada foi pedido pelo cliente"
        }
        Retorne APENAS o JSON valido com os campos preenchidos que inicar e com "{" e termine com "}".
        Utilize o histórico de conversas:\n`
};

const api = axios.create({
    baseURL: API_URL,
    headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
    }
});

const api_AI = axios.create({
    baseURL: API_AI_LINK,
    headers: {
        Authorization: `Bearer ${APIKEY}`,
        'Content-Type': 'application/json'
    }
});


const groq = new Groq({
    apiKey: GROQ_API_KEY, // Recomendado: use variável de ambiente
});


async function addClient(msg) {
    try {
        const newUser = await api.post(`/api/client/`, {
            phone: msg.from
        })
        //agentAtendent.content += msg.from;
        const response = await api.post(`/api/client/history/${msg.from}`, [
            { role: agentAtendent.role, content: agentAtendent.content }
        ]);
        return sendRequestAiApi("user", msg.body, [agentAtendent], "agente-de-vendas-ia", msg);

    } catch (error) {
        console.error('addClient: erro:', error);
        return "Erro ao cadastrar novo cliente.";
    }
}
function isValidOrderJson(json) {
    // Verifica se é um objeto e não é null
    if (typeof json !== 'object' || json === null) {
        console.error("❌ Resposta não é um objeto JSON válido.");
        return false;
    }
    // Campos obrigatórios
    const requiredFields = ['nome', 'endereco', 'pizzas'];
    // Verifica cada campo
    for (const field of requiredFields) {
        if (!(field in json)) {
            console.error(`❌ Campo obrigatório ausente: ${field}`);
            return '❌ Campo obrigatório ausente: ' + field;
        }
        // Valida que os campos não estejam vazios (opcional)
        if (json[field] === null || json[field] === '') {
            console.warn(`⚠️ Campo "${field}" está vazio.`);
            return `❌ Campo "${field}" está vazio.`;
        }
    }
    return true;
}

function validateOrderInput(input) {
    let json;
    try {
        // Se for string, tenta converter
        if (typeof input === 'string') {
            json = JSON.parse(input);
        } else if (typeof input === 'object' && input !== null) {
            json = input; // já é objeto
        } else {
            console.error("❌ Entrada não é string nem objeto.");
            return false;
        }
    } catch (e) {
        console.error("❌ String JSON inválida:", e.message);
        return false;
    }

    return isValidOrderJson(json); // usa sua função original
}

async function extratorJson(chatHistory, XTitle) {
    let string = '';
    for (let i = chatHistory.length - 2; i < chatHistory.length; i++) {
        const element = chatHistory[i];
        string += "role: " + element.role + '.\n';
        string += "content: " + element.content + '.\n';
    }

    string = agentExtrator.content + string;
    //console.log(string);
    try {
        // Passo 1: Obter resposta do bot
        const chatResponse = await groq.chat.completions.create({
            messages: [{ role: "user", content: string }],
            model: model, // ou "llama3-70b-8192", "mixtral-8x7b-32768", etc.
            temperature: 0.7,
            max_tokens: max_tokens,
            top_p: 1,
            stream: false, // mude para true se quiser streaming
        });

        const chatData = chatResponse.choices[0].message.content;
        if (!chatResponse.choices || chatResponse.choices.length === 0) {

            //throw new Error("Nenhuma resposta gerada pela IA.");
            return "Erro: Nenhuma resposta gerada pela IA.";

        }

        return chatData;
    } catch (error) {
        // Erro de rede ou outro problema sem resposta HTTP
        if (!error.response) {
            console.error("Erro de rede ou sem resposta:", error.message);
            return "Erro de conexão com o serviço de IA.";
        }

        const { status, data } = error.response;

        // Log detalhado para depuração
        console.error("Erro da API:", { status, data });

        // Tratamento por código de status e/ou mensagem
        if (status === 402) {
            // Créditos esgotados (OpenRouter)
            return "❌ Créditos insuficientes. Recarregue sua conta na OpenRouter.";
        }

        if (status === 429) {
            // Rate limit excedido (muito comum em BYOK com provedores como Groq, OpenAI, etc.)
            return "⚠️ Limite de requisições atingido. Tente novamente mais tarde.";
        }

        if (status === 401) {
            // Chave de API inválida ou ausente
            return "🔐 Chave de API inválida ou não autorizada.";
        }

        if (status === 400 && data?.message?.includes("Invalid model")) {
            return "🤖 Modelo de IA inválido ou indisponível.";
        }

        // Caso genérico
        const errorMessage = data?.message || data?.error?.message || error.message;
        return `Erro na IA: ${errorMessage}`;
    }
}

async function sendRequestAiApi(role, contents, chatHistory, XTitle, msg) {
    // Adiciona a nova mensagem do usuário ao histórico
    chatHistory.push({ role: role, content: contents });
    //console.log('Chat History:', chatHistory);
    try {

        // Chamada correta para chat

        const chatResponse = await groq.chat.completions.create({
            messages: chatHistory,
            model: model, // ou "llama3-70b-8192", "mixtral-8x7b-32768", etc.
            temperature: 0.7,
            max_tokens: max_tokens,
            top_p: 1,
            stream: false, // mude para true se quiser streaming
        });

        /*
        // Chama a IA com o histórico completo (como array de objetos)
        const chatResponse = await api_AI.post("/openai/v1", {
            model: model,
            messages: chatHistory, // ← array de { role, content }, NÃO string!
            temperature: 0.7,
            max_tokens: max_tokens
        });
        */
        // Verifica se há resposta válida
        if (!chatResponse.choices?.length) {
            console.debug(chatResponse);
            return "Erro: Nenhuma resposta gerada pela IA.";
        }

        const botReply = chatResponse.choices[0].message.content;

        // Adiciona a resposta da IA ao histórico
        chatHistory.push({ role: "assistant", content: botReply });

        // Salva o histórico apenas da nova solicitação e da resposta da ia no backend
        try {
            await api.post(`/api/client/history/${msg.from}`, [
                { role: role, content: contents },
                { role: "assistant", content: botReply }
            ]);
        } catch (error) {
            console.error("Erro ao salvar histórico:", error.response?.data || error.message);
            // Opcional: não interromper se falhar só o salvamento
        }

        return botReply;

    } catch (error) {
        // Erro de rede ou outro problema sem resposta HTTP
        if (!error.response) {
            console.error("Erro de rede ou sem resposta:", error.message);
            return "Erro de conexão com o serviço de IA.";
        }

        const { status, data } = error.response;

        // Log detalhado para depuração
        console.error("Erro da API:", { status, data });

        // Tratamento por código de status e/ou mensagem
        if (status === 402) {
            // Créditos esgotados (OpenRouter)
            return "❌ Créditos insuficientes. Recarregue sua conta na OpenRouter.";
        }

        if (status === 429) {
            // Rate limit excedido (muito comum em BYOK com provedores como Groq, OpenAI, etc.)
            return "⚠️ Limite de requisições atingido. Tente novamente mais tarde.";
        }

        if (status === 401) {
            // Chave de API inválida ou ausente
            return "🔐 Chave de API inválida ou não autorizada.";
        }

        if (status === 400 && data?.message?.includes("Invalid model")) {
            return "🤖 Modelo de IA inválido ou indisponível.";
        }

        // Caso genérico
        const errorMessage = data?.message || data?.error?.message || error.message;
        return `Erro na IA: ${errorMessage}`;
    }
}
// Função principal para executar o menu dinâmico
async function AiAgent(msg) {
    try {
        // buscar dados de cliente
        try {
            const result = await api.get(`/api/client/${msg.from}`);
            if (result.status === 200) {
                const client = await api.get(`/api/client/history/${msg.from}`);
                // Chama a função que envia pro modelo de IA e recebe a resposta
                // Antes da chamada
                const sanitizedHistory = (client.data.history || []).map(({ role, content }) => ({
                    role,
                    content
                }));

                // Chamada corrigida
                const aiResponse = await sendRequestAiApi(
                    "user",
                    msg.body,
                    sanitizedHistory,
                    "agente-de-vendas-ia",
                    msg
                );
                // Verifica se a resposta contém a frase desejada
                if (aiResponse && aiResponse.includes("os dados foram confirmados!")) {
                    console.log("✅ Pedido confirmado pelo cliente.");
                    const json = await extratorJson(sanitizedHistory, "agente-extrator-json");
                    console.log("json recebido do extrator:\n", json, '.\n');
                    if (!validateOrderInput(json)) {
                        return "❌ Desculpe, houve um problema ao processar seu pedido. Por favor, verifique as informações fornecidas e tente novamente.";
                    }
                    console.log("✅ Pedido validado com sucesso, enviando para preparo.");
                }
                return aiResponse;
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
        return "Erro inesperado no AiAgent.";
    }
}

module.exports = AiAgent;