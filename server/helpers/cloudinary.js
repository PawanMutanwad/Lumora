const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dwyxol6sk",
  api_key: process.env.CLOUDINARY_API_KEY || "895449767228833",
  api_secret: process.env.CLOUDINARY_API_SECRET || "qKz4gM_2w-bK6L6-5G5D5s7s8s9",
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });

  return result;
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };
