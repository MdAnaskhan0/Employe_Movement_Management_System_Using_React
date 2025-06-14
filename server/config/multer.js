// config/multer.js
const multer = require("multer");

const storage = multer.memoryStorage(); // store in RAM, not disk

const upload = multer({ storage });

module.exports = upload;
