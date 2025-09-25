// integration.test.js
const axios = require('axios');
const request = require("supertest");
const dataMenu = require('../src/util/dataMenu');

require('dotenv').config();

const uri = `${process.env.API_URL}`;
// precisa da api e de um user cadastrado
let phoneForTest = "55183456789";
const email = 'alex@example.com';
const password = 'password321';
let token;
let userId;

beforeAll(async () => {
    /*
    await axios.post(`${uri}/api/client/${phoneForTest}`,
        {
            email: email,
            password: password
        }).
        then(async res => {
            if (res.status === 200) {
                // 2️⃣ Se existir, deleta
                await axios.delete(`${uri}/api/client/${phoneForTest}`);
            }
        })
        .catch(err => {
            console.error('Erro na requisição sessions:', err.response?.data || err.message);
        });
    */


    await axios.post(`${uri}/api/sessions/login`,
        {
            email: email,
            password: password
        }).
        then(res => {
            token = res.data.token;
            userId = res.data.userId;
        })
        .catch(err => {
            console.error('Erro na requisição sessions:', err.response?.data || err.message);
        });
    //console.log(userId)
});

afterAll(async () => {
    const response = await request(uri).delete(`/api/client/${phoneForTest}`);
});


describe('Testando erros', () => {

    it('Mensagem boas vindas', async () => {
        const msg = { from: phoneForTest, body: 'bom dia', userId: userId, token: token };
        const response = await dataMenu(msg);
        // Mensagem de boas vindas e de opções de cidades
        console.log(response);
        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.status).toBe(200);
        expect(clientZap.data.etapa).toBe(1);
    });

    it('Etapa=1 e Seleção de Cidade entrada inválida numerica', async () => {
        // Seleção da cidade
        const msg = { from: phoneForTest, body: '10', userId: userId, token: token };
        const response = await dataMenu(msg);
        // Opções de cidades
        console.log(response);
        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(1);
        expect(response).toBe(`❌​\tOpção invalida`);
    });

    it('Etapa=1 e Seleção de Cidade entrada inválida letra', async () => {
        const msg = { from: phoneForTest, body: 'B', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);
        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(1);
    });

    it('Etapa=1 e Seleção de Cidade entrada valida', async () => {
        const msg = { from: phoneForTest, body: '1', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);
        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(1);
    });
    it('Confirmação de Cidade e ir para Etapa 2', async () => {
        const msg = { from: phoneForTest, body: 'A', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);

        expect(clientZap.data.etapa).toBe(2);
    });

    it('Voltar para Etapa 1', async () => {
        const msg = { from: phoneForTest, body: 'B', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);

        expect(clientZap.data.etapa).toBe(1);
    });

    it('Etapa=1 e Seleção de Cidade valida', async () => {
        // Seleção da cidade
        const msg = { from: phoneForTest, body: '1', userId: userId, token: token };
        const response = await dataMenu(msg);
        // Opções de cidades
        console.log(response);
        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(1);
    });

    it('Confirmação de Cidade e ir para Etapa 2', async () => {
        const msg = { from: phoneForTest, body: 'A', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);

        expect(clientZap.data.etapa).toBe(2);
    });

    it('Etapa=2 e Seleção de Bairro', async () => {
        const msg = { from: phoneForTest, body: '1', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(2);
        expect(clientZap.data.bairro).toBe('Boa Viagem');

    });
    // Testes sequenciais sem testar o menu de retorno
    it('Confirmação de Bairro e ir para Etapa 3', async () => {
        const msg = { from: phoneForTest, body: 'A', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(3);
    });

    it('Etapa=3 e Cadastro de Numero da residencia', async () => {
        const msg = { from: phoneForTest, body: '734', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.num).toBe('734');
    });
    it('Confirmação de Numero residencia e ir para Etapa 4', async () => {
        const msg = { from: phoneForTest, body: 'A', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(4);
    });

    it('Etapa=4 e Cadastro de Nome da Rua', async () => {
        const msg = { from: phoneForTest, body: 'Rua do Futuro', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.rua).toBe('Rua do Futuro');
    });

    it('Confirmação de Nome da Rua e ir para Etapa 5', async () => {
        const msg = { from: phoneForTest, body: 'A', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(5);
        //expect(clientZap.frete).toBe(0.71);
    });

    it('Etapa=5 e Cadastro de Nome do Cliente', async () => {
        const msg = { from: phoneForTest, body: 'Paulo', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.name).toBe('Paulo');
    });


    it('Confirmação de Nome do Cliente e ir para Etapa 6', async () => {
        const msg = { from: phoneForTest, body: 'A', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(6);


    });

    it('Etapa=6 e Cadastro Pedido', async () => {
        const msg = { from: phoneForTest, body: '3,2,1', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);
        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        let auxArray = [];
        clientZap.data.orders.forEach(element => {
            auxArray.push(element);
        });
        expect(auxArray[0].name).toBe('4 queijos');
        expect(auxArray[1].name).toBe('pepperoni');
        expect(auxArray[2].name).toBe('frango com catupiry');
    });

    it('Opção de edição ir para Etapa 7', async () => {
        const msg = { from: phoneForTest, body: 'O', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(7);
    });

    it('Etapa=7 e Edição de Pedido', async () => {
        const msg = { from: phoneForTest, body: '1,3', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        let auxArray = [];
        clientZap.data.orders.forEach(element => {
            auxArray.push(element);
        });
        expect(auxArray[0].name).toBe('4 queijos');
        expect(auxArray[1].name).toBe('pepperoni');

    });

    it('Confirmação de Pedido e ir para Etapa 8', async () => {
        const msg = { from: phoneForTest, body: 'A', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(8);
    });

    it('Etapa=8 voltar para Etapa 7 usando B', async () => {
        const msg = { from: phoneForTest, body: 'b', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(7);
    });

    it('Etapa=7 voltar para Etapa 6 usando B', async () => {
        const msg = { from: phoneForTest, body: 'b', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(6);
    });

    it('Etapa=6 voltar para Etapa 5 usando B', async () => {
        const msg = { from: phoneForTest, body: 'b', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(5);
    });

    it('Etapa=5 voltar para Etapa 4 usando B', async () => {
        const msg = { from: phoneForTest, body: 'b', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(4);
    });

    it('Etapa=4 voltar para Etapa 3 usando B', async () => {
        const msg = { from: phoneForTest, body: 'b', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(3);
    });

    it('Etapa=3 voltar para Etapa 2 usando B', async () => {
        const msg = { from: phoneForTest, body: 'b', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(2);
    });

    it('Etapa=2 teste do X exit e exclusão', async () => {
        const msg = { from: phoneForTest, body: 'X', userId: userId, token: token };
        const response = await dataMenu(msg);
        console.log(response);

        try {
            const response = await axios.get(`${uri}/api/client/${msg.from}`);
            // Se chegou aqui, a API NÃO retornou 404 → falha o teste
            expect(true).toBe(false); // força falha
        } catch (error) {
            // Verifica se é um erro do Axios com status 404
            expect(error.response.status).toBe(404);
            expect(error.response.data).toHaveProperty('error');
        }

    });

});

describe('Testando Sequencia completa do Menu', () => {

    it('Mensagem boas vindas', async () => {
        const msg = { from: phoneForTest, body: 'bom dia', userId: userId, token: token };
        const response = await dataMenu(msg);
        // Mensagem de boas vindas e de opções de cidades
        console.log(response);
        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.status).toBe(200);
        expect(clientZap.data.etapa).toBe(1);
    });
    
    it('Etapa=1 e Seleção de Cidade', async () => {
        // Seleção da cidade
        const msg = { from: phoneForTest, body: '2', userId: userId , token: token };
        const response = await dataMenu(msg);
        // Opções de cidades
        console.log(response);
        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.city).toBe('Jaboatão dos Guararapes');
    });

    it('Confirmação de Cidade e ir para Etapa 2', async () => {
        const msg = { from: phoneForTest, body: 'A', userId: userId , token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);

        expect(clientZap.data.etapa).toBe(2);
    });

    it('Etapa=2 e Seleção de Bairro', async () => {
        const msg = { from: phoneForTest, body: '1', userId: userId , token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.bairro).toBe('Cajueiro Seco');
    });

    it('Confirmação de Bairro e ir para Etapa 3', async () => {
        const msg = { from: phoneForTest, body: 'A', userId: userId  , token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(3);
    });

    it('Etapa=3 e Cadastro de Numero da residencia', async () => {
        const msg = { from: phoneForTest, body: '734', userId: userId , token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.num).toBe('734');
    });
    it('Confirmação de Numero residencia e ir para Etapa 4', async () => {
        const msg = { from: phoneForTest, body: 'A', userId: userId , token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(4);
    });

    it('Etapa=4 e Cadastro de Nome da Rua', async () => {
        const msg = { from: phoneForTest, body: 'Rua do Futuro', userId: userId , token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.rua).toBe('Rua do Futuro');
    });

    it('Confirmação de Nome da Rua e ir para Etapa 5', async () => {
        const msg = { from: phoneForTest, body: 'A', userId: userId , token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(5);
        //expect(clientZap.frete).toBe(0.71);
    });

    it('Etapa=5 e Cadastro de Nome do Cliente', async () => {
        const msg = { from: phoneForTest, body: 'Paulo', userId: userId , token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.name).toBe('Paulo');
    });


    it('Confirmação de Nome do Cliente e ir para Etapa 6', async () => {
        const msg = { from: phoneForTest, body: 'A', userId: userId , token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(6);


    });



    it('Etapa=6 e Cadastro Pedido', async () => {
        const msg = { from: phoneForTest, body: '3,2,1', userId: userId , token: token };
        const response = await dataMenu(msg);
        console.log(response);
        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        let auxArray = [];
        clientZap.data.orders.forEach(element => {
            auxArray.push(element);
        });
        expect(auxArray[0].name).toBe('4 queijos');
        expect(auxArray[1].name).toBe('pepperoni');
        expect(auxArray[2].name).toBe('frango com catupiry');
    });

    it('Opção de edição ir para Etapa 7', async () => {
        const msg = { from: phoneForTest, body: 'O', userId: userId , token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(7);
    });

    it('Etapa=7 e Edição de Pedido', async () => {
        const msg = { from: phoneForTest, body: '1,3', userId: userId , token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        let auxArray = [];
        clientZap.data.orders.forEach(element => {
            auxArray.push(element);
        });
        expect(auxArray[0].name).toBe('4 queijos');
        expect(auxArray[1].name).toBe('pepperoni');

    });

    it('Confirmação de Pedido e ir para Etapa 8', async () => {
        const msg = { from: phoneForTest, body: 'A', userId: userId , token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(8);
    });

    it('Etapa=8 e Tipo de Pagamento', async () => {
        const msg = { from: phoneForTest, body: '3', userId: userId , token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.money).toBe('Pix');
    });

    it('Confirmação de Tipo de Pagamento e Finalizar', async () => {
        const msg = { from: phoneForTest, body: 'A', userId: userId , token: token };
        const response = await dataMenu(msg);
        console.log(response);

        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);

        expect(clientZap.data.etapa).toBe(9);

    });
    
    it('Confirmação Nova operação', async () => {
        const msg = { from: phoneForTest, body: 'bom dia' , userId: userId , token: token };
        const response = await dataMenu(msg);
        console.log(response);
 
        const clientZap = await axios.get(`${uri}/api/client/${msg.from}`);
        expect(clientZap.data.etapa).toBe(9);
    });
    
});