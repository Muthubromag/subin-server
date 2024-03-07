const express = require("express");
const router = express.Router();
const {
  createTable,
  getTable,
  updateTable,
  deleteTable,
  getAllTables,
  createTable1,
  getTableslots,
} = require("../controllers/tablecontroller");
const uploaders = require("../utils/uploaders");

const { ImageUploader } = uploaders;

router
  .post("/createtable", ImageUploader.single("file"), createTable)
  .post("/gettableSlots", getTableslots)
  .get("/gettable", getTable)
  .put("/updatetable/:id", ImageUploader.single("file"), updateTable)
  .delete("/deletetable/:id", deleteTable);

// Web
router.get("/get_all_tables", getAllTables);

module.exports = router;
