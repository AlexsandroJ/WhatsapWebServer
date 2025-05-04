// integration.test.js
const ClientZap = require('../models/clientModels');
const handleMenu = require('../util/handleMenu');
const dataTest = require('../util/productsTest');
const Products = require('../models/productsModels');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModels');
require('dotenv').config();

describe('Testando Sequencia completa do Menu', () => {
    let token;

    beforeAll(async () => {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: hashedPassword
        });

        // Gera um token JWT para o usuário
        token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
   
        // Produtos para testes
        const newProduct = new Products({ userId: user._id, products: dataTest.products });
        await newProduct.save();
    });

    it('Mensagem boas vindas', async () => {
        const msg = { from: '55123456789@c.us', body: 'bom dia' };
        const response = await handleMenu(msg);
        // Mensagem de boas vindas e de opções de cidades
        console.log(response);
        const clientZap = await ClientZap.findOne({ phone: '55123456789@c.us' });
        expect(clientZap.etapa).toBe(1);
        //expect(response).toBe('Por favor, digite seu nome:');
    });

    
    it('Etapa=1 e Seleção de Cidade', async () => {
        // Seleção da cidade
        const msg = { from: '55123456789@c.us', body: '2' };
        const response = await handleMenu(msg);
        // Opções de cidades
        console.log(response);
        const clientZap = await ClientZap.findOne({ phone: '55123456789@c.us' });
        expect(clientZap.city).toBe('Jaboatão dos Guararapes');
    });

    it('Confirmação de Cidade e ir para Etapa 2', async () => {
        const msg = { from: '55123456789@c.us', body: 'A' };
        const response = await handleMenu(msg);
        console.log(response);

        const clientZap = await ClientZap.findOne({ phone: '55123456789@c.us' });
        expect(clientZap.etapa).toBe(2);
    });

    it('Etapa=2 e Seleção de Bairro', async () => {
        const msg = { from: '55123456789@c.us', body: '1' };
        const response = await handleMenu(msg);
        console.log(response);

        const clientZap = await ClientZap.findOne({ phone: '55123456789@c.us' });
        expect(clientZap.bairro).toBe('Cajueiro Seco');
    });

    it('Confirmação de Bairro e ir para Etapa 3', async () => {
        const msg = { from: '55123456789@c.us', body: 'A' };
        const response = await handleMenu(msg);
        console.log(response);

        const clientZap = await ClientZap.findOne({ phone: '55123456789@c.us' });
        expect(clientZap.etapa).toBe(3);
    });

    it('Etapa=3 e Cadastro de Numero da residencia', async () => {
        const msg = { from: '55123456789@c.us', body: '734' };
        const response = await handleMenu(msg);
        console.log(response);

        const clientZap = await ClientZap.findOne({ phone: '55123456789@c.us' });
        expect(clientZap.num).toBe('734');
    });

    it('Confirmação de Numero residencia e ir para Etapa 4', async () => {
        const msg = { from: '55123456789@c.us', body: 'A' };
        const response = await handleMenu(msg);
        console.log(response);

        const clientZap = await ClientZap.findOne({ phone: '55123456789@c.us' });
        expect(clientZap.etapa).toBe(4);
    });

    it('Etapa=4 e Cadastro de Nome da Rua', async () => {
        const msg = { from: '55123456789@c.us', body: 'Rua do Futuro' };
        const response = await handleMenu(msg);
        console.log(response);

        const clientZap = await ClientZap.findOne({ phone: '55123456789@c.us' });
        expect(clientZap.rua).toBe('Rua do Futuro');
    });

    it('Confirmação de Nome da Rua e ir para Etapa 5', async () => {
        const msg = { from: '55123456789@c.us', body: 'A' };
        const response = await handleMenu(msg);
        console.log(response);

        const clientZap = await ClientZap.findOne({ phone: '55123456789@c.us' });
        expect(clientZap.etapa).toBe(5);
        expect(clientZap.frete).toBe(0.71);
    });

    it('Etapa=5 e Cadastro de Nome do Cliente', async () => {
        const msg = { from: '55123456789@c.us', body: 'Paulo' };
        const response = await handleMenu(msg);
        console.log(response);

        const clientZap = await ClientZap.findOne({ phone: '55123456789@c.us' });
        expect(clientZap.name).toBe('Paulo');
    });

    it('Confirmação de Nome do Cliente e ir para Etapa 6', async () => {
        const msg = { from: '55123456789@c.us', body: 'A' };
        const response = await handleMenu(msg);
        console.log(response);

        const clientZap = await ClientZap.findOne({ phone: '55123456789@c.us' });
        expect(clientZap.etapa).toBe(6);
    });

    it('Etapa=6 e Cadastro Pedido', async () => {
        const msg = { from: '55123456789@c.us', body: '3,2,1' };
        const response = await handleMenu(msg);
        console.log(response);

        const clientZap = await ClientZap.findOne({ phone: '55123456789@c.us' });
        expect(clientZap.orders[0].type).toBe('4 Queijos');
        expect(clientZap.orders[1].type).toBe('Pepperoni');
        expect(clientZap.orders[2].type).toBe('Frango com Catupiry');


    });

    it('Opção de edição ir para Etapa 7', async () => {
        const msg = { from: '55123456789@c.us', body: 'O' };
        const response = await handleMenu(msg);
        console.log(response);

        const clientZap = await ClientZap.findOne({ phone: '55123456789@c.us' });
        expect(clientZap.etapa).toBe(7);
    });

    it('Etapa=7 e Edição de Pedido', async () => {
        const msg = { from: '55123456789@c.us', body: '1,3' };
        const response = await handleMenu(msg);
        console.log(response);

        const clientZap = await ClientZap.findOne({ phone: '55123456789@c.us' });
        expect(clientZap.orders[0].type).toBe('Pepperoni');

    });

    it('Confirmação de Pedido e ir para Etapa 8', async () => {
        const msg = { from: '55123456789@c.us', body: 'A' };
        const response = await handleMenu(msg);
        console.log(response);

        const clientZap = await ClientZap.findOne({ phone: '55123456789@c.us' });
        expect(clientZap.etapa).toBe(8);
    });

    it('Etapa=8 e Tipo de Pagamento', async () => {
        const msg = { from: '55123456789@c.us', body: '3' };
        const response = await handleMenu(msg);
        console.log(response);

        const clientZap = await ClientZap.findOne({ phone: '55123456789@c.us' });
        expect(clientZap.money).toBe('Pix');
    });

    it('Confirmação de Tipo de Pagamento e ir para Etapa 9', async () => {
        const msg = { from: '55123456789@c.us', body: 'A' };
        const response = await handleMenu(msg);
        console.log(response);

        const clientZap = await ClientZap.findOne({ phone: '55123456789@c.us' });
        expect(clientZap.etapa).toBe(9);
    });

    it('Etapa=9 e Confirmação Geral Esclusão dos dados', async () => {
        const msg = { from: '55123456789@c.us', body: 'A' };
        const response = await handleMenu(msg);
        console.log(response);

        const clientZap = await ClientZap.findOne({ phone: '55123456789@c.us' });
        expect(clientZap).toBe(null);
    });
    
});


