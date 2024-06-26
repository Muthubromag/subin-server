const mongoose = require("mongoose");

const typeSchema = mongoose.Schema({
  type: {
    type: String,
  },
  price: {
    type: Number,
  },
});

const OrderSchema = mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boy",
    },
    orderType: {
      type: String,
      enums: ["online", "call"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    orderedFood: {
      type: Array,
      required: true,
    },
    types: [typeSchema],
    customerName: {
      type: String,
      required: true,
    },
    mobileNumber: {
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
    callForOrderInstrcution: {
      type: Array,
    },
    inventory: {
      type: Array,
    },
    // location: { rituraj updated code //--------
    //   type: {
    // 		type: String,
    // 		enum: ['Point'],
    // 	},
    // 	coordinates: {
    // 		type: [Number], // [longitude, latitude]
    // 	},
    // },
    location: {
      type: Array,
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

    grandTotal: {
      type: String,
    },
    billAmount: {
      type: String,
      required: true,
    },
    payment_mode: {
      type: String,

      default: "",
    },
    status: {
      type: String,
      enums: ["placed", "Order received"],
      required: true,
    },
    deliveryStatus: {
      type: String, // delivery, takeaway
      enums: ["delivery", "takeaway"],
    },
    gst: {
      type: Number,
    },
    deliveryCharge: {
      type: Number,
    },
    packingCharge: {
      type: Number,
    },
    transactionCharge: {
      type: Number,
    },
    instructions: {
      type: Array,
    },
    couponAmount: {
      type: Number,
    },
    itemPrice: {
      type: Number,
    },
    distance: {
      type: Number,
      required: false,
      default: 0,
    },
    BromagUserID: {
      type: String,
      // required: true,
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
  { timestamps: true, versionKey: false }
);

const Order = mongoose.model("Order", OrderSchema, "orders");

module.exports = Order;
