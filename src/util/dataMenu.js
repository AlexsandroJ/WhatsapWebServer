const axios = require('axios');
const dataTest = require('../util/productsTest');
const calcFrete = require('../util/frete');
require('dotenv').config();

const uri = `${process.env.API_URL}`;
// ---------------------Const e var -------------------------------//
const precision = 2;
const cardapio = dataTest;

let x;
let msgAux;
let data = "";
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

const msg_fim_cardapio = `\nDigite uma ou varias opções\n\n#️⃣ Para falar com um de nossos atendentes`

const returne = `🅱️Voltar ⤴️​`;
const edition = `🅾️Editar ✏️`;
const confirmation = `🅰️Confirmar ✅`;
const exitt = `❌ sair​`;

const menuOptions = `${returne}​\n${edition}​\n${confirmation}\n${exitt}\n`;

const money_type = "✅\tQual a forma de pagamento \n\n1️⃣Dinheiro\n2️⃣Cartão 💳\n3️⃣Pix";
const option_inval = `❌​\tOpção invalida x para sair`;
const personal_service = `\t💬 Aguarde um de nossos atendentes\n\n${returne}`;

const msg_orders_void = `❌\t​Pedidos Vazios\n\nEncerrar Atendimento ?\n\n${returne}​\n${exitt}\n`;
const end_atendiment = `​👍 Atendimento encerrado\n\n${despedida}`;
const dell_confirmation = `❌\tPedidos Exluido\n${end_atendiment}`;

const get_the_name = `✏️ ​Informe o nome do Cliente`;
const text_tab = `\n`;

function validateOptionMenu(msg) {
    return !["A", "a", "B", "b", "O", "o", "X", "x"].includes(msg.body);
}
function validateOptionNum(msg, dataAux) {
    const index = parseInt(msg.body) - 1;
    return !isNaN(index) && index >= 0 && index < dataAux.length;
}
async function volver(msg) {
    try {
        // Passo 1: Obter os dados atuais do cliente
        const response = await axios.get(`${uri}/api/client/${msg.from}`);
        const currentStep = response.data.etapa;
        // Passo 2: Decrementa a etapa
        const newStep = currentStep - 1;
        // Passo 3: Atualizar a etapa na API
        await axios.put(`${uri}/api/client/${msg.from}`, { etapa: newStep });
    } catch (error) {
        // Tratamento de erros
        if (error.response) {
            // O servidor respondeu com um status diferente de 2xx
            const { status, data } = error.response;
            console.error(`Erro na API: Status ${status}, Dados:`, data);
            return `volver: Erro ao atualizar etapa (Status: ${status})`;
        } else if (error.request) {
            // A requisição foi feita, mas não houve resposta do servidor
            console.error("Nenhuma resposta recebida do servidor:", error.request);
            return "volver: Falha ao conectar com o servidor da API";
        } else {
            // Outros erros (ex.: problemas de configuração)
            console.error("Erro ao fazer a requisição:", error.message);
            return "volver: Erro ao acessar a API";
        }
    }
}
async function next(msg) {
    try {
        // Passo 1: Obter os dados atuais do cliente
        const response = await axios.get(`${uri}/api/client/${msg.from}`);
        const currentStep = response.data.etapa;
        // Passo 2: Incrementar a etapa
        const newStep = currentStep + 1;
        // Passo 3: Atualizar a etapa na API
        await axios.put(`${uri}/api/client/${msg.from}`, { etapa: newStep });
    } catch (error) {
        // Tratamento de erros
        if (error.response) {
            // O servidor respondeu com um status diferente de 2xx
            const { status, data } = error.response;
            console.error(`Erro na API: Status ${status}, Dados:`, data);
            return `Erro ao atualizar etapa (Status: ${status})`;
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
}
function edit(msg) {
    return option_inval
}
async function exit(msg) {
    try {
        await axios.delete(`${uri}/api/client/${msg.from}`);
        return `✅​\tAtendimento Encerrado\n\n​👍​\t${despedida}`;
    } catch (error) {
        // Tratamento de erros
        if (error.response) {
            // O servidor respondeu com um status diferente de 2xx
            const { status, data } = error.response;
            console.error(`Erro na API: Status ${status}, Dados:`, data);
            return `Erro ao excluir etapa (Status: ${status})`;
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
}

const menuSteps = [
    //  estados
    {// 0-cadastro
        key: "cadastro",
        dataAux: [],
        validate: function (msg) {
            return validateOptionNum(msg, this.dataAux);
        },
        getData: async function (msg) {

        },
        msgOption: async function (msg) {
            // buscar dados
            await getData(msg);
            // 1. Tenta buscar o cliente
            let client;
            try {
                const response = await axios.get(`${uri}/api/client/${msg.from}`);
                //client = response.data;
                //console.debug(`Cliente já existe: ${client.phone}`);
            } catch (error) {
                // Se for 404, significa que NÃO existe → vamos cadastrar
                if (error.response?.status === 404) {
                    //console.debug(`Cliente não encontrado. Cadastrando...`);
                    const createResponse = await axios.post(`${uri}/api/client/`, {
                        phone: msg.from
                    });
                    client = createResponse.data;
                    console.debug(`Novo cliente cadastrado: ${client.phone}`);
                } else {
                    // Outro erro (500, timeout, etc.)
                    throw error; // relança para o catch externo
                }
            }
            msgAux = `✅\tSelecione Sua Cidade:\n\n`;

            this.dataAux.forEach((element, index) => {
                msgAux += `${index + 1} 👉 ${element.name}\n`;
            });
            msgAux = msgInitial + `${msgAux}`;
            return msgAux;


        },
        volver: async function (msg) { return option_inval },
        next: async function (msg) { await next(msg) },
        edit: async function (msg) { return await this.msgOption(msg) },
        exit: async function (msg) { return option_inval },
        msgOptionInval: function () { return option_inval },
    },
    {// 1-city
        key: "city",
        dataAux: [],
        validate: function (msg) {
            return validateOptionNum(msg, this.dataAux);
        },
        getData: async function (msg) { },
        msgOption: async function (msg) {

            msgAux = `✅\tSelecione Sua Cidade:\n\n`;
            this.dataAux.forEach((element, index) => {
                msgAux += `${index + 1} 👉 ${element.name}\n`;
            });
            return msgAux;
        },
        msgConfirmation: async function (msg) {
            const index = parseInt(msg.body) - 1;
            const select = this.dataAux[index];

            await axios.put(`${uri}/api/client/${msg.from}`, {
                city: select.name
            });

            return msgAux = `✅\tCidade:\n\t${select.name}\n\n${menuOptions}​`;

        },
        volver: async function (msg) { return await option_inval },
        next: async function (msg) { await next(msg) },
        edit: async function (msg) { return this.msgOption(msg) },
        exit: async function (msg) { return option_inval },
        msgOptionInval: function () { return option_inval },

    },
    {// 2-bairro
        key: "bairro",
        dataAux: [],
        neighborhoods: [],
        validate: function (msg) {
            return (validateOptionNum(msg, this.dataAux) || validateOptionMenu(msg));
        },
        getData: async function (msg) { },
        msgOption: async function (msg) {
            const result = await axios.get(`${uri}/api/client/${msg.from}`);

            //console.log("City: ", result.data.city)

            this.dataAux.forEach((element, index) => {
                //console.log(element.name);
                if (element.name == result.data.city) {
                    neighborhoods = element.neighborhoods;
                    //console.log(element.neighborhoods);
                }
            });

            msgAux = `✅\tSelecione Seu Bairro:\n\n`;

            neighborhoods.forEach((element, index) => {
                msgAux += `${index + 1} 👉 ${element.name}\n`;
            });

            return msgAux;
        },
        msgConfirmation: async function (msg) {
            const index = parseInt(msg.body) - 1;
            const select = neighborhoods[index];
            await axios.put(`${uri}/api/client/${msg.from}`, {
                bairro: select.name
            });
            return msgAux = `✅\tBairro:\n\t${select.name}\n\n${menuOptions}​`;
        },
        volver: async function (msg) { await volver(msg) },
        next: async function (msg) { await next(msg) },
        edit: async function (msg) { return this.msgOption(msg) },
        exit: async function (msg) { await exit(msg) },
        msgOptionInval: function () { return option_inval },
    },
    {// 3-numero
        key: "numero",
        dataAux: [],
        validate: function (msg) {
            return validateOptionMenu(msg);
        },
        getData: async function (msg) {
        },
        msgOption: function (msg) {
            msgAux = `✅\tInforme o Numero de sua Residencia/Apartamento:\n`;
            return msgAux;
        },
        msgConfirmation: async function (msg) {
            await axios.put(`${uri}/api/client/${msg.from}`, {
                num: msg.body
            });
            return msgAux = `✅\tNumero:\n\t${msg.body}\n\n${menuOptions}​`;
        },
        volver: async function (msg) { await volver(msg) },
        next: async function (msg) { await next(msg) },
        edit: async function (msg) { return this.msgOption(msg) },
        exit: async function (msg) { await exit(msg) },
        msgOptionInval: function () { return option_inval },
    },
    {// 4-rua
        key: "nome da rua",
        dataAux: [],
        validate: function (msg) {
            return validateOptionMenu(msg);
        },
        getData: async function (msg) {
            const result = await axios.put(`${uri}/api/client/${msg.from}`, {
                name: msg.body,
            });

            if (result) this.dataAux = result.data;
        },
        msgOption: function (msg) {
            msgAux = `✅\tDigite o nome da sua Rua:\n`;
            return msgAux;
        },
        msgConfirmation: async function (msg) {
            await this.getData(msg);
            let frete = await calcFrete(this.dataAux);
            await axios.put(`${uri}/api/client/${msg.from}`, {
                rua: msg.body,
                frete: frete
            });
            return msgAux = `✅\tRua:\n\t${msg.body}\n\n${menuOptions}​`;
        },
        volver: async function (msg) { await volver(msg) },
        next: async function (msg) { await next(msg) },
        edit: async function (msg) { return this.msgOption(msg) },
        exit: async function (msg) { await exit(msg) },
        msgOptionInval: function () { return option_inval },
    },
    {// 5-nome
        key: "nome",
        dataAux: [],
        validate: function (msg) {
            return validateOptionMenu(msg);
        },
        getData: async function (msg) {
        },
        msgOption: function (msg) {
            msgAux = `✅\tDigite o nome do cliente:\n`;
            return msgAux;
        },
        msgConfirmation: async function (msg) {
            await axios.put(`${uri}/api/client/${msg.from}`, {
                name: msg.body,
            });
            return msgAux = `✅\tConfirmar Nome\n\n${msg.body}\n\n${menuOptions}​`;
        },
        volver: async function (msg) { await volver(msg) },
        next: async function (msg) { await next(msg) },
        edit: async function (msg) { return this.msgOption(msg) },
        exit: async function (msg) { await exit(msg) },
        msgOptionInval: function () { return option_inval },
    },
    {// 6-Pedidos
        key: "pedidos",
        dataAux: { orders: [], productsList: [], category: [] },
        validate: function (msg) {
            if (msg.body.match(/\d/)) {
                array_aux = msg.body.match(/\d+/g).map(Number);
                // salvar o maior valor
                let max = Math.max(...array_aux);
                return (max <= this.dataAux.productsList.length);
            }
        },
        getData: async function (msg) {
            msgAux = msg_inicial_cardapio;
            this.dataAux.productsList.forEach((item, index) => {
                msgAux += `${index + 1} 👉​${item.name}\n👇\nR$ ${item.price}\n\n`
            });
            msgAux += msg_fim_cardapio;
            const orders = msgAux;
            this.dataAux.orders = orders;
        },
        msgOption: async function (msg) {
            await this.getData(msg);
            return this.dataAux.orders;
        },
        msgConfirmation: async function (msg) {
            array_aux = msg.body.match(/\d+/g).map(Number);
            let orders_for_add = array_aux.map(indice => this.dataAux.productsList[indice - 1]);
            try {
                const response = await axios.get(`${uri}/api/client/${msg.from}`);
                const orders = response.data.orders;
                orders_for_add.forEach(element => {
                    orders.push(element);
                });
                await axios.put(`${uri}/api/client/${msg.from}`, { orders: orders });
            } catch (error) {
                // Tratamento de erros
                if (error.response) {
                    // O servidor respondeu com um status diferente de 2xx
                    const { status, data } = error.response;
                    console.error(`Erro na API: Status ${status}, Dados:`, data);
                    return `Erro ao atualizar etapa (Status: ${status})`;
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
            data = array_aux.map(indice => this.dataAux.productsList[indice - 1]);
            msgAux = `✅\tAdicionado:\n`;
            data.forEach(element => {
                msgAux += `${element.name}\n`;
            });
            msgAux += `\n\n${menuOptions}​`;
            return msgAux;
        },
        volver: async function (msg) { await volver(msg) },
        next: async function (msg) { await next(msg) },
        // quando clicado em opções no menu de pedidos, ir para edição de pedidos
        edit: async function (msg) {
            await next(msg);
            return await menuSteps[7].msgOption(msg);
        },
        exit: async function (msg) { await exit(msg) },
        msgOptionInval: function () { return option_inval },
    },
    {// 7-Edição de Pedidos
        key: "Edição de Pedidos",
        dataAux: [],
        validate: function (msg) {
            if (msg.body.match(/\d/)) {
                array_aux = msg.body.match(/\d+/g).map(Number);
                // salvar o maior valor
                let max = Math.max(...array_aux);
                return (max <= this.dataAux.orders.length);
            }
        },
        getData: async function (msg) {
            const result = await axios.get(`${uri}/api/client/${msg.from}`);
            if (result.data) this.dataAux = result.data;
        },
        msgOption: async function (msg) {
            await this.getData(msg);
            if (this.dataAux.orders.length > 0) {
                data = text_tab;
                total = 0;
                this.dataAux.orders.forEach((element, index) => {
                    total += element.price;
                    data += `${index + 1} 👉​${element.name}\n👇\nR$ ${element.price}\n\n`;
                });
                msgAux = `✅\tPedidos Confirmados
                \n${data}
                \nTotal:\tR$ ${total.toFixed(precision)}
                \nDigite as opções que deseja excluir do pedido
                \n
                \n${menuOptions}​`;
                return msgAux;
            } else {
                return msg_orders_void;
            }
        },
        msgConfirmation: async function (msg) {
            if (this.dataAux.orders.length > 0) {
                let arrays = array_aux.map(indice => this.dataAux.orders[indice - 1]);
                total = 0;
                data = '';
                x = 1;
                arrays.forEach(element => {
                    //total += element.value;
                    data += `❌ 👉​${element.name}\n👇\nR$ ${element.price}\n\n`;
                    x++;
                });
                msgAux = `✅\tPedidos Exluidos\n${data}${menuOptions}​`;
                let orders_for_dell = array_aux.map(indice => this.dataAux.orders[indice - 1]);
                /*
                await ClientZap.findOneAndUpdate(
                    { phone: msg.from },
                    { $pull: { orders: { $in: orders_for_dell } } },
                    { new: true }
                );
                */
                //console.log("Elemento removido do array e documento atualizado.");
                return msgAux;
            } else {
                return msg_orders_void;
            }
        },
        volver: async function (msg) { await volver(msg) },
        next: async function (msg) { await next(msg) },
        edit: async function (msg) { return await this.msgOption(msg) },
        exit: async function (msg) { await exit(msg) },
        msgOptionInval: function () { return option_inval },
    },
    {// 8-pagamento
        key: "pagamento",
        dataAux: ["Dinheiro", "Cartão", "Pix"],
        validate: function (msg) {
            return validateOptionNum(msg, this.dataAux);
        },
        getData: async function (msg) {
            const result = await axios.get(`${uri}/api/client/${msg.from}`);
            if (result.data) this.dataAux = result.data;
        },
        msgOption: async function (msg) {
            return money_type;
        },
        msgConfirmation: async function (msg) {
            const pags = this.dataAux;
            await this.getData(msg);
            index = parseInt(msg.body) - 1;
            data = text_tab;
            total = 0
            this.dataAux.orders.forEach(element => {
                total += element.price;
                data += `${element.name}\nR$ ${element.price}\n`;
            });
            total += this.dataAux.frete;
            await axios.put(`${uri}/api/client/${msg.from}`, {
                money: pags[index],
            });

            msgAux = `✅\tPedidos 
                        \n${data}
                        \nFrete:\tR$ ${this.dataAux.frete.toFixed(precision)}
                        \nTotal:\tR$ ${total.toFixed(precision)}
                        \n✅\tPagamento:
                        \n${pags[index]}
                        \n✅\tEndereço:
                        \nR. ${this.dataAux.rua} Nº ${this.dataAux.num}
                        \n${this.dataAux.bairro} - ${this.dataAux.city}, PE
                        \n✅\tCliente:
                        \n${this.dataAux.name}
                        \n✅\tNumero: 
                        \n${msg.from.match(/\d+/)[0]}
                        \n
                        \n${menuOptions}​`
            return msgAux
        },
        volver: async function (msg) { await volver(msg) },
        next: async function (msg) { await next(msg) },
        edit: async function (msg) { return this.msgOption(msg) },
        exit: async function (msg) { await exit(msg) },
        msgOptionInval: function () { return option_inval },
    },
    {// 9-Produção
        key: "pagamento",
        dataAux: [],
        validate: function (msg) {
            return validateOptionNum(msg, this.dataAux);
        },
        getData: async function (msg) {
            const result = await axios.get(`${uri}/api/client/${msg.from}`);
            if (result.data) this.dataAux = result.data;
        },
        msgOption: async function (msg) {
            await this.getData(msg);
            index = parseInt(msg.body) - 1;
            data = text_tab;
            total = 0
            this.dataAux.orders.forEach(element => {
                total += element.price;
                data += `${element.name}\nR$ ${element.price}\n`;
            });
            total += this.dataAux.frete;
            msgAux = `✅\tPedidos Em fila de preparação
                        \n${data}
                        \nFrete:\tR$ ${this.dataAux.frete.toFixed(precision)}
                        \nTotal:\tR$ ${total.toFixed(precision)}
                        \n✅\tPagamento:
                        \n${this.dataAux.money}
                        \n✅\tEndereço:
                        \nR. ${this.dataAux.rua} Nº ${this.dataAux.num}
                        \n${this.dataAux.bairro} - ${this.dataAux.city}, PE
                        \n✅\tCliente:
                        \n${this.dataAux.name}
                        \n✅\tNumero: 
                        \n${msg.from.match(/\d+/)[0]}
                        \n
                        \nFinalizado✅
                        \nAvisaremos quando o pedido sair pra entrega 🛵
                        \n
                        \n\t\t${end_atendiment}​`


            //await ClientZap.deleteOne({ phone: msg.from });

            await axios.post(`${uri}/api/ordens`,
                {
                    etapa: this.dataAux.etapa,
                    phone: this.dataAux.phone,
                    name: this.dataAux.name,
                    city: this.dataAux.city,
                    address: this.dataAux.address,
                    bairro: this.dataAux.bairro,
                    num: this.dataAux.num,
                    rua: this.dataAux.rua,
                    frete: this.dataAux.frete,
                    orders: this.dataAux.orders,
                    money: this.dataAux.money,
                },
                { // Configurações (headers, etc)
                    headers: {
                        Authorization: `Bearer ${msg.token}`
                    }
                }).
                then(res => {
                    //console.log("Ordens Confirmadas")
                })
                .catch(err => {
                    console.error('getData: Ordens Confirmadas Erro na requisição:', err.response?.data || err.message);
                });

            return msgAux
        },
        msgConfirmation: async function (msg) { },
        volver: async function (msg) { await volver(msg) },
        next: async function (msg) { await next(msg) },
        edit: async function (msg) { return await this.msgOption(msg) },
        exit: async function (msg) { await exit(msg) },
        msgOptionInval: function () { return option_inval },
    },
];

async function getData(msg) {

    await axios.get(`${uri}/api/cities/${msg.userId}`, // URL
        { // Configurações (headers, etc)
            headers: {
                Authorization: `Bearer ${msg.token}`
            }
        }).
        then(res => {

            menuSteps[0].dataAux = []; // limpar array
            menuSteps[1].dataAux = []; // limpar array
            menuSteps[2].dataAux = []; // limpar array

            res.data.cities.forEach(citys => {
                // salvar em todas as etapas que precisam de cidades
                menuSteps[0].dataAux.push(citys);
                menuSteps[1].dataAux.push(citys);
                menuSteps[2].dataAux.push(citys);
            });
        })
        .catch(err => {
            console.error('getData: /api/cities/ Erro na requisição:', err.response?.data || err.message);
        });

    await axios.get(`${uri}/api/category/${msg.userId}`).
        then(res => {
            res.data.categories.forEach(element => {
                element.items.forEach((item) => {

                    if (item.available) {
                        menuSteps[6].dataAux.productsList.push(item);
                    }
                });
            });
            //console.log("get data:",menuSteps[6].dataAux.productsList);
        })
        .catch(err => {
            console.error('getData: /api/category/ Erro na requisição:', err.response?.data || err.message);
        });
}
// Função principal para executar o menu dinâmico
async function runDynamicMenu(msg) {
    // buscar dados de cliente
    try {
        const clientResult = await axios.get(`${uri}/api/client/${msg.from}`);
        if (clientResult.status === 200) {
            if (menuSteps[clientResult.data.etapa].validate(msg)) {
                // Verificação se entrada é válida para confimação

                return await menuSteps[clientResult.data.etapa].msgConfirmation(msg);
            } else if (msg.body === "B" || msg.body === "b") {
                // msg de opções da etapa anterior
                if ((clientResult.data.etapa - 1) >= 0) {
                    // voltar
                    await menuSteps[clientResult.data.etapa].volver(msg);
                    return await menuSteps[clientResult.data.etapa - 1].msgOption(msg);
                } else {
                    return await menuSteps[clientResult.data.etapa].msgOption(msg);
                }
            } else if (msg.body === "A" || msg.body === "a") {
                // Incrementa etapa
                await menuSteps[clientResult.data.etapa].next(msg);
                // msg de opções da proxima etapa
                if (clientResult.data.etapa < 6 || clientResult.data.orders.length > 0) {
                    return await menuSteps[clientResult.data.etapa + 1].msgOption(msg);
                } else {
                    return msg_orders_void;
                }
            } else if (msg.body === "O" || msg.body === "o") {
                // Edição
                return await menuSteps[clientResult.data.etapa].edit(msg);
            } else if (msg.body === "X" || msg.body === "x") {
                // Sair
                return await exit(msg);
            } else {
                // Opção Invalida
                return option_inval;
            }
        }
    } catch (error) {
        // Tratamento de erros

        //console.debug("Erro em runDynamicMenu:", error.message);

        if (error.response) {
            const { status } = error.response;

            if (status === 404) {
                //console.debug("Cliente não encontrado. Iniciando etapa de cadastro.", { from: msg.from });
                if (!menuSteps?.[0]?.msgOption) {
                    return "Erro ao iniciar o menu. Contate o suporte.";
                }
                return await menuSteps[0].msgOption(msg);
            }

            if (status === 401 || status === 403) {
                return "Sessão inválida. Por favor, inicie uma nova conversa.";
            }

            if (status === 429) {
                return "Muitas requisições. Aguarde e tente novamente.";
            }

            if (status >= 500) {
                console.error("Erro 5xx na API:", { status, from: msg.from });
                return "Estamos com instabilidade. Tente novamente mais tarde.";
            }

            // Outros erros 4xx
            console.warn("Erro 4xx na API:", { status, from: msg.from });
            return "Não foi possível processar sua solicitação.";

        } else if (error.request) {
            console.error("Sem resposta do servidor:", { from: msg.from });
            return "Não foi possível conectar ao sistema. Verifique sua rede e tente novamente.";

        } else {
            console.error("Erro na configuração da requisição:", error.message);
            return "Erro interno no bot. Estamos verificando o problema. digite x para reiniciar";
        }

        console.error("Erro desconhecido:", error);
        return "Erro desconhecido. Tente novamente mais tarde.";
    }
}

module.exports = runDynamicMenu;