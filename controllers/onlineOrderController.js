const onlineOrder = require("../modals/onlineOrderModal");
const Cart = require("../modals/cart.models");
const _ = require("lodash");
const Order = require("../modals/order");
const User = require("../modals/userModal");
const {
  sendNotifications,
  sendAdminNotifications,
} = require("../utils/helpers");
const CouponModal = require("../modals/CouponModal");
const takeAwayModal = require("../modals/takeAwayModal");
const dinning = require("../modals/dinningOrder");
const createOnlineOrder = async (req, res) => {
  try {
    // const result = await Order.create({ ...req.body, orderType: "online" });
    // let where = {
    //   userRef: _.get(req, "body.userDetails._id", ""),
    //   orderRef: "online_order",
    // };
    // await Cart.deleteMany(where);
    // const riders = await DeliveryBoy.find();  rituraj updated code //--------
    // for(let rider of riders) {
    //   if(rider.fcmToken && rider.onDuty) {
    //     helpers.sendPushNotification(rider.fcmToken, 'New Order Created', 'A new order has been created', 'order-created', {order: result})
    //   }
    // }
    return res.status(200).send({ data: result });
  } catch (err) {
    console.log(err.message);
    return res
      .status(500)
      .send("Something went wrong while creating online order");
  }
};

const getOnlineOrder = async (req, res) => {
  try {
    const result = await Order.find({
      orderType: "online",
    }).sort({
      createdAt: -1,
    });
    return res.status(200).send({ data: result });
  } catch (err) {
    return res
      .status(500)
      .send("Something went wrong while fetching online order");
  }
};

const updateOnlineOrder = async (req, res) => {
  const { id } = req.params;
  let user_id = null;
  let status = req.body.status;
  try {
    const result = await Order.findOneAndUpdate(
      { _id: id, orderType: "online" },
      { ...req.body }
    );
    console.log(result);
    user_id = result?.user;

    const io = req.app.get("socketio");

    io.emit("demo", {
      id: Math.random(1000, 1000000),
      order: "online",
      status: req.body.status,
    });

    return res.status(200).send({ data: result });
  } catch (e) {
    return res
      .status(500)
      .send("Something went wrong while updating online order");
  } finally {
    sendNotifications({ title: "Online order", body: status, user_id });
  }
};

const deleteOnlineOrder = async (req, res) => {};

// Web
const addOnlineOrder = async (req, res) => {
  try {
    const phoneNumber = req.body.userDetails.phoneNumber;
    const user = await User.findOne({ phoneNumber }).select("userID");
    const coupon = req.body?.coupon;

    let formData = {
      payment_mode: _.get(req, "body.payment_mode", ""),
      customerName: _.get(req, "body.customerName", ""),
      mobileNumber: _.get(req, "body.mobileNumber", ""),
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
      isDeliveryFree: _.get(req, "body.isDeliverFree", false),
      gst: _.get(req, "body.gst", ""),
      deliveryCharge: _.get(req, "body.deliveryCharge", ""),
      packingCharge: _.get(req, "body.packingCharge", ""),
      transactionCharge: _.get(req, "body.transactionCharge", ""),
      couponAmount: _.get(req, "body.couponAmount", ""),
      itemPrice: _.get(req, "body.itemPrice", ""),
      user: _.get(req, "body.userDetails._id", ""),
      orderedFood: _.get(req, "body.orderedFood", ""),
      location: _.get(req, "body.location", ""),
      instructions: req.body.instructions,
      types: req.body.types,
      BromagUserID: user.userID ? user.userID : null,
      status: "Order placed",
      orderId: _.get(req, "body.orderId", ""),
      orderType: "online",
    };

    const result = await Order.create(formData);
    let where = {
      userRef: _.get(req, "body.userDetails._id", ""),
      orderRef: "online_order",
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
    // console.log(result);
    const io = req.app.get("socketio");

    io.emit("demo", {
      id: Math.random(1000, 1000000),
      order: "online",
      status: "Order placed",
    });

    return res.status(200).send({ message: "success" });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong");
  } finally {
    sendAdminNotifications({
      title: "Online order",
      body: `Order ${req.body?.orderId} Received`,
      url: `/onlineorder`,
    });
  }
};

const checkAllOrders = async (req, res) => {
  try {
    const result = await Order.countDocuments({
      status: "Order placed",
    });
    const result1 = await takeAwayModal.countDocuments({
      status: "Order placed",
    });
    const result3 = await dinning.countDocuments({
      status: "Order placed",
    });

    console.log(result, result1, result3);
    return res.status(200).json(result || result1 || result3);
  } catch (err) {
    console.log(error);
    return res.status(200).send(false);
  }
};

module.exports = {
  createOnlineOrder,
  getOnlineOrder,
  deleteOnlineOrder,
  updateOnlineOrder,
  addOnlineOrder,
  checkAllOrders,
};
