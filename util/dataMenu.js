const axios = require('axios');
const dataTest = require('../util/productsTest');
const calcFrete = require('../util/frete');
require('dotenv').config();

const uri = `${process.env.API_URL}:${process.env.PORT}`;
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
const option_inval = `❌​\tOpção invalida`;
const personal_service = `\t💬 Aguarde um de nossos atendentes\n\n${returne}`;

const msg_orders_void = `❌\t​Pedidos Vazios\n\nEncerrar Atendimento ?\n\n${returne}​\n${exitt}\n`;
const end_atendiment = `​👍 Atendimento encerrado\n\n${despedida}`;
const dell_confirmation = `❌\tPedidos Exluido\n${end_atendiment}`;

const get_the_name = `✏️ ​Informe o nome do Cliente`;
const text_tab = `\n`;

const cidadesDePE = {
    "Recife": ["Santo Amaro", "Boa Vista", "Cidade Universitária", "Pina", "Cajueiro Seco"],
    "Jaboatão dos Guararapes": ["Cajueiro Seco", "Prazeres", "Guararapes", "Candeias", "Barro", "Piedade"],
};

const userId = '6810e8fde1c0d0c4f29a3431';
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
        await axios.put(`${uri}/api/client/${msg.from}`, { etapa: 1 });
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
const menuSteps = [
    //  estados
    {// 0-cadastro
        key: "cadastro",
        dataAux: ["Recife", "Jaboatão dos Guararapes", "Olinda", "Cabo"],
        validate: function (msg) {
            return validateOptionNum(msg, this.dataAux);
        },
        getData: async function (msg) {
            /*
            try {
                // Tenta buscar os dados no banco de dados
                const res = await ClientZap.findOne({ phone: msg.from });
                this.dataAux = res.orders
                // Verifica se os dados foram encontrados
                if (!this.data) {
                    throw new Error("Nenhum dado encontrado para o número: " + msg.from);
                }
            } catch (error) {
                // Trata o erro localmente
                console.error("Erro função getData city", error.message);
                // Define um valor padrão para 'data' em caso de erro
                this.dataAux = ["Recife", "Jaboatão dos Guararapes", "Olinda", "Cabo"];
            }*/
        },
        msgOption: async function (msg) {
            // Criação de dados
            try {
                //const newUser = await ClientZap({ phone: msg.from });
                //await newUser.save();
                const newUser = await axios.post(`${uri}/api/client/`, { 
                    phone: msg.from 
                })
                console.log(`Novo Cliente: ${newUser.data.phone}`);
                // msg inicial
                data = `Selecione Sua Cidade:\n\n`;
                x = 0;
                this.dataAux.forEach(element => {
                    data += `${x + 1} 👉​${element}\n`;
                    x++
                });
                msgAux = msgInitial + `${data}`;
                return msgAux;
            } catch (error) {
                console.error('runDynamicMenu msgOption cadastro erro:', error);
                process.exit(1);
            }
        },
        volver: async function (msg) { return option_inval },
        next: async function (msg) { await next(msg) },
        edit: async function (msg) { return await this.msgOption(msg) },
        exit: async function (msg) { return option_inval },
        msgOptionInval: function () { return option_inval },
    },
    {// 1-city
        key: "city",
        dataAux: ["Recife", "Jaboatão dos Guararapes", "Olinda", "Cabo"],
        validate: function (msg) {
            return validateOptionNum(msg, this.dataAux);
        },
        getData: async function (msg) {
            /*
            try {
                // Tenta buscar os dados no banco de dados
                const res = await ClientZap.findOne({ phone: msg.from });
                this.dataAux = res.orders
                // Verifica se os dados foram encontrados
                if (!this.data) {
                    throw new Error("Nenhum dado encontrado para o número: " + msg.from);
                }
            } catch (error) {
                // Trata o erro localmente
                console.error("Erro função getData city", error.message);
                // Define um valor padrão para 'data' em caso de erro
                this.dataAux = ["Recife", "Jaboatão dos Guararapes", "Olinda", "Cabo"];
            }*/
        },
        msgOption: function (msg) {
            msgAux = `✅\tSelecione Sua Cidade:\n\n`;
            this.dataAux.forEach((element, index) => {
                msgAux += `${index + 1} 👉 ${element}\n`;
            });
            return msgAux;
        },
        msgConfirmation: async function (msg) {
            const index = parseInt(msg.body) - 1;
            const select = this.dataAux[index];
            await axios.put(`${uri}/api/client/${msg.from}`, { 
                city: select
            });
            return msgAux = `✅\tCidade:\n\t${select}\n\n${menuOptions}​`;
        },
        volver: async function (msg) { return await volver(msg) },
        next: async function (msg) { await next(msg) },
        edit: async function (msg) { return this.msgOption(msg) },
        exit: async function (msg) { return option_inval },
        msgOptionInval: function () { return option_inval },

    },
    {// 2-bairro
        key: "bairro",
        dataAux: ["Cajueiro Seco", "Prazeres", "Guararapes", "Candeias", "Barro", "Piedade"],
        validate: function (msg) {
            return validateOptionNum(msg, this.dataAux);
        },
        getData: async function (msg) {
            /*
            try {
                // Tenta buscar os dados no banco de dados
                const res = await ClientZap.findOne({ phone: msg.from });
                this.dataAux = res.orders
                // Verifica se os dados foram encontrados
                if (!this.data) {
                    throw new Error("Nenhum dado encontrado para o número: " + msg.from);
                }
            } catch (error) {
                // Trata o erro localmente
                console.error("Erro função getData city", error.message);
                // Define um valor padrão para 'data' em caso de erro
                this.dataAux = ["Recife", "Jaboatão dos Guararapes", "Olinda", "Cabo"];
            }*/
        },
        msgOption: function (msg) {
            msgAux = `✅\tSelecione Seu Bairro:\n\n`;
            this.dataAux.forEach((element, index) => {
                msgAux += `${index + 1} 👉 ${element}\n`;
            });
            return msgAux;
        },
        msgConfirmation: async function (msg) {
            const index = parseInt(msg.body) - 1;
            const select = this.dataAux[index];
            await axios.put(`${uri}/api/client/${msg.from}`, { 
                bairro: select 
            });
            return msgAux = `✅\tCidade:\n\t${select}\n\n${menuOptions}​`;
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
            return msgAux = `✅\t${msg.body}\n\n${menuOptions}​`;
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
            let productsList = [];
            x = 1;
            msgAux = msg_inicial_cardapio;            
            const response = await axios.get(`${uri}/api/category/${userId}`);
            response.data.categories.forEach(element => {
                msgAux += `\n\t${element.category}\n\n`;
                element.items.forEach((item) => {
                    productsList.push(item);
                    msgAux += `${x} 👉​${item.name}\n👇\nR$ ${item.price}\n\n`
                    x++;
                });
            });
            msgAux += msg_fim_cardapio;
            const orders = msgAux;
            this.dataAux.productsList = productsList;
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
                x = 1;
                this.dataAux.orders.forEach(element => {
                    total += element.price;
                    data += `${x} 👉​${element.name}\n👇\nR$ ${element.price}\n\n`;
                    x++;
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
            // inserir em outra collection
            //await collection_orders.insertOne(result);
            //const newDocument = new ClientPedidos();

            // Copiar cada campo individualmente
            /*
            newDocument.etapa = this.dataAux.etapa;
            newDocument.phone = this.dataAux.phone;
            newDocument.name = this.dataAux.name;
            newDocument.city = this.dataAux.city;
            newDocument.address = this.dataAux.address;
            newDocument.bairro = this.dataAux.bairro;
            newDocument.num = this.dataAux.num;
            newDocument.rua = this.dataAux.rua;
            newDocument.frete = this.dataAux.frete;
            newDocument.orders = this.dataAux.orders;
            newDocument.money = this.dataAux.money;
            */
            // Salvar o novo documento na coleção de destino
            //await newDocument.save();

            //await ClientZap.deleteOne({ phone: msg.from });
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
// Função principal para executar o menu dinâmico
async function runDynamicMenu(msg) {
    try {
        // buscar dados de cliente
        try {
            const result = await axios.get(`${uri}/api/client/${msg.from}`);
            if (result.status === 200) {
                if (menuSteps[result.data.etapa].validate(msg)) {
                    // Verificação se entrada é válida para confimação
                    return await menuSteps[result.data.etapa].msgConfirmation(msg);
                } else if (msg.body === "B" || msg.body === "b") {
                    // msg de opções da etapa anterior
                    if ((result.data.etapa - 1) > 0) {
                        // voltar
                        await menuSteps[result.data.etapa].volver(msg);
                        return await menuSteps[result.data.etapa - 1].msgOption(msg);
                    } else {
                        return await menuSteps[result.data.etapa].msgOption(msg);
                    }
                } else if (msg.body === "A" || msg.body === "a") {
                    // Incrementa etapa
                    await menuSteps[result.data.etapa].next(msg);
                    // msg de opções da proxima etapa
                    if (result.data.etapa < 6 || result.data.orders.length > 0) {
                        return await menuSteps[result.data.etapa + 1].msgOption(msg);
                    } else {
                        return msg_orders_void;
                    }
                } else if (msg.body === "O" || msg.body === "o") {
                    // Edição
                    return await menuSteps[result.data.etapa].edit(msg);
                } else if (msg.body === "X" || msg.body === "x") {
                    // Sair
                    return await menuSteps[result.data.etapa].exit(msg);
                } else {
                    // Opção Invalida
                    return option_inval;
                }
            } 
        } catch (error) {
            // Tratamento de erros
            if (error.response) {
                // O servidor respondeu com um status diferente de 2xx
                const { status, data } = error.response;
                if (status === 404) {
                    // Cadastro de cliente
                    return await menuSteps[0].msgOption(msg);
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
        console.error('runDynamicMenu erro:', error);
        process.exit(1);
    }
}

module.exports = runDynamicMenu;