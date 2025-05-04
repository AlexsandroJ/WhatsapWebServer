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

async function handleMenu(msg) {
    let response;
    try {
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

        // Verificação
        const result = await ClientZap.findOne({ phone: msg.from });
        if (result) {
            switch (result.etapa) {
                case 1:// Boas vindas e Selecão de Cidade
                    data = `✅\tSelecione Sua Cidade:\n\n`;
                    x = 0;

                    citys.forEach(element => {
                        data += `${x + 1} 👉​${element}\n`;
                        x++
                    });
                    msgAux = `${data}\n\n`;

                    if (msg.body.length == 1) {
                        index = parseInt(msg.body) - 1;
                        x = 0;
                        let city = '';
                        citys.forEach(element => {
                            if (index == x) {
                                city = element;
                                msgAux = `✅\tCidade:\n\t${element}\n\n${edition}​\n${confirmation}\n`;
                                response = msgAux;
                            }
                            x++;
                        });
                        if (city != '') {
                            await ClientZap.findOneAndUpdate(
                                { phone: msg.from },
                                { city: city },
                                { new: true }
                            );
                        }

                        if (result.city != "") {
                            if (msg.body === "A") {
                                x = 0;
                                data = `✅\tSelecione Seu Bairro:\n`;

                                cidadesDePE[result.city].forEach(element => {
                                    data += `${x + 1} 👉​${element}\n`;
                                    x++
                                });
                                msgAux = `${data}\n\n`;
                                await ClientZap.findOneAndUpdate(
                                    { phone: msg.from },
                                    { $inc: { etapa: 1 } },
                                    { new: true }
                                );
                                return msgAux;
                            } else if (msg.body === "O") {
                                return msgAux;
                            }
                        }
                    } else {
                        return option_inval;
                    }

                    break;
                case 2:// Selecão de Bairro
                    x = 0;
                    data = `✅\tSelecione Seu Bairro:\n`;

                    cidadesDePE[result.city].forEach(element => {
                        data += `${x + 1} 👉​${element}\n`;
                        x++
                    });

                    msgAux = `${data}\n\n`;
                    if (msg.body.length == 1) {
                        index = parseInt(msg.body) - 1;
                        x = 0;
                        let bairro = '';

                        cidadesDePE[result.city].forEach(element => {
                            if (index == x) {
                                bairro = element;
                                msgAux = `✅\tBairro:\n\t${element}\n\n${edition}​\n${confirmation}\n`;
                                response = msgAux;
                            }
                            x++
                        });
                        if (bairro != '') {
                            await ClientZap.findOneAndUpdate(
                                { phone: msg.from },
                                { bairro: bairro },
                                { new: true }
                            );
                        }

                        if (result.bairro != "") {
                            if (msg.body === "A") {
                                msgAux = `✅\tInforme o Numero de sua Residencia/Apartamento:\n`;
                                await ClientZap.findOneAndUpdate(
                                    { phone: msg.from },
                                    { $inc: { etapa: 1 } },
                                    { new: true }
                                );
                                return msgAux
                            } else if (msg.body === "O") {
                                return msgAux;
                            } else {

                                return option_inval;
                            }
                        }
                    } else {
                        return option_inval;
                    }
                    break;
                case 3:// Numero da Rua 
                    if (!(msg.body === "A") && !(msg.body === "O")) {
                        msgAux = `✅\tNumero:\n\t${msg.body}\n\n${edition}​\n${confirmation}\n`;
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            { num: msg.body },
                            { new: true }
                        );
                        return msgAux
                    }
                    if (msg.body === "A") {
                        msgAux = `✅\tDigite o nome da sua Rua:\n`;
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            { $inc: { etapa: 1 } },
                            { new: true }
                        );
                        return msgAux
                    } else if (msg.body === "O") {
                        msgAux = `✅\tInforme o Numero de sua Residencia/Apartamento:\n`;
                        return msgAux
                    }
                    break;
                case 4:// Nome da Rua
                    if (!(msg.body === "A") && !(msg.body === "O")) {
                        msgAux = `✅\t${msg.body}\n\n${edition}​\n${confirmation}\n`;
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            { rua: msg.body },
                            { new: true }
                        );
                        return msgAux
                    }
                    if (msg.body === "A") {
                        let frete = await calcFrete(result);
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            {
                                $inc: { etapa: 1 },
                                frete: frete
                            },
                            { new: true }
                        );
                        return get_the_name;
                    } else if (msg.body === "O") {
                        msgAux = `✅\tDigite o nome da sua Rua:\n`;
                        return msgAux
                    }
                    break;
                case 5:// Nome Cliente
                    if (msg.body.length >= 3) {
                        msgAux = `✅\tConfirmar Nome\n\n${msg.body}\n\n${edition}​\n${confirmation}\n`;
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            { name: msg.body },
                            { new: true }
                        );
                        return msgAux
                    } else if (msg.body === "A") {
                        let frete = await calcFrete(result);
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            {
                                $inc: { etapa: 1 },
                                frete: frete
                            },
                            { new: true }
                        );
                        return orders;
                    } else if (msg.body === "O") {
                        return get_the_name;
                    } else {
                        return option_inval;
                    }
                    break;
                case 6:// Pedidos
                    //Criação do menu de pedidos
                    //index = parseInt(msg.body) - 1;
                    //console.log( "Valores: ",Math.max(...msg.body.match(/\d+/g)) ," diferente de null:",msg.body.match(/\d+/g)!=null);
                    if (msg.body.match(/\d/)) {

                        array_aux = msg.body.match(/\d+/g).map(Number);
                        // salvar o maior valor
                        let max = Math.max(...array_aux);
                        if ((max - 1) < productsList.length) {


                            let orders_for_add = array_aux.map(indice => productsList[indice - 1]);
                            await ClientZap.findOneAndUpdate(
                                { phone: msg.from },
                                { $push: { orders: { $each: orders_for_add } } },
                                { new: true }
                            );

                            data = array_aux.map(indice => productsList[indice]);
                            msgAux = `✅\tAdicionado:\n`;
                            data.forEach(element => {
                                msgAux += `${element.type}\n`;
                            });
                            msgAux += `\n\n${edition}\n${returne}\n${confirmation}\n`;
                            return msgAux;
                        } else {
                            return option_inval;
                        }

                    } else if (msg.body === "#") {
                        //await collection_personal_service.insertOne({ phone: msg.from });
                        //await collection.deleteOne(filter);
                        response = personal_service;
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            { etapa: 10 },
                            { new: true }
                        );

                    } else if (msg.body === "O") {
                        data = text_tab;
                        total = 0;
                        x = 1;
                        result.orders.forEach(element => {
                            total += element.value;
                            data += `${x} 👉​${element.type}\n👇\nR$ ${element.value}\n\n`;
                            x++;
                        });
                        msgAux = `✅\tPedidos Confirmados\n${data}\nTotal: R$ ${total.toFixed(precision)}\nDigite as opções que deseja excluir do pedido\n\n${confirmation}\n`;
                        response = msgAux
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            { etapa: 7 },
                            { new: true }
                        );

                    } else if (msg.body === "B") {
                        return orders;
                    } else if (msg.body === "A") {
                        response = money_type;
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            { etapa: 8 },
                            { new: true }
                        );
                    } else {
                        return option_inval;
                    }
                    break;
                case 7:// Edição de Pedidos
                    data = text_tab;

                    total = 0;
                    x = 1;
                    result.orders.forEach(element => {
                        total += element.value;
                        data += `${x} 👉​${element.type}\n👇\nR$ ${element.value}\n\n`;
                        x++;
                    });
                    msgAux = `✅\tPedidos Confirmados\n${data}\nTotal:\tR$ ${total.toFixed(precision)}\nDigite as opções que deseja excluir do pedido\n\n${returne}\n${confirmation}\n`;
                    if (msg.body === "O") {
                        return msgAux
                    } else if (msg.body === "B") {
                        response = orders;
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            { etapa: 6 },
                            { new: true }
                        );

                    } else if (msg.body === "A" && result.orders.length > 0) {
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            { etapa: 8 },
                            { new: true }
                        );
                        return money_type;
                    } else {
                        if (result.orders.length > 0) {
                            if (msg.body.match(/\d+/g) != null) {
                                array_aux = msg.body.match(/\d+/g).map(Number);
                                let max = Math.max(...array_aux);
                                if ((max - 1) < result.orders.length) {

                                    let arrays = array_aux.map(indice => result.orders[indice - 1]);

                                    total = 0;
                                    data = '';
                                    x = 1;
                                    arrays.forEach(element => {
                                        //total += element.value;
                                        data += `❌ 👉​${element.type}\n👇\nR$ ${element.value}\n\n`;
                                        x++;
                                    });
                                    msgAux = `✅\tPedidos Exluidos\n${data}${edition}\n${returne}\n${confirmation}\n`;

                                    let orders_for_dell = array_aux.map(indice => result.orders[indice - 1]);

                                    await ClientZap.findOneAndUpdate(
                                        { phone: msg.from },
                                        { $pull: { orders: { $in: orders_for_dell } } },
                                        { new: true }
                                    );
                                    //console.log("Elemento removido do array e documento atualizado.");
                                    return msgAux;
                                } else {
                                    return option_inval;
                                }
                            }
                        } else if (result.orders.length == 0) {
                            //return msg_dell_orders);
                            // falta imprementar --------------------------------------------------------<
                            if (msg.body === "A") {
                                //escluir dados
                                //await collection.deleteOne(filter);
                                //await ClientZap.deleteOne({ phone: msg.from });
                                return dell_confirmation;
                            } else if (msg.body === "B") {
                                //voltar para cardapio
                                await ClientZap.findOneAndUpdate(
                                    { phone: msg.from },
                                    { etapa: 6 },
                                    { new: true }
                                );

                                return orders;
                            } else {
                                return option_inval;
                            }
                        }
                    }
                    break;
                case 8:
                    //criação de string do menu de dados
                    data = text_tab;
                    total = 0
                    result.orders.forEach(element => {
                        total += element.value;
                        data += `${element.type}\nR$ ${element.value}\n`;
                    });
                    total += result.frete;
                    //Area de teste e debug
                    if (msg.body === "4") {
                        return menuFormatado;
                    }
                    //Conferindo opção de pagamento
                    if (result.money == 1) {
                        option_pag = pag_type_money;
                    } else if (result.money == 2) {
                        option_pag = pag_type_cart;
                    } else if (result.money == 3) {
                        option_pag = pag_type_pix;
                    }
                    //Opções de pagamento
                    if (msg.body === "1") {// dinheiro
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            { money: 'Dinheiro' },
                            { new: true }
                        );

                        return pag_money;
                    } else if (msg.body === "2") {// cartão
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            { money: 'Cartão' },
                            { new: true }
                        );

                        return pag_cart;
                    } else if (msg.body === "3") {// pix
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            { money: 'Pix' },
                            { new: true }
                        );

                        return pag_pix;
                    } else if (msg.body === "O") {
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            { etapa: 1 },
                            { new: true }
                        );

                        return orders;
                    } else if (msg.body === "B") {
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            { etapa: 6 },
                            { new: true }
                        );

                        return orders;
                    } else if (msg.body === "A") {
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            { etapa: 9 },
                            { new: true }
                        );

                        msgAux = `✅\tPedidos \n${data}\nFrete:\tR$ ${result.frete.toFixed(precision)}\nTotal:\tR$ ${total.toFixed(precision)}\n✅\tPagamento:\n${option_pag}\n✅\tEndereço:\nR. ${result.rua} Nº ${result.num}\n${result.bairro} - ${result.city}, PE\n✅\tCliente:\n${result.name}\n✅\tNumero: \n${msg.from.match(/\d+/)[0]}\n\n${edition}\n${returne}\n​​${confirmation}\n `;
                        return msgAux
                    } else {
                        return option_inval;
                    }
                    break;
                case 9:
                    data = text_tab;
                    total = 0
                    result.orders.forEach(element => {
                        total += element.value;
                        data += `${element.type}\nR$ ${element.value}\n`;
                    });
                    total += result.frete;
                    //Conferindo opção de pagamento
                    if (result.money == 'Dinheiro') {
                        option_pag = pag_type_money;
                    } else if (result.money == 'Cartão') {
                        option_pag = pag_type_cart;
                    } else if (result.money == 'Pix') {
                        option_pag = pag_type_pix;
                    }
                    if (msg.body === "A") {
                        msgAux = `✅\tPedidos Em fila de preparação\n${data}\nFrete:\tR$ ${result.frete.toFixed(precision)}\nTotal:\tR$ ${total.toFixed(precision)}\n✅\tPagamento:\n${option_pag}\n✅\tEndereço:\nR. ${result.rua} Nº ${result.num}\n${result.bairro} - ${result.city}, PE\n✅\tCliente:\n${result.name}\n✅\tNumero: \n${msg.from.match(/\d+/)[0]}\n\nFinalizado✅\nAvisaremos quando o pedido sair pra entrega 🛵\n\n\t\t${end_atendiment}​`;

                        //await collection_orders.insertOne(result);

                        await ClientZap.deleteOne({ phone: msg.from });
                        return msgAux
                    } else if (msg.body === "B") {
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            { etapa: 6 },
                            { new: true }
                        );

                        return orders;
                    } else {
                        return option_inval;
                    }
                    break;
                case 10:
                    if (msg.body === "A") {
                        await ClientZap.findOneAndUpdate(
                            { phone: msg.from },
                            { etapa: 1 },
                            { new: true }
                        );

                        //await collection.deleteOne(filter);
                        return orders;
                    } else {
                        return personal_service;
                    }
                    break;

                default:
                    // Este ponto nunca deve ser alcançado devido à verificação inicial
                    throw new Error("Opção inválida, etapa fora do escorpo do projeto");
            }
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
        return response;
    } catch (error) {
        console.error('Ocorreu um erro:', error);
        process.exit(1);
    }
};

module.exports = handleMenu;