const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const createUploadMiddleware = (options = {}) => {
  try {
    const defaultOptions = {
      allowedTypes: ["image/jpeg", "image/png", "video/mp4"],
      folder: "media",
      resourceType: "auto",
    };

    const mergedOptions = { ...defaultOptions, ...options };

    const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: mergedOptions.folder,
        resource_type: mergedOptions.resourceType,
        allowed_formats: ["jpg", "jpeg", "png", "mp4", "mov"],
      },
    });

    const fileFilter = (req, file, cb) => {
      if (mergedOptions.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type"), false);
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    });
  } catch (error) {
    console.log("createUploadMiddleware error=> ", error);
  }
};

// Pre-configured middlewares for different use cases
const mediaUpload = createUploadMiddleware();
const storyUpload = createUploadMiddleware({
  folder: "stories",
  allowedTypes: ["image/jpeg", "image/png", "video/mp4", "video/quicktime"],
});

const imageUpload = createUploadMiddleware({
  allowedTypes: ["image/jpeg", "image/png"],
  resourceType: "image",
});

module.exports = {
  mediaUpload,
  storyUpload,
  imageUpload,
};
