// integration.test.js
const axios = require('axios');
const request = require("supertest");
const AiAgent = require('../util/AiAgent');

require('dotenv').config();

const uri = process.env.API_URL;

let phoneForTest = "55123456789";

beforeAll(async () => {

});

afterAll(async () => {
     await fetch(`${uri}/api/client/${phoneForTest}`, {method: "DELETE",});
});


describe('Testando AiAgent', () => {
   
    it('Mensagem boas vindas', async () => {
        const msg = { from: phoneForTest, body: 'bom dia' };
        const response = await AiAgent(msg);
        
        console.log(response);
    });

    it('Nome', async () => {
        const msg = { from: phoneForTest, body: 'alex' };
        const response = await AiAgent(msg);
        
        console.log(response);
    });

    it('Endereço', async () => {
        const msg = { from: phoneForTest, body: 'Rua do cajueiro n 734, Cajueiro seco' };
        const response = await AiAgent(msg);
        
        console.log(response);
    });

    it('Pedido', async () => {
        const msg = { from: phoneForTest, body: 'Calabreza' };
        const response = await AiAgent(msg);
        
        console.log(response);
    });

    it('Acompanhameto', async () => {
        const msg = { from: phoneForTest, body: 'não' };
        const response = await AiAgent(msg);
        
        console.log(response);
    });

    it('Confirmação', async () => {
        const msg = { from: phoneForTest, body: 'OK' };
        const response = await AiAgent(msg);
        
        console.log(response);
    });
});
