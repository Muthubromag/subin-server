const mongoose = require("mongoose");

const tableSchema = mongoose.Schema(
  {
    tableNo: {
      type: String,
      required: true,
    },
    seatsAvailable: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    status: {
      type: Boolean,
      default: false,
    },
    timeSlots: [
      {
        time: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("table", tableSchema);
