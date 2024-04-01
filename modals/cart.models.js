const mongoose = require("mongoose");
const productTypeSchema = mongoose.Schema({
  Type: {
    type: String,
  },
  TypePrice: {
    type: Number,
  },
  TypeOfferPrice: {
    type: Number,
  },
  TypeOfferPercentage: {
    type: Number,
  },
  TypeTakeAwayOfferPrice: {
    type: Number,
  },
  TypeTakeAwayOfferPercentage: {
    type: Number,
    default: 0,
  },
});

const cartSchema = new mongoose.Schema(
  {
    userRef: String,
    productRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
    typeRef: {
      type: productTypeSchema, // Corrected line
    },

    orderRef: String,
    bookingRef: String,
    quantity: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("cart", cartSchema);
