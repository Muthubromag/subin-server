const mongoose = require("mongoose");

const footerSchema = mongoose.Schema(
  {
    name: String,
    logo: String,
    contactNumber: String,
    address: String,
    email: String,
    colors: {
      primaryColor: String,
      secondaryColor: String,
      thirdColor: String,
      fourthColor: String,
    },
    content: String,
    status: Boolean,
    location: {
      map_link: String,
      embedUrl: String,
    },
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
    veg: { type: Boolean, required: false, default: false },
    nonveg: { type: Boolean, required: false, default: false },
    isDining: { type: Boolean, required: false, default: true },
  },

  { timestamps: true }
);

module.exports = mongoose.model("footerSettings", footerSchema);
