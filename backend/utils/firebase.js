let admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();
// let serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);
let serviceAccount = require('../firebaseJsonSDK.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
