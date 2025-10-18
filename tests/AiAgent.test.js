// integration.test.js
const axios = require('axios');
const request = require("supertest");
const AiAgent = require('../src/util/AiAgent');
const e = require('express');

const timeout = 10000;
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
    }, timeout); 
    
    it('Nome', async () => {
        const msg = { from: phoneForTest, body: 'Alexsandro jose da silva' };
        const response = await AiAgent(msg);
        
        console.log(response);
    }, timeout); 
    
   it('Pedido', async () => {
        const msg = { from: phoneForTest, body: 'uma pizza de Calabresa' };
        const response = await AiAgent(msg);
        
        console.log(response);
    }, timeout); 
    
    it('Endereço', async () => {
        const msg = { from: phoneForTest, body: 'Rua do cajueiro n 734, Cajueiro seco' };
        const response = await AiAgent(msg);
        
        console.log(response);
    }, timeout); 

    it('Acompanhameto', async () => {
        const msg = { from: phoneForTest, body: 'não' };
        const response = await AiAgent(msg);
        
        console.log(response);
    }, timeout); 

    it('Confirmação', async () => {
        const msg = { from: phoneForTest, body: 'ok' };
        const response = await AiAgent(msg);
        
        console.log(response);
    }, timeout); 
    
});
