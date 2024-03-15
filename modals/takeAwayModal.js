const mongoose = require("mongoose");

const takeAwaySchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    orderedFood: {
      type: Array,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    coupon: {
      min_purchase: { type: Number, required: false, default: 0 },
      max_discount: { type: Number, required: false, default: 0 },
      _id: { type: String, default: null },
      discount: { type: Number, required: false },
      discount_type: {
        type: String,

        required: false,
      },
      deliveryFree: { type: Boolean, default: false },
      // Other properties related to the coupon
    },
    customerName: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
    },
    stopTime: {
      type: String,
    },
    timePicked: {
      type: String,
    },
    inventory: {
      type: Array,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    BromagUserID: {
      type: String,
      // required: true,
    },
    billAmount: {
      type: String,
      required: true,
    },
    payment_mode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Order placed",
      required: true,
    },
    gst: {
      type: Number,
    },
    delivery_charge: {
      type: Number,
    },
    packing_charge: {
      type: Number,
    },
    transaction_charge: {
      type: Number,
    },
    coupon_amount: {
      type: Number,
    },
    instructionsTakeaway: {
      type: Array,
    },
    item_price: {
      type: Number,
    },
    preparingEnd: {
      type: String,
      // required: true,
    },
    preparingStart: {
      type: String,
      // required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("takeawayorder", takeAwaySchema);
