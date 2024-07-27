const UserModel = require('../model/UserModel');
const CoinsModel = require('../model/CoinsModel');
const PetModel = require('../model/PetModel');
const UserPetsModel = require('../model/userPetsModel');
const ItemStorageModel = require('../model/ItemstorageModel');
const jwt = require("jsonwebtoken");

const tokenExtensionsGenerate = (req, res) => {
    try {
        const email = req.body.email;
        const token = jwt.sign({ email }, process.env.ExtensionsAccesstoken, { expiresIn: "5m" });
        res.json({ token, email });
    } catch (error) {
        console.error('Error generating extension token:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const buyItem = async (req, res) => {
    const { uid, item_id } = req.body;
  
    console.log('Buying item:', { uid, item_id });
  
    if (!uid || !item_id) {
      return res.status(400).json({ message: 'User ID and Item ID are required' });
    }
  
    try {
      const itemPrice = await ItemStorageModel.getItemPrice(item_id);
      await CoinsModel.deductUserCoins(uid, itemPrice);
  
      const existingItem = await ItemStorageModel.checkItemInStorageItem(uid, item_id);
      if (existingItem) {
        const updatedItem = await ItemStorageModel.updateStorageItem(existingItem.storage_id, uid, item_id, existingItem.quantity + 1);
        return res.status(200).json({ message: 'Item updated successfully' });
      } else {
        const newItem = await ItemStorageModel.createStorageItem(uid, item_id, 1);
        return res.status(201).json({ message: 'Item bought successfully' });
      }
    } catch (error) {
      console.error('Error buying item:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  };
  
const deleteItemfromStorage = async (req, res) => {
    const { storageId, userId, itemId } = req.body;
    try {
        const existingItem = await ItemStorageModel.checkItemInStorageItem(userId, itemId);
        if (!existingItem || existingItem.storage_id !== storageId) {
            return res.status(404).json({ message: 'Item not found in storage' });
        } else {
            await ItemStorageModel.deleteStorageItem(storageId, userId, itemId);
            return res.status(200).json({ message: 'Item deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const createUserPet = async (req, res) => {
    const { userId, petId, petName } = req.body;

    try {
        const newPet = await UserPetsModel.createUserPet(userId, petId, petName);
        return res.status(201).json({ message: 'Pet added successfully', pet: newPet });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const updateUserPet = async (req, res) => {
    const { userPetId, petId, petName, hungerLevel } = req.body;

    try {
        const updatedPet = await UserPetsModel.createUserPet(userPetId, petId, petName, hungerLevel);
        if (!updatedPet) {
            return res.status(404).json({ message: 'Pet not found' });
        }
        return res.status(200).json({ message: 'Pet updated successfully', pet: updatedPet });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const deleteUserPet = async (req, res) => {
    const { userPetId, userId, petId } = req.body;

    try {
        const deletedPet = await UserPetsModel.deleteUserPet(userPetId, userId, petId);
        return res.status(200).json({ message: 'Pet deleted successfully', userPetId: deletedPet.user_pet_id });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const getTimeByLanguageController = async (req, res) => {
    const { uid } = req.params;
  
    try {
      const data = await UserModel.getTimeByLanguage(uid);
      res.json(data);
    } catch (error) {
      console.error('Error getting time by language:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};

  const randomizePet = async (req, res) => {
    const { uid } = req.body;

    try {
        const pets = await PetModel.getAllPets(); // เพิ่ม await ที่นี่
        if (pets.length === 0) {
            return res.status(400).json({ error: 'No pets available' });
        }
        // Select a random pet
        const randomPet = pets[Math.floor(Math.random() * pets.length)];
        const newuserPet = await UserPetsModel.createUserPet(uid, randomPet.pet_id, randomPet.pet_name);
        res.status(200).json(newuserPet);

    } catch (error) {
        console.error('Error randomizing pet:', error.message);
        res.status(500).json({ error: error.message });
    }
};
  
  
const feedPet = async (req, res) => {
    const { uid, petId, foodValue} = req.body;
  
    try {
      // Check if the food item exists in the user's storage
      const foodItem = await ItemStorageModel.getFoodItem(uid, foodValue);
      if (!foodItem || foodItem.quantity === 0) {
        return res.status(400).json({ error: 'Food item not found or quantity is zero' });
      }
  
      // Update the pet's hunger level
      await PetModel.updateHungerLevel(petId, foodValue);
  
      // Update the quantity of food in storage
      const newQuantity = foodItem.quantity - 1;
      await ItemStorageModel.updateFoodQuantity(foodItem.storage_id, newQuantity);
  
      // Delete the food item if the quantity is zero
      if (newQuantity === 0) {
        await ItemStorageModel.deleteFoodItem(foodItem.storage_id);
      }
  
      res.status(200).json({ message: 'Pet fed successfully' });
    } catch (error) {
      console.error('Error feeding pet:', error);
      res.status(500).json({ error: 'An error occurred while feeding the pet' });
    }
};
  
module.exports = {
    tokenExtensionsGenerate,
    buyItem,
    deleteItemfromStorage,
    createUserPet,
    updateUserPet,
    deleteUserPet,
    getTimeByLanguageController,
    feedPet,
    randomizePet,
};
