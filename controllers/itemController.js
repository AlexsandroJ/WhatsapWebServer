const Products = require("../models/productsModels");

// Criar um novo item em uma categoria específica
exports.createItem = async (req, res) => {
    try {
        const { userId, category } = req.params;
        const { name, type, price, description, available, image, stock } = req.body;

        // Encontrar o usuário e a categoria
        const product = await Products.findOne({ userId });
        if (!product) return res.status(404).json({ message: "Usuário não encontrado" });
        
        const cat = product.products.find(cat => cat.category === category );
        if (!cat) return res.status(404).json({ message: "Categoria não encontrada" });

        // Verificar se o item já existe na categoria
        const itemExists = cat.items.find(item => item.name === name);
        if (itemExists) return res.status(400).json({ message: "Item já existe na categoria" });

        // Adicionar o novo item
        cat.items.push({ name, type, price, description, available, image, stock });
        await product.save();

        res.status(201).json({ message: "Item criado com sucesso", item: cat.items[cat.items.length - 1] });
    } catch (error) {
        console.error("Erro ao criar item:", error);

        // Tratamento de erros específicos
        if (error.name === "ValidationError") {
            // Erro de validação do Mongoose
            return res.status(400).json({ message: "Erro de validação nos dados fornecidos", details: error.message });
        } else if (error.name === "CastError") {
            // Erro de conversão de tipo no Mongoose (ex.: ID inválido)
            return res.status(400).json({ message: "ID inválido ou formato incorreto", details: error.message });
        } else if (error.code === 11000) {
            // Erro de duplicidade (violando índice único)
            return res.status(409).json({ message: "Conflito: Item duplicado", details: error.message });
        } else if (error.message.includes("E11000")) {
            // Outro tipo de erro de duplicidade
            return res.status(409).json({ message: "Conflito: Violação de índice único", details: error.message });
        } else {
            // Erro genérico
            return res.status(500).json({ message: "Erro interno do servidor", details: error.message });
        }
    }
};

// Obter todos os itens de uma categoria específica
exports.getItems = async (req, res) => {
    try {
        const { userId, category } = req.params;

        const product = await Products.findOne({ userId });
        if (!product) return res.status(404).json({ message: "Usuário não encontrado" });

        const cat = product.products.find(cat => cat.category === category);
        if (!cat) return res.status(404).json({ message: "Categoria não encontrada" });

        res.status(200).json({ items: cat.items });
    } catch (error) {
        res.status(500).json({ message: "Erro ao obter itens", error: error.message });
    }
};

// Atualizar um item específico
exports.updateItem = async (req, res) => {
    try {
        const { userId, category, name } = req.params;
        const updates = req.body;

        const product = await Products.findOne({ userId });
        if (!product) return res.status(404).json({ message: "Usuário não encontrado" });

        const cat = product.products.find(cat => cat.category === category);
        if (!cat) return res.status(404).json({ message: "Categoria não encontrada" });

        const item = cat.items.find(i => i.name === name);
        if (!item) return res.status(404).json({ message: "Item não encontrado" });

        Object.assign(item, updates);
        await product.save();

        res.status(200).json({ message: "Item atualizado com sucesso", item });
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar item", error: error.message });
    }
};

// Excluir um item específico
exports.deleteItem = async (req, res) => {
    try {
        const { userId, category, name } = req.params;

        const product = await Products.findOne({ userId });
        if (!product) return res.status(404).json({ message: "Usuário não encontrado" });

        const cat = product.products.find(cat => cat.category === category);
        if (!cat) return res.status(404).json({ message: "Categoria não encontrada" });

        const itemIndex = cat.items.findIndex(item => item.name === name);
        if (itemIndex === -1) return res.status(404).json({ message: "Item não encontrado" });

        cat.items.splice(itemIndex, 1);
        await product.save();

        res.status(200).json({ message: "Item excluído com sucesso" });
    } catch (error) {
        res.status(500).json({ message: "Erro ao excluir item", error: error.message });
    }
};