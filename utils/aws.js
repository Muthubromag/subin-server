const multer = require("multer");
const multerS3 = require("multer-s3");

const {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

const { v4: uuidv4 } = require("uuid");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET;

const uploadCoupon = async (req, res, next) => {
  const unique = uuidv4();
  const upload = multer({
    storage: multerS3({
      s3: s3,
      acl: "public-read",
      bucket: BUCKET_NAME, // bucket name
      key: function (req, file, cb) {
        // modify file name with folder

        cb(null, `coupons/${unique}-.${file?.mimetype.split("/")[1]}`);
      },
    }),
  }).single("image"); // uploads single file
  // upload handler
  upload(req, res, (error) => {
    // if error from multer package
    if (error instanceof multer.MulterError) {
      return res.status(500).send(error);
    }
    // upload file error
    if (error) {
      return res.status(500).send(error);
    }
    return next();
  });
};

const deleteS3Image = async (filename) => {
  try {
    if (typeof filename !== "string" || filename.length === 0) {
      throw new Error("Invalid filename");
    }
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${filename}`,
    });
    const fileResponse = await s3.send(deleteCommand);
    console.log("filedeleted", fileResponse);
    return fileResponse;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  deleteS3Image,
  uploadCoupon,
};
