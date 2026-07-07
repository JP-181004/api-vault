const Collection = require("../models/Collection");
const ApiEndpoint = require("../models/ApiEndpoint");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalCollections = await Collection.countDocuments({
      owner: userId,
    });

    const totalApis = await ApiEndpoint.countDocuments({
      owner: userId,
    });

    const recentApis = await ApiEndpoint.find({
      owner: userId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("collection", "name");

    const methodStats = await ApiEndpoint.aggregate([
      {
        $match: {
          owner: req.user._id,
        },
      },
      {
        $group: {
          _id: "$method",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          method: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);
    const collectionStats = await ApiEndpoint.aggregate([
  {
    $match: {
      owner: req.user._id,
    },
  },
  {
    $group: {
      _id: "$collection",
      count: { $sum: 1 },
    },
  },
  {
    $lookup: {
      from: "collections",
      localField: "_id",
      foreignField: "_id",
      as: "collectionDetails",
    },
  },
  {
    $unwind: "$collectionDetails",
  },
  {
    $project: {
      collection: "$collectionDetails.name",
      count: 1,
      _id: 0,
    },
  },
]);

 res.status(200).json({
  totalCollections,
  totalApis,
  recentApis,
  methodStats,
  collectionStats,
});
  } catch (error) {
    res.status(500).json({
      message: "Dashboard data fetch failed",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};