const Tag = require("../models/Tag");

const getAllTags = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    const tags = await Tag.find(query)
      .sort({ questionsCount: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Tag.countDocuments(query);

    res.json({
      tags,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createTag = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    // Check if tag already exists
    const existingTag = await Tag.findOne({ name: name.toLowerCase() });
    if (existingTag) {
      return res.status(400).json({ message: "Tag already exists" });
    }

    const tag = new Tag({
      name: name.toLowerCase(),
      description,
      color: color || "#007bff",
      createdBy: req.user._id,
    });

    await tag.save();

    res.status(201).json({
      message: "Tag created successfully",
      tag,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, color } = req.body;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    // Check if user is admin or tag creator
    if (req.user.role !== "admin" && !tag.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (description !== undefined) tag.description = description;
    if (color !== undefined) tag.color = color;

    await tag.save();

    res.json({
      message: "Tag updated successfully",
      tag,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Check if tag is being used
    if (tag.questionsCount > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete tag that is in use" });
    }

    await Tag.findByIdAndDelete(id);

    res.json({ message: "Tag deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
};
