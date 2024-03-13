const express = require("express");
const router = express.Router();
const {
  addCharges,

  getCharges,
} = require("../controllers/chargeController");
const { webTokenMiddleware } = require("../middleWare/webMiddleware");

router.post("/addCharges", addCharges).get("/charges", getCharges);

router.get("/usercharges", webTokenMiddleware, getCharges);

module.exports = router;
