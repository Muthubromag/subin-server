const mongoose = require("mongoose");

const FCMSchema = mongoose.Schema(
  {
    fcm: {
      type: String,
      default:""
    },
  },
  { timestamps: true }
);


module.exports=mongoose.model("FCM",FCMSchema)