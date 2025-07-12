const express = require("express");
const router = express.Router();
const { uploadImage, deleteImage } = require("../controllers/uploadController");
const { auth } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/image", auth, upload.single("image"), uploadImage);
router.delete("/image", auth, deleteImage);

module.exports = router;
