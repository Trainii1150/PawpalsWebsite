const petModel = require('../model/PetModel');

const createPet = async (req, res) => {
    const { pet_name, description, pet_type } = req.body;
    try {
        const newPet = await petModel.createPet(pet_name, description, pet_type);
        res.status(201).json(newPet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updatePet = async (req, res) => {
    const { pets_id } = req.params;
    const { pet_name, description, pet_type } = req.body;
    try {
        const updatedPet = await petModel.updatePet(pets_id, pet_name, description, pet_type);
        res.status(200).json(updatedPet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deletePet = async (req, res) => {
    const { pets_id } = req.params;
    try {
        await petModel.deletePet(pets_id);
        res.status(204).end();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createPet,
    updatePet,
    deletePet,
};