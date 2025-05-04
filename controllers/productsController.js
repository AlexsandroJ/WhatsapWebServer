const Products = require("../models/productsModels");

// Criar um novo produto para um usuário
exports.createProduct = async (req, res) => {
    try {
        const { userId } = req.body;

        const product = await Products.findOne({ userId });
        if (product) return res.status(400).json({ message: "Produto já existe para este usuário" });

        const newProduct = new Products({ userId, products: [] });
        await newProduct.save();

        res.status(201).json({ message: "Produto criado com sucesso", product: newProduct });
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar produto", error: error.message });
    }
};

// Obter todos os produtos de um usuário
exports.getProducts = async (req, res) => {
    try {
        const { userId } = req.params;

        const product = await Products.findOne({ userId });
        if (!product) return res.status(404).json({ message: "Usuário não encontrado" });

        res.status(200).json({ products: product.products });
    } catch (error) {
        res.status(500).json({ message: "Erro ao obter produtos", error: error.message });
    }
};

// Excluir um produto
exports.deleteProduct = async (req, res) => {
    try {
        const { userId } = req.params;

        const product = await Products.findOneAndDelete({ userId });
        if (!product) return res.status(404).json({ message: "Usuário não encontrado" });

        res.status(200).json({ message: "Produto excluído com sucesso" });
    } catch (error) {
        res.status(500).json({ message: "Erro ao excluir produto", error: error.message });
    }
};