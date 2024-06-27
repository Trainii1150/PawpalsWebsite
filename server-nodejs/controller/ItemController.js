const itemModel = require('../model/ItemModel');

const createItem = async (req, res) => {
    const { item_name, description, item_type } = req.body;
    try {
        const newItem = await itemModel.createItem(item_name, description, item_type);
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateItem = async (req, res) => {
    const { item_id } = req.params;
    const { item_name, description, item_type } = req.body;
    try {
        const updatedItem = await itemModel.updateItem(item_id, item_name, description, item_type);
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteItem = async (req, res) => {
    const { item_id } = req.params;
    try {
        await itemModel.deleteItem(item_id);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createItem,
    updateItem,
    deleteItem,
};