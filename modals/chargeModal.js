const mongoose = require("mongoose");

const ChargeSchema = mongoose.Schema(
  {
    gst: {
      value: {
        type: Number,
        required: true,
        default: 0,
      },

      mode: {
        type: String,
        enum: ["percentage", "fixed"],
        required: true,
        default: "fixed",
      },
    },
    delivery: {
      value: {
        type: Number,
        required: true,
        default: 0,
      },

      mode: {
        type: String,
        enum: ["percentage", "fixed"],
        required: true,
        default: "fixed",
      },
    },
    packing: {
      value: {
        type: Number,
        required: true,
        default: 0,
      },

      mode: {
        type: String,
        enum: ["percentage", "fixed"],
        required: true,
        default: "fixed",
      },
    },
    transaction: {
      value: {
        type: Number,
        required: true,
        default: 0,
      },

      mode: {
        type: String,
        enum: ["percentage", "fixed"],
        required: true,
        default: "fixed",
      },
    },
    dining: {
      value: {
        type: Number,
        required: true,
        default: 0,
      },
      mode: {
        type: String,
        enum: ["percentage", "fixed"],
        required: true,
        default: "percentage",
      },
    },
  },
  { timestamps: true }
);

const Charges = mongoose.model("charges", ChargeSchema);

module.exports = Charges;
