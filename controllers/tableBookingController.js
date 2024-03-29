const Table = require("../modals/table");
const tableBooking = require("../modals/tableBookingModal");
const _ = require("lodash");
const {
  generateAlphanumericFromNamePhoneTimestamp,
  sendAdminNotifications,
  sendNotifications,
} = require("../utils/helpers");

const createTableBooking = async (req, res) => {
  try {
    const result = await tableBooking.create({ ...req.body });
    return res.status(200).send({ data: result });
  } catch (err) {
    return res
      .status(500)
      .send("Something went wrong while creating table booking");
  }
};

const getTableBooking = async (req, res) => {
  try {
    const result = await tableBooking.find({}).sort({ createdAt: -1 });
    return res.status(200).send({ data: result });
  } catch (e) {
    return res
      .status(500)
      .send("Something went wrong while fetching tableBooking");
  }
};

const updateTableBooking = async (req, res) => {
  const { booking } = req.body;
  let user_id = null;
  let table_id = null;
  try {
    const { id } = req.params;

    const result = await tableBooking.findByIdAndUpdate(id, { ...req.body });
    user_id = result?.userId;
    table_id = result?.diningID;
    const io = req.app.get("socketio");
    io.emit("demo", {
      id: Math.random(1000, 1000000),
      order: "takeaway",
      status: req.body.booking,
    });
    return res.status(200).send({ data: result });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send("Something went wrong while updating tableBooking");
  } finally {
    sendNotifications({
      title: `Dining Table ${table_id}`,
      body: booking,
      user_id,
      url: "/profile-table-booking",
    });
  }
};

const bookMyTable = async (req, res) => {
  let diningID = "";
  try {
    const code = await generateAlphanumericFromNamePhoneTimestamp(
      _.get(req, "body.customerName", ""),
      _.get(req, "body.contactNumber", "")
    );
    diningID = `BRODINE${code}`;
    const formDatas = {
      diningID: diningID,
      customerName: _.get(req, "body.customerName", ""),
      contactNumber: _.get(req, "body.contactNumber", ""),
      alterateContactNumber: _.get(req, "body.alterateContactNumber", ""),
      pickupAddress: _.get(req, "body.pickupAddress", ""),
      location: _.get(req, "body.location", ""),
      pickupOption: _.get(req, "body.pickupOption", ""),
      noOfGuest: _.get(req, "body.noOfGuest", ""),
      timeSlot: _.get(req, "body.timeSlot", ""),
      booking: _.get(req, "body.booking", ""),
      tableNo: _.get(req, "body.tableNo", ""),
      tablePic: _.get(req, "body.tablePic", ""),
      tableId: _.get(req, "body.tableId", ""),
      userId: _.get(req, "body.userDetails._id", ""),
      bookingDate: _.get(req, "body.bookingDate", ""),
      diningTime: _.get(req, "body.diningTime", ""),
    };

    await tableBooking.create(formDatas);
    // const result = await Table.findByIdAndUpdate(
    //   { _id: _.get(req, "body.tableId", "") },
    //   { status: true }
    // );
    const io = req.app.get("socketio");

    io.emit("demo", {
      id: Math.random(1000, 1000000),
      order: "Dining",
      status: "Table Booked",
    });
    return res.status(200).send({
      message: "Your table reservation has been successfully confirmed.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong");
  } finally {
    sendAdminNotifications({
      title: "Dining Table Booked",
      body: `Table Booked ${diningID}`,
      url: `/bookingorder`,
    });
  }
};

const getAllBookedTables = async (req, res) => {
  try {
    const result = await tableBooking.find({
      userId: _.get(req, "body.userDetails._id", ""),
      booking: { $ne: "Canceled" },
    });
    return res.status(200).send({ data: result });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong");
  }
};

const cancelBooking = async (req, res) => {
  let diningID = "";
  try {
    const result = await tableBooking.findByIdAndUpdate(
      { _id: _.get(req, "body.booking_id", "") },
      { booking: "Canceled" }
    );
    console.log(result);
    diningID = result?.diningID;
    await Table.findByIdAndUpdate(
      { _id: _.get(req, "body.table_id", "") },
      { status: false }
    );

    const io = req.app.get("socketio");

    io.emit("demo", {
      id: Math.random(1000, 1000000),
      order: "Dining",
      status: "Table Cancelled",
    });
    return res.status(200).send({ message: "Success" });
  } catch (err) {
    return res
      .status(500)
      .send("Something went wrong while updating tableBooking");
  } finally {
    sendAdminNotifications({
      title: "Dining Table Cancelled",
      body: `${diningID} Cancelled`,
      url: `/bookingorder`,
    });
  }
};

const checkInBooking = async (req, res) => {
  try {
    await tableBooking.findByIdAndUpdate(
      { _id: _.get(req, "body.booking_id", "") },
      { booking: "CheckIn" }
    );

    return res.status(200).send({ message: "Success" });
  } catch (err) {
    return res
      .status(500)
      .send("Something went wrong while updating tableBooking");
  }
};

module.exports = {
  createTableBooking,
  getTableBooking,
  updateTableBooking,
  bookMyTable,
  getAllBookedTables,
  cancelBooking,
  checkInBooking,
};
