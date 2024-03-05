const mongoose = require("mongoose");
const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    discountPercentage: { type: Number, required: true },
    validUntil: { type: Date, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    usedBy: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("coupons", couponSchema);
