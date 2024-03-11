const { get } = require("lodash");
const Coupon = require("../modals/CouponModal");

const helpers = require("../utils/helpers");
const { default: mongoose } = require("mongoose");

const createCoupon = async (req, res) => {
  try {
    const { code, discountPercentage, validUntil, couponType } = req.body;
    const existingCoupon = await Coupon.aggregate([
      {
        $match: {
          code: { $eq: code },
        },
      },
    ]);

    if (existingCoupon.length > 0) {
      return res.status(400).send(`Coupon Code  '${code}' already exists .`);
    }

    await Coupon.create({
      code,
      discountPercentage,
      validUntil,
      couponType,
    });

    return res.status(200).send({ message: "Coupon created successfully" });
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

const updateCoupon = async (req, res) => {
  const { id } = req.params;
  const { code, discountPercentage, validUntil, status, couponType } = req.body;
  console.log({ id });
  try {
    const existingCoupon = await Coupon.aggregate([
      {
        $match: {
          $and: [
            { code: { $eq: code } },
            { _id: { $ne: new mongoose.Types.ObjectId(id) } },
          ],
        },
      },
    ]);

    console.log({ existingCoupon });

    if (existingCoupon?.length > 0) {
      return res.status(400).send(`Coupon Code  '${code}' already exists .`);
    }
    await Coupon.findByIdAndUpdate(id, {
      code,
      discountPercentage,
      validUntil,
      status,
      couponType,
    });
    return res.status(200).send({ Message: "Coupon updated successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).send("Something went wrong while updating Coupon");
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    await Coupon.findByIdAndDelete(id);

    return res.status(200).send("Coupon deleted");
  } catch (e) {
    return res.status(500).send("Something went wrong while deleting coupon");
  }
};

// web
const getCouponsByUser = async (req, res) => {
  const { _id: userId } = req.body?.userDetails;
  console.log({ userId });
  try {
    if (!userId) {
      return res.status(200).json([]);
    }
    // Find coupons that are active and have not been used by the specified user
    const unusedCoupons = await Coupon.find({
      status: "active",
      usedBy: { $nin: [userId] },
      couponType: "coupon",
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
  updateCoupon,
  getCouponsCodeByUser,
};
