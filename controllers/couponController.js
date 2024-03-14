const { get } = require("lodash");
const Coupon = require("../modals/CouponModal");

const helpers = require("../utils/helpers");
const { default: mongoose } = require("mongoose");
const { deleteS3Image } = require("../utils/aws");

const createCoupon = async (req, res) => {
  try {
    const {
      orderType,
      min_purchase,
      max_discount,
      discount,
      discount_type,
      expiry,
      status,

      deliveryFree,
      image,
      info,
    } = req.body;
    const file = req.file?.key;
    const filePath = helpers.getS3FileUrl(file);
    const couponExpiry = new Date(expiry);
    couponExpiry.setHours(23, 59, 59, 999);
    const result = await Coupon.create({
      orderType,
      min_purchase,
      max_discount,
      discount,
      discount_type,
      expiry: couponExpiry,
      status,
      deliveryFree,
      image: filePath,
      fileName: file,
      info,
    });

    return res
      .status(200)
      .send({ message: "Coupon created successfully", result });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong while creating Coupon");
  }
};

const getCoupons = async (req, res) => {
  try {
    const result = await Coupon.find({}).sort({ createdAt: -1 });
    return res.status(200).send({ data: result });
  } catch (e) {
    return res.status(500).send("Something went wrong while fetching Coupon");
  }
};

const updateCoupons = async (req, res) => {
  const { id } = req.params;
  const {
    orderType,
    min_purchase,
    max_discount,
    discount,
    discount_type,
    expiry,
    status,

    deliveryFree,
    image,
    info,
    isFileChanged,
  } = req.body;
  console.log({ id });
  let newImage = null;
  let oldImage = "";
  let fileName = "";
  try {
    const existingCoupon = await Coupon.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    console.log({ existingCoupon });
    oldImage = existingCoupon?.fileName;

    if (isFileChanged) {
      fileName = req.file?.key;
      newImage = helpers.getS3FileUrl(fileName);
    }

    console.log({ oldImage, newImage });

    const result = await Coupon.findByIdAndUpdate(
      id,
      {
        orderType,
        min_purchase,
        max_discount,
        discount,
        discount_type,
        expiry,
        status,
        deliveryFree,
        fileName,
        image: newImage || oldImage,
        info,
      },
      { new: true }
    );
    if (isFileChanged && oldImage) {
      await deleteS3Image(oldImage);
    }
    return res
      .status(200)
      .send({ Message: "Coupon updated successfully", result });
  } catch (e) {
    console.log(e);
    return res.status(500).send("Something went wrong while updating Coupon");
  } finally {
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Coupon.findByIdAndDelete(id);
    if (result?.fileName) {
      await deleteS3Image(result?.fileName);
    }

    return res.status(200).send({ msg: "Coupon deleted", result });
  } catch (e) {
    return res.status(500).send("Something went wrong while deleting coupon");
  }
};

// web
const getCouponsByUser = async (req, res) => {
  // const { _id: userId } = req.body?.userDetails;
  // console.log({ userId });
  try {
    // if (!userId) {
    //   return res.status(200).json([]);
    // }
    const currentDate = new Date();
    // Find coupons that are active and have not been used by the specified user
    const unusedCoupons = await Coupon.find({
      status: "active",
      // usedBy: { $nin: [userId] },
      expiry: { $gte: currentDate },
    });

    return res.status(200).json(unusedCoupons);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCouponsCodeByUser = async (req, res) => {
  const { _id: userId } = req.body?.userDetails;
  const { code } = req.body;
  console.log({ userId });
  try {
    if (!userId) {
      return res.status(200).json([]);
    }
    // Find coupons that are active and have not been used by the specified user
    const unusedCoupons = await Coupon.findOne({
      status: "active",
      usedBy: { $nin: [userId] },
      couponType: "code",
      code,
    });

    return res.status(200).json(unusedCoupons);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  getCouponsByUser,
  deleteCoupon,
  updateCoupons,
  getCouponsCodeByUser,
};
