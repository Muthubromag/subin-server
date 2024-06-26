const express = require("express");
const router = express.Router();
const {
  createCoupon,
  deleteCoupon,
  getCoupons,
  getCouponsByUser,
  updateCoupons,
  getCouponsCodeByUser,
  updateCouponStatus,
} = require("../controllers/couponController");
const { webTokenMiddleware } = require("../middleWare/webMiddleware");
const { uploadCoupon } = require("../utils/aws");

router
  .post("/createcoupon", uploadCoupon, createCoupon)
  .get("/getcoupons", getCoupons)
  .put("/updatecoupon/:id", uploadCoupon, updateCoupons)
  .put("/updateCouponStatus/:id", updateCouponStatus)
  .delete("/deletecoupon/:id", deleteCoupon);

// web
router.get("/getusercoupons", webTokenMiddleware, getCouponsByUser);
router.post("/getusercode", webTokenMiddleware, getCouponsCodeByUser);

module.exports = router;
