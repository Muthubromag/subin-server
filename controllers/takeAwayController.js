const takeAway = require("../modals/takeAwayModal");
const Cart = require("../modals/cart.models");
const _ = require("lodash");
const User = require("../modals/userModal");
const {
  sendNotifications,
  sendAdminNotifications,
} = require("../utils/helpers");
const CouponModal = require("../modals/CouponModal");
const createTakeAwayOrder = async (req, res) => {
  console.log("createtake away", req.body);

  try {
    const result = await takeAway.create({ ...req.body });
    const io = req.app.get("socketio");

    io.emit("demo", {
      id: Math.random(1000, 1000000),
      order: "takeaway",
      status: "Order placed",
    });
    return res.status(200).send({ data: result });
  } catch (err) {
    return res
      .status(500)
      .send("Something went wrong while creating takeAway order");
  }
};

const getTakeAwayOrder = async (req, res) => {
  try {
    const result = await takeAway.find({}).sort({ createdAt: -1 });
    return res.status(200).send({ data: result });
  } catch (err) {
    return res
      .status(500)
      .send("Something went wrong while fetching takeAway order");
  }
};

const updateTakeAwayOrder = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  let user_id = null;
  try {
    const result = await takeAway.findByIdAndUpdate(id, { ...req.body });
    const io = req.app.get("socketio");
    user_id = result?.userId;
    io.emit("demo", {
      id: Math.random(1000, 1000000),
      order: "takeaway",
      status: req.body.status,
    });
    return res.status(200).send({ data: result });
  } catch (e) {
    return res
      .status(500)
      .send("Something went wrong while updating takeAway order");
  } finally {
    sendNotifications({
      title: "Take Away order",
      body: status || "Order Status Updated",
      user_id,
      url: "/profile-take-away-order",
    });
  }
};

const addTakeAwayOrder = async (req, res) => {
  try {
    console.log("addTakeAwayOrder", req.body);
    const phoneNumber = req.body.userDetails.phoneNumber;
    const user = await User.findOne({ phoneNumber }).select("userID");
    const coupon = req.body?.coupon;
    let formData = {
      payment_mode: _.get(req, "body.payment_mode", ""),
      customerName: _.get(req, "body.userDetails.user", ""),
      mobileNumber: _.get(req, "body.userDetails.phoneNumber", ""),
      billAmount: _.get(req, "body.billAmount", ""),
      coupon: coupon
        ? {
            _id: coupon?._id,
            min_purchase: coupon?.min_purchase,
            max_discount: coupon?.max_discount,
            discount: coupon?.discount,
            discount_type: coupon?.discount_type,
            deliveryFree: coupon?.deliveryFree,
          }
        : {},
      gst: _.get(req, "body.gst", ""),
      delivery_charge: _.get(req, "body.delivery_charge", ""),
      packing_charge: _.get(req, "body.packing_charge", ""),
      transaction_charge: _.get(req, "body.transaction_charge", ""),
      coupon_amount: _.get(req, "body.coupon_amount", ""),
      item_price: _.get(req, "body.item_price", ""),
      userId: _.get(req, "body.userDetails._id", ""),
      BromagUserID: user.userID ? user.userID : null,
      orderedFood: _.get(req, "body.orderedFood", ""),
      orderId: _.get(req, "body.orderId", ""),
      instructionsTakeaway: _.get(req, "body.instructionsTakeaway", ""),
    };
    const result = await takeAway.create(formData);
    let where = {
      userRef: _.get(req, "body.userDetails._id", ""),
      orderRef: "takeaway_order",
    };
    await Cart.deleteMany(where);
    if (coupon?._id) {
      console.log({ coupon });
      const updatedCoupon = await CouponModal.findOneAndUpdate(
        { _id: coupon?._id },
        { $push: { usedBy: _.get(req, "body.userDetails._id", "") } },
        { new: true }
      );
      console.log({ updatedCoupon });
    }
    const io = req.app.get("socketio");

    io.emit("demo", {
      id: Math.random(1000, 1000000),
      order: "takeaway",
      status: "Order placed",
    });
    return res.status(200).send({ message: "success" });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong");
  } finally {
    sendAdminNotifications({
      title: "Takeaway order",
      body: `Order ${req.body?.orderId} Received`,
      url: `/takeaway`,
    });
  }
};

module.exports = {
  createTakeAwayOrder,
  getTakeAwayOrder,
  updateTakeAwayOrder,
  addTakeAwayOrder,
};
