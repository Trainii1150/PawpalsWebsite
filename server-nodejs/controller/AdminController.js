const bcrypt = require('bcrypt');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const userModel = require('../model/Usermodel'); 
const StorageItemModel = require('../model/ItemstorageModel');
const itemModel = require('../model/ItemModel');
const UserPetsModel = require('../model/userPetsModel');
const PetModel = require('../model/PetModel');
const UserCoinModel = require('../model/coinsModel');
const StoreModel = require('../model/StoreModel'); 
const ActivityModel = require('../model/ActivityModel'); 
const LogModel = require('../model/LogModel');


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
    const { itemname, description, itemtype } = Object.assign({}, req.body);
    const itemImage = req.file;
    try {
        let imageurl = null;
        if(itemImage) {
            const filePath = `Items/${itemname}.png`; // Construct the file path based on the pet name
            // Upload GIF file directly to GitHub
            const data = {
                message: `Upload image for new ${itemname}`,
                content: itemImage.buffer.toString('base64'),
            };

            const url = `https://api.github.com/repos/${process.env.REPO_OWNER}/${process.env.REPO_NAME}/contents/${filePath}`;
            const response = await axios.put(url, data, {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });

            imageurl = response.data.content.download_url; // Get the URL of the uploaded image
        }
        const newItem = await itemModel.createItem(itemname, description, itemtype, imageurl);
        return res.status(201).json({ message: 'Item created successfully', item: newItem });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update an existing item.
const updateItem = async (req, res) => {
    const { itemid, itemname, description, itemtype } = req.body;
    const itemImage = req.file;
    try {
        let imageurl = null;
        if (itemImage) {
            const filePath = `Items/${itemImage}_${new Date().toISOString()}.png`; 
            // อัปโหลดไฟล์ GIF โดยตรงไปยัง GitHub
            const data = {
                message: `Upload image for new ${itemname}`,
                content: itemname.buffer.toString('base64'),
            };

            const url = `https://api.github.com/repos/${process.env.REPO_OWNER}/${process.env.REPO_NAME}/contents/${filePath}`;
            const response = await axios.put(url, data, {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });

            imageurl = response.data.content.download_url; // Get the URL of the uploaded image
        }
        let updatedItem;

        if(imageurl){
            updatedItem = await itemModel.updateItem(itemid, itemname, description, itemtype, imageurl);
        }
        else{
            updatedItem = await await itemModel.updateItemWithoutPath(itemid, itemname, description, itemtype);
        }
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
    const { userId, petId, petName, path } = req.body;
    try {
        const newPet = await UserPetsModel.createUserPet(userId, petId, petName, path);
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
        return res.status(200).json({ message: 'Pet deleted successfully', userPetId: userPetId });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Create a new pet
const addPet = async (req, res) => {
    const { petName, description, petType } = req.body;
    const petImage = req.file; // Access the uploaded file from Multer

    try {
        let imageurl = null;
        if (petImage) {
            const filePath = `Pets/${petName}.gif`; // Construct the file path based on the pet name
            // Upload GIF file directly to GitHub
            const data = {
                message: `Upload image for new ${petName}`,
                content: petImage.buffer.toString('base64'),
            };

            const url = `https://api.github.com/repos/${process.env.REPO_OWNER}/${process.env.REPO_NAME}/contents/${filePath}`;
            const response = await axios.put(url, data, {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });

            imageurl = response.data.content.download_url; // Get the URL of the uploaded image
        }

        // Create the new pet record in the database
        const newPet = await PetModel.createPet(petName, description, petType, imageurl);
        return res.status(201).json({ message: 'Pet created successfully', pet: newPet });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


// Update an existing pet
const updatePet = async (req, res) => {
    const { petId, petName, description, petType } = req.body;
    const petImage = req.file; // เข้าถึงไฟล์ที่อัปโหลดจาก Multer
    try {
        let imageurl = null;
        if (petImage) {
            const filePath = `Pets/${petName}_${new Date().toISOString()}.gif`; // Construct the file path based on the pet name
            // อัปโหลดไฟล์ GIF โดยตรงไปยัง GitHub
            const data = {
                message: `Upload image for new ${petName}`,
                content: petImage.buffer.toString('base64'),
            };

            const url = `https://api.github.com/repos/${process.env.REPO_OWNER}/${process.env.REPO_NAME}/contents/${filePath}`;
            const response = await axios.put(url, data, {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });

            imageurl = response.data.content.download_url; // Get the URL of the uploaded image
        }

        let updatedPet;

        if(imageurl){
            updatedPet = await PetModel.updatePet(petId, petName, description, petType , imageurl);
        }
        else{
            updatedPet = await PetModel.updatePetWithoutPath(petId, petName, description, petType );
        }

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
        const usersWithCoins = await Promise.all(users.map(async (user) => {
            // Fetch coins for each user
            const coinData = await UserCoinModel.getUserCoins(user.user_id); // Adjust to your function's signature
            return {
                ...user,
                coins: coinData.coins || 0, // Add the coins to the user object
            };
        }));
        console.log(usersWithCoins);
        res.status(200).json(usersWithCoins);
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
const getAllUserPets = async (req, res) => {
    try {
        const userpets = await UserPetsModel.getAllUserPets(); // Ensure there's a function getAllPets in PetModel
        res.status(200).json(userpets);
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

const getStoreItems = async (req, res) => {
    try {
        const storeItems = await StoreModel.getStoreItems();
        res.status(200).json(storeItems);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch store items', error: error.message });
    }
};

const addStoreItem = async (req, res) => {
    const { itemId, price } = req.body;
    try {
        const newStoreItem = await StoreModel.addStoreItem(itemId, price);
        res.status(201).json({ message: 'Store item added successfully', storeItem: newStoreItem });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add store item', error: error.message });
    }
};

const updateStoreItem = async (req, res) => {
    const { storeItemId, itemId, price } = req.body;
    try {
        const updatedStoreItem = await StoreModel.updateStoreItem(storeItemId, itemId, price);
        res.status(200).json({ message: 'Store item updated successfully', storeItem: updatedStoreItem });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update store item', error: error.message });
    }
};

const deleteStoreItem = async (req, res) => {
    const { storeItemId } = req.body;
    try {
        await StoreModel.deleteStoreItem(storeItemId);
        res.status(200).json({ message: 'Store item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete store item', error: error.message });
    }
};

// Get all activities
const getActivities = async (req, res) => {
    try {
      const activities = await ActivityModel.getAllActivities();
      res.status(200).json(activities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      res.status(500).json({ message: 'Failed to fetch activities', error: error.message });
    }
  };
  
  // Add a new activity
  const addActivity = async (req, res) => {
    try {
      const activity = req.body;
      const newActivity = await ActivityModel.addActivity(activity);
      res.status(201).json(newActivity);
    } catch (error) {
      res.status(500).json({ message: 'Failed to add activity', error: error.message });
    }
  };
  
  // Update an existing activity by ActivityCode_ID
  const updateActivity = async (req, res) => {
    try {
      const { ActivityCode_ID } = req.params;
      const updatedData = req.body;
      const updatedActivity = await ActivityModel.updateActivity(ActivityCode_ID, updatedData);
      res.status(200).json(updatedActivity);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update activity', error: error.message });
    }
  };
  
  // Delete an activity by ActivityCode_ID
  const deleteActivity = async (req, res) => {
    try {
      const { ActivityCode_ID } = req.params;
      await ActivityModel.deleteActivity(ActivityCode_ID);
      res.status(200).json({ message: 'Activity deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete activity', error: error.message });
    }
  };
  const getPurchaseLogs = async (req, res) => {
    try {
        const purchaseLogs = await LogModel.getPurchaseLogs();
        res.status(200).json(purchaseLogs);
    } catch (error) {
        console.error('Error fetching purchase logs:', error);
        res.status(500).json({ message: 'Failed to fetch purchase logs', error: error.message });
    }
};

// ฟังก์ชันดึง log การให้อาหารสัตว์เลี้ยง
const getFeedLogs = async (req, res) => {
    try {
        const feedLogs = await LogModel.getFeedLogs();
        res.status(200).json(feedLogs);
    } catch (error) {
        console.error('Error fetching feed logs:', error);
        res.status(500).json({ message: 'Failed to fetch feed logs', error: error.message });
    }
};

module.exports = {
    getFeedLogs,
    getPurchaseLogs,
    getActivities,
    addActivity,
    updateActivity,
    deleteActivity,
    getStoreItems,
    addStoreItem,
    updateStoreItem,
    deleteStoreItem,
    getStoreItems,
    addStoreItem,
    updateStoreItem,
    deleteStoreItem,
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
    getAllUserPets,
    getAllStorage
};