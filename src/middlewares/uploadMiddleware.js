const multer = require("multer");
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: "eu-north-1",
});

const createUploadMiddleware = (options = {}) => {
  try {
    const defaultOptions = {
      allowedTypes: ["image/jpeg", "image/png", "video/mp4"],
      folder: "media",
    };

    const mergedOptions = { ...defaultOptions, ...options };

    const storage = multerS3({
      s3: s3Client,
      bucket: process.env.S3_BUCKET_NAME,
      metadata: function (req, file, cb) {
        cb(null, {
          fieldName: file.fieldname,
        });
      },
      key: function (req, file, cb) {
        const fileName = `${mergedOptions.folder}/${Date.now()}-${
          file.originalname
        }`;
        cb(null, fileName);
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
    throw error;
  }
};

const mediaUpload = createUploadMiddleware();
const storyUpload = createUploadMiddleware({
  folder: "stories",
  allowedTypes: ["image/jpeg", "image/png", "video/mp4", "video/quicktime"],
});

const imageUpload = createUploadMiddleware({
  allowedTypes: ["image/jpeg", "image/png"],
  // folder: "images" - optional agar hum koi or folder use krna chahe to
});

module.exports = {
  mediaUpload,
  storyUpload,
  imageUpload,
};
