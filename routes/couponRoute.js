const express = require("express");
const router = express.Router();
const {
  createCoupon,
  deleteCoupon,
  getCoupons,
  getCouponsByUser,
  updateCoupon,
  getCouponsCodeByUser,
} = require("../controllers/couponController");
const { webTokenMiddleware } = require("../middleWare/webMiddleware");

router
  .post("/createcoupon", createCoupon)
  .get("/getcoupons", getCoupons)
  .put("/updatecoupon/:id", updateCoupon)
  .delete("/deletecoupon/:id", deleteCoupon);

// web
router.get("/getusercoupons", webTokenMiddleware, getCouponsByUser);
router.post("/getusercode", webTokenMiddleware, getCouponsCodeByUser);

module.exports = router;
