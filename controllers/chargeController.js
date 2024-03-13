const { get } = require("lodash");
const helpers = require("../utils/helpers");
const chargeModal = require("../modals/chargeModal");

const addCharges = async (req, res) => {
  try {
    const data = req.body;
    const isCharges = await chargeModal.find({});

    if (isCharges.length === 0) {
      await chargeModal.create(data);

      return res.status(200).send({ message: "Charges added successfully" });
    } else {
      await chargeModal.findByIdAndUpdate(isCharges[0]._id, data);
      return res.status(200).send({ message: "Charges Updated successfully" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Unable to add charges" });
  }
};

const getCharges = async (req, res) => {
  try {
    const result = await chargeModal.find({});

    return res.status(200).send({ charges: result });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { addCharges, getCharges };
