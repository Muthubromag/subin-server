const mongoose = require("mongoose");
const couponSchema = new mongoose.Schema(
  {
    orderType: {
      type: String,
      enum: ["online", "takeaway", "all"],
      default: "all",
    },
    min_purchase: { type: Number, required: true, default: 0 },
    max_discount: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true },
    discount_type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
      default: "fixed",
    },
    expiry: { type: Date, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    usedBy: [{ type: String }],
    deliveryFree: { type: Boolean, default: false },
    fileName: { type: String, required: true },
    image: { type: String, required: true },
    info: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("coupons", couponSchema);
