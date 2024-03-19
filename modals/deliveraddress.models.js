const mongoose = require("mongoose");

const deliveryAddressSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    streetName: {
      type: String,
    },
    addressType: {
      type: String,
    },
    landMark: {
      type: String,
    },
    city: {
      type: String,
    },
    picCode: {
      type: String,
    },
    customerState: {
      type: String,
    },
    userId: {
      type: String,
    },
    contactNumber: {
      type: String,
    },

    latitude: { type: String },
    longitude: { type: String },
    currentLocation: {
      type: Boolean,
    },
    distance: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("delivery_address", deliveryAddressSchema);
