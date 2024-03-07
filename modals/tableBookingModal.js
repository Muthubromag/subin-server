const mongoose = require("mongoose");

const tableBookingSchema = mongoose.Schema(
  {
    diningID: {
      type: String,
      required: true,
    },
    tableNo: {
      type: String,
      required: true,
    },
    tableId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    alterateContactNumber: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    pickupOption: {
      type: String,
      required: true,
    },
    noOfGuest: {
      type: String,
      required: true,
    },
    diningTime: {
      type: String,
      required: true,
    },
    booking: {
      type: String,
    },
    tablePic: {
      type: String,
    },

    timeSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "table.timeSlots",
      required: true,
    },
    bookingDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("tableBooking", tableBookingSchema);
