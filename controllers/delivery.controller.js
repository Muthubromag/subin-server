const Delivery = require("../modals/deliveraddress.models");
const _ = require("lodash");
const { calculateDistance } = require("../utils/helpers");
const footerModal = require("../modals/footerModal");

const addDeliveryAddress = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const result = await footerModal.find({});

    const distance = await calculateDistance(
      Number(result?.[0]?.latitude),
      Number(result?.[0]?.longitude),
      Number(latitude),
      Number(longitude)
    );
    console.log(result, latitude, longitude, distance);
    if (isNaN(distance)) {
      return res.status(500).send("unable to calculate distance");
    }
    if (distance >= 20) {
      return res
        .status(400)
        .send("Right Now ,We are not serving at this  location");
    }
    let formData = {
      name: _.get(req, "body.name"),
      streetName: _.get(req, "body.streetName"),
      addressType: _.get(req, "body.addressType"),
      landMark: _.get(req, "body.landMark"),
      city: _.get(req, "body.city"),
      picCode: _.get(req, "body.picCode"),
      contactNumber: _.get(req, "body.contactNumber"),
      customerState: _.get(req, "body.customerState"),
      latitude: _.get(req, "body.latitude"),
      longitude: _.get(req, "body.longitude"),
      currentLocation: _.get(req, "body.currentLocation"),
      distance: distance?.toFixed(0),
      userId: _.get(req, "body.userDetails._id"),
    };
    await Delivery.create(formData);
    return res.status(200).send("The address has been added successfully.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong");
  }
};

const getDeliveryAddress = async (req, res) => {
  try {
    const allAddress = await Delivery.find(
      {
        userId: _.get(req, "body.userDetails._id"),
      },
      { userId: 0 }
    ).sort({
      createdAt: -1,
    });
    return res.status(200).send({ data: allAddress });
  } catch (err) {
    return res.status(500).send("Something went wrong");
  }
};

const updateDeliveryAddress = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const result = await footerModal.find({});

    const distance = await calculateDistance(
      Number(result?.[0]?.latitude),
      Number(result?.[0]?.longitude),
      Number(latitude),
      Number(longitude)
    );
    if (isNaN(distance)) {
      return res.status(500).send("unable to calculate distance");
    }
    if (distance >= 20) {
      return res
        .status(400)
        .send("Right Now ,We are not serving at this  location");
    }
    let formData = {
      name: _.get(req, "body.name"),
      streetName: _.get(req, "body.streetName"),
      addressType: _.get(req, "body.addressType"),
      landMark: _.get(req, "body.landMark"),
      city: _.get(req, "body.city"),
      picCode: _.get(req, "body.picCode"),
      customerState: _.get(req, "body.customerState"),
      contactNumber: _.get(req, "body.contactNumber"),
      latitude: _.get(req, "body.latitude"),
      longitude: _.get(req, "body.longitude"),
      currentLocation: _.get(req, "body.currentLocation"),
      distance: distance?.toFixed(0),
      userId: _.get(req, "body.userDetails._id"),
    };

    const result1 = await Delivery.findByIdAndUpdate(
      { _id: _.get(req, "body._id", "") },
      formData
    );
    console.log(result1);
    return res.status(200).send("The address has been updated successfully.");
  } catch (err) {
    return res.status(500).send("Something went wrong");
  }
};

const deleteDeliveryAddress = async (req, res) => {
  try {
    let { id } = req.params;
    const result = await Delivery.findByIdAndDelete({ _id: id });
    return res.status(200).send({ data: result });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong");
  }
};

module.exports = {
  addDeliveryAddress,
  getDeliveryAddress,
  deleteDeliveryAddress,
  updateDeliveryAddress,
};
