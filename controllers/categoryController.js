const Products = require("../models/productsModels");

// Criar uma nova categoria
exports.createCategory = async (req, res) => {
    try {
        const { userId, category } = req.body;

        const product = await Products.findOne({ userId });
        if (!product) return res.status(404).json({ message: "Usuário não encontrado" });

        // Verificar se a categoria já existe
        const categoryExists = product.products.find(cat => cat.category === category);
        if (categoryExists) return res.status(400).json({ message: "Categoria já existe" });

        product.products.push({ category, items: [] });
        await product.save();

        res.status(201).json({ message: "Categoria criada com sucesso", category });
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar categoria", error: error.message });
    }
};

// Obter todas as categorias
exports.getCategories = async (req, res) => {
    try {
        const { userId } = req.params;

        const product = await Products.findOne({ userId });
        if (!product) return res.status(404).json({ message: "Usuário não encontrado" });

        res.status(200).json({ categories: product.products });
    } catch (error) {
        res.status(500).json({ message: "Erro ao obter categorias", error: error.message });
    }
};
// Editar uma categoria
exports.editCategory = async (req, res) => {
    try {
        const { userId, oldCategory, newCategory } = req.body;

        // Verificar se o usuário existe
        const product = await Products.findOne({ userId });
        if (!product) return res.status(404).json({ message: "Usuário não encontrado" });

        // Verificar se a categoria antiga existe
        const categoryIndex = product.products.findIndex(cat => cat.category === oldCategory);
        if (categoryIndex === -1) return res.status(404).json({ message: "Categoria antiga não encontrada" });

        // Verificar se a nova categoria já existe
        const newCategoryExists = product.products.some(cat => cat.category === newCategory);
        if (newCategoryExists) return res.status(400).json({ message: "A nova categoria já existe" });

        // Atualizar o nome da categoria
        product.products[categoryIndex].category = newCategory;
        await product.save();

        res.status(200).json({ message: "Categoria editada com sucesso", updatedCategory: newCategory });
    } catch (error) {
        res.status(500).json({ message: "Erro ao editar categoria", error: error.message });
    }
};
// Excluir uma categoria
exports.deleteCategory = async (req, res) => {
    try {
        const { userId, category } = req.params;

        const product = await Products.findOne({ userId });
        if (!product) return res.status(404).json({ message: "Usuário não encontrado" });

        const categoryIndex = product.products.findIndex(cat => cat.category === category);
        if (categoryIndex === -1) return res.status(404).json({ message: "Categoria não encontrada" });

        product.products.splice(categoryIndex, 1);
        await product.save();

        res.status(200).json({ message: "Categoria excluída com sucesso" });
    } catch (error) {
        res.status(500).json({ message: "Erro ao excluir categoria", error: error.message });
    }
};