const Table = require("../modals/table");
const { get } = require("lodash");
const helpers = require("../utils/helpers");
const tableBookingModal = require("../modals/tableBookingModal");

const createTable = async (req, res) => {
  try {
    const tablePhto = req.file;
    const timeSlots = req.body?.timeSlots?.split(",");

    const formatted = [];
    if (tablePhto) {
      const path = `Table/${tablePhto.originalname}${Date.now()}/${
        tablePhto.filename
      }`;
      await helpers.uploadFile(tablePhto, path);
      if (path) {
        await helpers.deleteS3File(path);
      }
      for (const item of timeSlots) {
        formatted.push({ time: item }); // Assuming processItem is an asynchronous function
      }

      const image = helpers.getS3FileUrl(path);
      helpers.deleteFile(tablePhto);
      console.log({ formatted });
      await Table.create({
        seatsAvailable: req.body.seatsAvailable,
        tableNo: req.body.tableNo,
        image: image,
        timeSlots: formatted,
      });

      return res.status(200).send({ message: "Table created successfully" });
    }
  } catch (err) {
    console.log(err, "err");
    return res.status(500).send("Something went wrong while creating table");
  }
};
const createTable1 = async (req, res) => {
  try {
    const result = await Table.create({
      seatsAvailable: "5",
      tableNo: "1",
      timeSlots: [
        {
          time: "10:00 AM - 11:00 AM",
        },
        {
          time: "11:00 AM - 12:00 AM",
        },
      ],
    });
    console.log(result);
    return res.status(200).send({ message: "Table created successfully" });
  } catch (err) {
    console.log(err, "err");
    return res.status(500).send("Something went wrong while creating table");
  }
};

const getTable = async (req, res) => {
  try {
    const result = await Table.find({}).sort({ tableNo: 1 });
    return res.status(200).send({ data: result });
  } catch (e) {
    return res.status(500).send("Something went wrong while fetching table");
  }
};

const getTableslots = async (req, res) => {
  try {
    const { tableId, bookingDate } = req.body;
    const table = await Table.findById(tableId);
    const formattedBookingDate = new Date(bookingDate);

    // Get booked time slots for the specified date
    const bookedTimeSlots = await tableBookingModal
      .find({
        tableId: tableId,
        bookingDate: formattedBookingDate,
      })
      .distinct("timeSlot");
    console.log({ bookedTimeSlots, table: table?.timeSlots });
    const availableTimeSlots = table.timeSlots.filter((timeSlot) => {
      return !bookedTimeSlots.some((id) => id.equals(timeSlot._id));
    });

    return res.status(200).send({ data: availableTimeSlots });
  } catch (e) {
    return res.status(500).send("Something went wrong while fetching table");
  }
};

const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const imageUrl = req.body.image;
    const timeSlots = req.body?.timeSlots?.split(",");

    const formatted = [];
    for (const item of timeSlots) {
      formatted.push({ time: item }); // Assuming processItem is an asynchronous function
    }
    if (get(req, "file", false)) {
      const tablePhto = req.file;

      if (tablePhto) {
        const path = `Table/${tablePhto.originalname}${Date.now()}/${
          tablePhto.filename
        }`;
        await helpers.uploadFile(tablePhto, path);
        if (imageUrl) {
          await helpers.deleteS3File(imageUrl);
        }
        const image = helpers.getS3FileUrl(path);
        helpers.deleteFile(tablePhto);
        await Table.findByIdAndUpdate(id, {
          seatsAvailable: req.body.seatsAvailable,
          tableNo: req.body.tableNo,
          image: image,
          timeSlots: formatted,
        });

        return res.status(200).send({ message: "Table updated successfully" });
      }
    } else if (status === true || status === false) {
      await Table.findByIdAndUpdate(id, {
        status,
      });
      return res.status(200).send({ Message: "Table updated successfully" });
    } else {
      await Table.findByIdAndUpdate(id, {
        seatsAvailable: req.body.seatsAvailable,
        tableNo: req.body.tableNo,
        image: imageUrl,
        timeSlots: formatted,
      });
      return res.status(200).send({ Message: "Table updated successfully" });
    }
  } catch (err) {
    console.log(err, "err");
    return res.status(500).send("Something went wrong while updating table");
  }
};

const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { image } = req.body;
    await Table.findByIdAndDelete(id);
    await helpers.deleteS3File(image);
    return res.status(200).send("table deleted");
  } catch (err) {
    return res.status(500).send("Something went wrong while deleting table");
  }
};

const getAllTables = async (req, res) => {
  try {
    const result = await Table.find({});
    return res.status(200).send({ data: result });
  } catch (err) {
    return res.status(500).send("Something went wrong while deleting table");
  }
};

module.exports = {
  createTable,
  deleteTable,
  getTable,
  updateTable,
  createTable1,
  getAllTables,
  getTableslots,
};
