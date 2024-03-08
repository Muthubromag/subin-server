const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("fs");
const RiderNotification = require("../modals/rider-notification");
const userModal = require("../modals/userModal");
const admin = require("firebase-admin");
const FireBaseAdmin = require("../utils/firebase.js");
const { getMessaging } = require("firebase-admin/messaging");
const S3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});
const crypto = require("crypto");

// file can be buffer or path
function deleteFile(file) {
  try {
    if (typeof file === "string") {
      fs.unlinkSync(file);
      console.log(`File ${file} deleted!`);
    } else {
      fs.unlinkSync(file.path);
      console.log(`File ${file.filename} deleted!`);
    }
  } catch {}
}

// file can be buffer or path
async function uploadFile(file, cloudFilePath) {
  try {
    const fileBuffer =
      file instanceof Buffer ? file : await fs.promises.readFile(file.path);

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: cloudFilePath,
      Body: fileBuffer,
      ACL: "public-read",
    });

    await S3.send(command);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function deleteS3File(path, completeUrl = true) {
  if (completeUrl) {
    const initial = getS3FileUrl("");
    path = path.slice(initial.length);
  }
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET,
    Key: path,
  });

  try {
    await S3.send(command);
    console.log(`File deleted successfully.`);
  } catch (error) {
    console.log(error);
  }
}

function getS3FileUrl(path) {
  return `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${path}`;
}

function deleteOldFiles(directory = "uploads", maxAgeInMinutes = 5) {
  try {
    const currentTime = new Date();
    const maxAge = maxAgeInMinutes * 60 * 1000;

    const files = fs.readdirSync(directory);
    for (const file of files) {
      const filePath = directory + "/" + file;
      const stats = fs.statSync(filePath);
      const fileAge = currentTime.getTime() - stats.birthtime.getTime();

      if (fileAge > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Deleted: ${filePath}`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

// TODO: send real time notification
async function saveRiderNotification(
  rider,
  image,
  title,
  description,
  action,
  callOrder,
  onlineOrder,
  data
) {
  try {
    const notification = await RiderNotification.create({
      rider,
      image,
      title,
      description,
      action,
      callOrder,
      onlineOrder,
      data,
    });
    return notification;
  } catch (error) {
    console.log(error);
  }
}

async function sendPushNotification(fcmToken, title, body, action, data) {
  try {
    data = JSON.stringify(data);
    const res = await constants.admin.messaging().send({
      data: { title, body, data, action },
      token: fcmToken,
    });
    console.log("Successfully sent notification:", res);
  } catch (error) {
    console.log(error);
  }
}

async function sendNotifications({ user_id, title, body }) {
  console.log({ user_id, title, body });
  try {
    if (!user_id) {
      return;
    }
    const result = await userModal.findOne({ _id: user_id });
    console.log({ user: result });
    if (result?.tokens?.length) {
      const response = await getMessaging().sendEachForMulticast({
        data: { title, body, logo: `${process.env.BACKEND_URL}/logo.png` },
        tokens: result?.tokens,
      });

      console.log({ response });
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx]);
          }
        });
        console.log("List of tokens that caused failures: " + failedTokens);
      }
    } else {
      return;
    }
  } catch (error) {
    console.log(error);
  }
}

function formatTime(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}
function generateTimeSlots({ interval }) {
  const startTime = "2024-03-06T10:00:00"; // Replace with your desired start time
  const endTime = "2024-03-06T23:00:00";
  const timeSlots = [];
  let currentStartTime = new Date(startTime);
  const endDateTime = new Date(endTime);

  while (currentStartTime < endDateTime) {
    const currentEndTime = new Date(
      currentStartTime.getTime() + interval * 60 * 60 * 1000
    );

    const formattedStartTime = formatTime(currentStartTime);
    const formattedEndTime = formatTime(currentEndTime);

    timeSlots.push({ time: `${formattedStartTime} - ${formattedEndTime}` });

    currentStartTime = currentEndTime;
  }

  return timeSlots;
}

function generateAlphanumericFromNamePhoneTimestamp(name, phone) {
  const timestamp = new Date().getTime().toString();
  const dataToHash = name + phone + timestamp;

  // Use SHA-256 for hashing, and take the first 12 characters of the hexadecimal representation
  const hash = crypto
    .createHash("sha256")
    .update(dataToHash)
    .digest("hex")
    .slice(0, 12);

  // Convert hexadecimal to alphanumeric
  const alphanumericString = hash
    .replace(/[^\w]/g, "")
    .slice(0, 6)
    .toUpperCase();

  return alphanumericString;
}

const helpers = {
  deleteFile,
  uploadFile,
  deleteS3File,
  getS3FileUrl,
  deleteOldFiles,
  saveRiderNotification,
  sendPushNotification,
  sendNotifications,
  generateTimeSlots,
  generateAlphanumericFromNamePhoneTimestamp,
};

module.exports = helpers;
