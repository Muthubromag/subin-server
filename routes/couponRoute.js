const express = require("express");
const router = express.Router();
const {
  createCoupon,
  deleteCoupon,
  getCoupons,
  getCouponsByUser,
  updateCoupon,
} = require("../controllers/couponController");
const { webTokenMiddleware } = require("../middleWare/webMiddleware");

router
  .post("/createcoupon", createCoupon)
  .get("/getcoupons", getCoupons)
  .put("/updatecoupon/:id", updateCoupon)
  .delete("/deletecoupon/:id", deleteCoupon);

// web
router.get("/getusercoupons", webTokenMiddleware, getCouponsByUser);

module.exports = router;
