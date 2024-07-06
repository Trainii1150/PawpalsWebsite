const StorageItemModel = require('../model/storageItemModel');
const itemModel = require('../model/ItemModel');

// Adds an item to storage or updates the quantity if it already exists.
const addItemToStorage = async (req, res) => {
    const { userId, itemId, quantity } = req.body;

    try {
        const existingItem = await StorageItemModel.checkItemInStorageItem(userId, itemId);

        if (existingItem) {
            const updatedItem = await StorageItemModel.updateStorageItem(existingItem.storage_id, userId, itemId, existingItem.quantity + quantity);
            return res.status(200).json({message: 'Item updated successfully'})
        }
        else{
            const newItem = await StorageItemModel.createStorageItem(userId, itemId, quantity);
            return res.status(201).json({message: 'Item added successfully'})
        }

       
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}

// Updates the quantity of an item in storage.
const updateStorageItem = async (req, res) => {
    const { storageId, userId, itemId, quantity } = req.body;

    try {
        const updatedItem = await StorageItemModel.updateStorageItem(storageId, userId, itemId, quantity);
        return res.status(200).json({message: 'Item updated successfully'})
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

//Deletes item from storage.
const deleteItemFromStorage = async (req, res) => {
    const { storageId, userId, itemId } = req.body;

    try {
        const existingItem = await StorageItemModel.checkItemInStorageItem(userId, itemId);

        if (!existingItem || existingItem.storage_id !== storageId) {
            return res.status(404).json({ message: 'Item not found in storage' });
        }
        else{
            const deletedItem = await StorageItemModel.deleteStorageItem(storageId, userId, itemId);
            return res.status(200).json({message : 'Item deleted successfully'});
        }
       
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Create a new item.
const createItem = async (req, res) => {
    const { item_name, description, item_type } = req.body;
    try {
        const newItem = await itemModel.createItem(item_name, description, item_type);
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update an existing item.
const updateItem = async (req, res) => {
    const { item_id, item_name, description, item_type } = req.body;
    try {
        const updatedItem = await itemModel.updateItem(item_id, item_name, description, item_type);
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an item.
const deleteItem = async (req, res) => {
    const { item_id } = req.body;
    try {
        await itemModel.deleteItem(item_id);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


module.exports = {
    addItemToStorage,
    updateStorageItem,
    deleteItemFromStorage,
    createItem,
    updateItem,
    deleteItem,
};