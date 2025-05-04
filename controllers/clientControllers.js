const createClientModel = require("../models/clientModels");

const ClientZap = createClientModel(process.env.COLLECTION_NAME_CLIENT_PEDIDOS);

// Criar cliente
exports.createClient = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: "O campo 'phone' é obrigatório" });
        }
        
        const newClient = new ClientZap({
            phone:phone,
        });

        const savedClient = await newClient.save();
        return res.status(201).json(savedClient);
    } catch (error) {
        //console.error("Erro ao criar cliente:", error);
        return res.status(500).json({ error: "Erro ao criar cliente", details: error.message });
    }
};

// Listar todos os clientes
exports.getAllClients = async (req, res) => {
    try {
        const clients = await ClientZap.find();
        return res.status(200).json(clients);
    } catch (error) {
        console.error("Erro ao listar clientes:", error);
        return res.status(500).json({ error: "Erro ao listar clientes", details: error.message });
    }
};

// Obter cliente por ID
exports.getClientById = async (req, res) => {
    try {
        const { phone } = req.params;
        const client = await ClientZap.findOne( phone );

        if (!client) {
            return res.status(404).json({ error: "cliente não encontrado" });
        }

        return res.status(200).json(client);
    } catch (error) {
        console.error("Erro ao obter cliente:", error);
        return res.status(500).json({ error: "Erro ao obter cliente", details: error.message });
    }
};

// Atualizar cliente
exports.updateClient = async (req, res) => {
    try {
        const { phone } = req.params;
        const updates = req.body;

        const updatedClient = await ClientZap.findOneAndUpdate(phone, updates, { new: true });

        if (!updatedClient) {
            return res.status(404).json({ error: "cliente não encontrado" });
        }

        return res.status(200).json(updatedClient);
    } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        return res.status(500).json({ error: "Erro ao atualizar cliente", details: error.message });
    }
};

// Excluir cliente
exports.deleteClient = async (req, res) => {
    try {
        const { phone } = req.params;
        
        const deletedClient = await ClientZap.findOneAndDelete(phone);

        if (!deletedClient) {
            return res.status(404).json({ error: "cliente não encontrado" });
        }
        return res.status(200).json({ message: "cliente excluído com sucesso" });
    } catch (error) {
        console.error("Erro ao excluir cliente:", error);
        return res.status(500).json({ error: "Erro ao excluir cliente", details: error.message });
    }
};