const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: "eueltvab",
  api_key: "952388333841384",
  api_secret: "ZsACYqak9NnFsjDyhoqOSCXUT4U",
});

const storage = new multer.memoryStorage();

async function handleImageUpload(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });

  return result;
}

const upload = multer({ storage });

module.exports = {
  upload,
  handleImageUpload,
};