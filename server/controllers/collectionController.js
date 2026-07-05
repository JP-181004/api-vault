const Collection = require("../models/Collection");

// Create collection
const createCollection = async (req, res) => {
  try {
    const { name, description } = req.body;

    const collection = await Collection.create({
      name,
      description,
      owner: req.user.id,
    });

    res.status(201).json(collection);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all collections
const getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ owner: req.user.id });

    res.status(200).json(collections);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get single collection
const getSingleCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json(collection);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update collection
const updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    collection.name = req.body.name || collection.name;
    collection.description = req.body.description || collection.description;

    const updatedCollection = await collection.save();

    res.status(200).json(updatedCollection);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete collection
const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await collection.deleteOne();

    res.status(200).json({ message: "Collection deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCollection,
  getCollections,
  getSingleCollection,
  updateCollection,
  deleteCollection,
};