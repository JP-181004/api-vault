const ApiEndpoint = require("../models/ApiEndpoint");

// Create API Endpoint
const createApi = async (req, res) => {
  try {
    const {
      title,
      collection,
      method,
      url,
      description,
      headers,
      requestBody,
      responseExample,
      authentication,
      tags,
      isFavorite,
    } = req.body;

    const api = await ApiEndpoint.create({
      title,
      collection,
      method,
      url,
      description,
      headers,
      requestBody,
      responseExample,
      authentication,
      tags,
      isFavorite,
      owner: req.user._id,
    });

    res.status(201).json(api);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all API Endpoints of logged-in user
const getApis = async (req, res) => {
  try {
    const { search, method, collection, sort, isFavorite } = req.query;

    const query = {
      owner: req.user._id,
    };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (method) {
      query.method = method.toUpperCase();
    }

    if (collection) {
      query.collection = collection;
    }

    if (isFavorite) {
      query.isFavorite = isFavorite === "true";
    }

    let sortOption = { createdAt: -1 };

    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "title") {
      sortOption = { title: 1 };
    }

    const apis = await ApiEndpoint.find(query)
      .populate("collection", "name")
      .sort(sortOption);

    res.status(200).json(apis);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get single API Endpoint by ID
const getApiById = async (req, res) => {
  try {
    const api = await ApiEndpoint.findOne({
      _id: req.params.id,
      owner: req.user._id,
    }).populate("collection", "name");

    if (!api) {
      return res.status(404).json({
        message: "API endpoint not found",
      });
    }

    res.status(200).json(api);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update API Endpoint
const updateApi = async (req, res) => {
  try {
    const api = await ApiEndpoint.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user._id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("collection", "name");

    if (!api) {
      return res.status(404).json({
        message: "API endpoint not found",
      });
    }

    res.status(200).json(api);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete API Endpoint
const deleteApi = async (req, res) => {
  try {
    const api = await ApiEndpoint.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!api) {
      return res.status(404).json({
        message: "API endpoint not found",
      });
    }

    res.status(200).json({
      message: "API endpoint deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createApi,
  getApis,
  getApiById,
  updateApi,
  deleteApi,
};