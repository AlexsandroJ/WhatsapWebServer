const NodeGeocoder = require('node-geocoder');
const ClientZap = require("../models/clientModels");
const dataTest = require('../util/productsTest');
const calcFrete = require('../util/frete');
// ---------------------Const e var -------------------------------//
const precision = 2;
const cardapio = dataTest;

const cidadesDePE = {
    "Recife": ["Santo Amaro", "Boa Vista", "Cidade Universitária", "Pina", "Cajueiro Seco"],
    "Jaboatão dos Guararapes": ["Cajueiro Seco", "Prazeres", "Guararapes", "Candeias", "Barro", "Piedade"],
};

const citys = ["Recife", "Jaboatão dos Guararapes"];

//let result;
let x;
let msgAux;
let data = "";
let option_pag = 0;
let index = 0;
let saudacao;
let despedida;
let array_aux = [];

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

const company_name = "CU";
let msgInitial = `🟢​\t${saudacao}\n\nBem vindo ao atendimento ${company_name}\n`;

const msg_inicial_cardapio = `Seja Bem vindo a pizzaria ${company_name}\n\nDigite uma ou varias opções\n\n\tCardapio:\n`;
msgAux = msg_inicial_cardapio;

let productsList = [];
x = 1;

cardapio.products.forEach(element => {
    msgAux += `\n\t${element.category}\n\n`;

    element.item.forEach((item) => {
        productsList.push(item);
        msgAux += `${x} 👉​${item.type}\n👇\nR$ ${item.value}\n\n`
        x++;
    });
});

/*
cardapio.produtos.forEach(element => {
    if (cardapio.tipos[y].inicio == x) {
        msgAux += `\n\t${cardapio.tipos[y].title}\n\n`;
        if (y < cardapio.tipos.length - 1) {
            y++;
        }
    }
    msgAux += `${x} 👉​${element.type}\n👇\nR$ ${element.value}\n\n`
    x++;
});
*/
const msg_fim_cardapio = `\nDigite uma ou varias opções\n\n#️⃣ Para falar com um de nossos atendentes`
msgAux += msg_fim_cardapio;
const orders = msgAux

const edition = `🅾️Editar ✏️`;
const returne = `🅱️Voltar ⬅️Cardapio`;
const confirmation = `🅰️Confirmar ✅`;

const money_type = "✅\tQual a forma de pagamento \n\n1️⃣Dinheiro\n2️⃣Cartão 💳\n3️⃣Pix";
const option_inval = "❌​\tOpção invalida";
const personal_service = `\t💬 Aguarde um de nossos atendentes\n\n${returne}`;

const pag_money = `✅\tForma de Pagamento:\n\n\tDinheiro\n\n${returne}​\n${confirmation}\n`;
const pag_cart = `✅\tForma de Pagamento:\n\n\tCartão 💳\n\n${returne}​\n${confirmation}\n`;
const pag_pix = `✅\tForma de Pagamento:\n\n\tPix\n\n${returne}​\n${confirmation}\n`;

const pag_type_money = "Dinheiro";
const pag_type_cart = "Cartão 💳";
const pag_type_pix = "Pix";

const msg_dell_orders = `❌\t​Pedidos Vazios\n\nEncerrar Atendimento ?\n\n${returne}​\n${confirmation}\n`;
const end_atendiment = `​👍 Atendimento encerrado\n\n${despedida}`;
const dell_confirmation = `❌\tPedidos Exluido\n${end_atendiment}`;

const get_the_name = `✏️ ​Informe o nome do Cliente`;
const text_tab = `\n`;

horas = agora.getHours();
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
// Função principal para executar o menu dinâmico
async function runDynamicMenu(steps, msg) {
    try {

        const result = await ClientZap.findOne({ phone: msg.from });

        if (result) {
            const currentStepIndex = result.etapa;
            // Função recursiva para processar cada etapa
            async function processStep() {

                const currentStep = steps[currentStepIndex];

                // Solicita entrada do usuário
                const userInput = msg.body;

                // Verifica se a entrada é válida
                if (!currentStep.validate(userInput)) {
                    return option_inval;
                }

                // Pergunta ao usuário se deseja confirmar ou editar
                const confirmEdit = prompt(
                    `Você inseriu: "${userInput}". Deseja confirmar? (sim/não):`
                ).toLowerCase();

                if (confirmEdit === "A") {
                    currentStepIndex++; // Avança para a próxima etapa
                    await ClientZap.findOneAndUpdate(
                        { phone: msg.from },
                        { $inc: { etapa: 1 } },
                        { new: true }
                    );
                    processStep();
                } else if (confirmEdit === "B") {

                    processStep(); // Permite editar a entrada atual
                } else {

                    processStep(); // Repete a mesma etapa
                }
            }

            // Inicia o processamento do menu
            processStep();
        } else {
            // Criação de dados
            const newUser = await ClientZap({ phone: msg.from });
            await newUser.save();
            console.log(`Novo Cliente: ${newUser.phone}`);
            // msg inicial
            data = `Selecione Sua Cidade:\n\n`;
            x = 0;
            citys.forEach(element => {
                data += `${x + 1} 👉​${element}\n`;
                x++
            });
            msgAux = msgInitial + `${data}`;
            return msgAux;
        }
    } catch (error) {
        console.error('Ocorreu um erro em runDynamicMenu:', error);
        process.exit(1);
    }
}


// Exemplo de configuração de etapas

const menuSteps = [
    {
        key: "city",
        prompt: async () => {
            try {

                msgAux = `✅\tSelecione Sua Cidade:\n\n`;
                citys.forEach((city, index) => {
                    msgAux += `${index + 1} 👉 ${city}\n`;
                });
                return msgAux;
            } catch (error) {
                console.error("Erro ao buscar cidades da API:", error.message);
                return "❌ Não foi possível carregar as cidades. Tente novamente mais tarde.";
            }
        },
        validate: (input) => {
            const index = parseInt(input) - 1;
            return !isNaN(index) && index >= 0 && index < citys.length;
        },
        promptConfirmation: (input) => {
            const index = parseInt(input) - 1;
            const selectedCity = citys[index];
            return `✅\tCidade Selecionada:\n\t${selectedCity}\n\nO - Editar\nA - Confirmar`;
        },
    },
    {
        key: "idade",
        prompt: "Qual é a sua idade?",
        validate: (input) => !isNaN(input) && parseInt(input) > 0 // Validação: deve ser um número positivo
    },
    {
        key: "email",
        prompt: "Qual é o seu e-mail?",
        validate: (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) // Validação: formato de e-mail
    }
];

// Executa o menu dinâmico
runDynamicMenu(menuSteps);