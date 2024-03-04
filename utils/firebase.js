const serviceAccount = require("../serviceAccountKey.json");
const admin = require("firebase-admin");
const FireBaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = FireBaseAdmin;
