const mongoose = require("mongoose");

const Policy = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("policy", Policy);
