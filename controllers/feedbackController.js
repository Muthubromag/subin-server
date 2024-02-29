const feedbackModal = require("../modals/feedbackModal");
const feedback = require("../modals/feedbackModal");
const _ = require("lodash");

const createFeedback = async (req, res) => {
  try {
    const result = await feedback.create({ ...req.body });
    return res.status(200).send({ data: result });
  } catch (err) {
    return res.status(500).send("Something went wrong while creating feedback");
  }
};
const getFeedback = async (req, res) => {
  try {
    const result = await feedback.find({});
    return res.status(200).send({ data: result });
  } catch (e) {
    return res.status(500).send("Something went wrong while fetching feedback");
  }
};
const updateFeedback = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await feedback.findByIdAndUpdate(id, { ...req.body });
    return res.status(200).send({ data: result });
  } catch (e) {
    return res.status(500).send("Something went wrong while updating feedback");
  }
};

const deleteMyFeedBack = async (req, res) => {
  try {
    const result = await feedback.findByIdAndDelete({ _id: req.params.id });
    return res.status(200).send("success");
  } catch (err) {
    return res.status(500).send("Something went wrong");
  }
};

const addMyfeedback = async (req, res) => {
  try {
    const formData = {
      userName: _.get(req, "body.userDetails.user", ""),
      mobileNumber: _.get(req, "body.userDetails.phoneNumber", ""),
      message: _.get(req, "body.feedback", ""),
      ratings: _.get(req, "body.rating", ""),
      userRef: _.get(req, "body.userDetails._id", ""),
    };
    const result = await feedback.create(formData);
    return res.status(200).send({ data: result });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong while creating feedback");
  }
};

const addHomefeedback = async (req, res) => {
  try {
    const { name, email, mobile, feedback } = req.body;
    const formData = {
      userName: name,
      mobileNumber: mobile,
      message: feedback,
      ratings: 0,

      email: email,
    };
    const result = await feedbackModal.create(formData);
    return res.status(200).send({ data: result });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong while creating feedback");
  }
};

const getMyfeedback = async (req, res) => {
  try {
    const result = await feedback
      .find({
        mobileNumber: _.get(req, "body.userDetails.phoneNumber", ""),
      })
      .sort({ createdAt: -1 });
    return res.status(200).send({ data: result });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong while creating feedback");
  }
};

const getAllfeedback = async (req, res) => {
  try {
    const result = await feedback
      .find({ options: "yes" })
      .populate("userRef", { _id: 0, tokenRef: 0 });
    return res.status(200).send({ data: result });
  } catch (e) {
    return res.status(500).send("Something went wrong");
  }
};

module.exports = {
  createFeedback,
  updateFeedback,
  deleteMyFeedBack,
  getFeedback,
  addMyfeedback,
  getMyfeedback,
  addHomefeedback,

  getAllfeedback,
};
