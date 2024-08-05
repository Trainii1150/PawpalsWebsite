const bcrypt = require('bcrypt');
const userModel = require('../model/UserModel'); // Import userModel
const StorageItemModel = require('../model/ItemstorageModel');
const itemModel = require('../model/ItemModel');
const UserPetsModel = require('../model/userPetsModel');
const PetModel = require('../model/PetModel');
const UserCoinModel = require('../model/CoinsModel');

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
        await StorageItemModel.updateStorageItem(storageId, userId, itemId, quantity);
        res.status(200).json({ message: 'Storage item updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


// Deletes item from storage.
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

// Create a new pet for a user
const createUserPet = async (req, res) => {
    const { userId, petId, petName } = req.body;

    try {
        const newPet = await UserPetsModel.createUserPet(userId, petId, petName);
        return res.status(201).json({ message: 'Pet added successfully', pet: newPet });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Update an existing pet for a user
const updateUserPet = async (req, res) => {
    const { userPetId, petId, petName, hungerLevel } = req.body;

    try {
        const updatedPet = await UserPetsModel.updateUserPet(userPetId, petId, petName, hungerLevel);
        if (!updatedPet) {
            return res.status(404).json({ message: 'Pet not found' });
        }
        return res.status(200).json({ message: 'Pet updated successfully', pet: updatedPet });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Delete a pet for a user
const deleteUserPet = async (req, res) => {
    const { userPetId, userId, petId } = req.body;

    try {
        await UserPetsModel.deleteUserPet(userPetId, userId, petId);
        return res.status(200).json({ message: 'Pet deleted successfully', userPetId: deletedPet.user_pet_id });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Create a new pet
const addPet = async (req, res) => {
    const { petName, description, petType } = req.body;
    
    try {
        const newPet = await PetModel.createPet(petName, description, petType);
        return res.status(201).json({ message: 'Pet created successfully', pet: newPet });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Update an existing pet
const updatePet = async (req, res) => {
    const { petId, petName, description, petType } = req.body;
    
    try {
        const updatedPet = await PetModel.updatePet(petId, petName, description, petType);
        return res.status(200).json({ message: 'Pet updated successfully', pet: updatedPet });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Delete a pet
const deletePet = async (req, res) => {
    const { petId } = req.body;
    
    try {
        await PetModel.deletePet(petId);
        return res.status(200).json({ message: 'Pet deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const updateUser = async (req, res) => {
    const { userId, newUsername, newPassword, newRole, newAmountcoins } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userModel.updateUserInfo(userId, newUsername, hashedPassword, newRole);
        await UserCoinModel.setCoins(userId, newAmountcoins);
        res.status(200).json({message: 'User updated successfully'});
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const setUserBan = async (req, res) => {
    const { userId, ban } = req.body; // Extract userId and ban status from the request body
    try {
      await userModel.setBan(userId, ban); // Call the setBan function in userModel
      res.status(200).json({ message: `User has been ${ban ? 'banned' : 'unbanned'}.` });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  };
  

const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers(); // Ensure there's a function getAllUsers in userModel
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const getAllItems = async (req, res) => {
    try {
        const items = await itemModel.getAllItems(); // Ensure there's a function getAllItems in itemModel
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const getAllPets = async (req, res) => {
    try {
        const pets = await PetModel.getAllPets(); // Ensure there's a function getAllPets in PetModel
        res.status(200).json(pets);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const getAllStorage = async (req, res) => {
    try {
        const storageItems = await StorageItemModel.getAllStorage(); // Ensure there's a function getAllStorage in StorageItemModel
        res.status(200).json(storageItems);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    const { userid } = req.body;
    try {
        await StorageItemModel.deleteStorageItembyUserid(userid);
        await UserPetsModel.deleteUserPetbyUserid(userid);
        await UserCoinModel.deleteCoins(userid);
        const user = await userModel.deleteUserInfo(userid);
        res.status(200).json({ message: 'User and related data deleted successfully',deletedData: { user }});
    } catch (error) {
        res.status(400).json({
            message: 'Error deleting user and related data',
            error: error.message
        });
    }
};

module.exports = {
    addItemToStorage,
    updateStorageItem,
    deleteItemFromStorage,
    createItem,
    updateItem,
    deleteItem,
    createUserPet,
    updateUserPet,
    deleteUserPet,
    addPet,
    updatePet,
    deletePet,
    updateUser,
    deleteUser,
    setUserBan,
    getAllUsers, // Updated function name
    getAllItems,
    getAllPets,
    getAllStorage
};
