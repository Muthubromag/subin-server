const footer = require("../modals/footerModal");
const { get } = require("lodash");
const helpers = require("../utils/helpers");
const policy = require("../modals/policy");
const socialMedia = require("../modals/socialMediaFooter");
const chargeModal = require("../modals/chargeModal");
const createFooter = async (req, res) => {
  try {
    const isFooter = await footer.find({});

    if (isFooter.length === 0) {
      const logo = req.file;
      if (logo) {
        const path = `Footer/Logo${Date.now()}/${logo.filename}`;
        await helpers.uploadFile(logo, path);
        if (path) {
          await helpers.deleteS3File(path);
        }
        const image = helpers.getS3FileUrl(path);
        helpers.deleteFile(logo);
        await footer.create({
          name: get(req, "body.name"),
          email: get(req, "body.email"),
          contactNumber: get(req, "body.number"),
          address: get(req, "body.address"),
          logo: image,
          colors: get(isFooter, "[0].colors"),
          location: get(req, "body.location"),
          latitude: get(req, "body.latitude"),
          longitude: get(req, "body.longitude"),
        });

        return res.status(200).send({ message: "Footer created successfully" });
      } else {
        await footer.create({
          name: get(req, "body.name"),
          email: get(req, "body.email"),
          contactNumber: get(req, "body.number"),
          address: get(req, "body.address"),
          location: get(req, "body.location"),
          latitude: get(req, "body.latitude"),
          longitude: get(req, "body.longitude"),
        });
        return res.status(200).send({ message: "Footer created successfully" });
      }
    } else {
      const logo = req.file;
      if (logo) {
        const path = `Footer/Logo${Date.now()}/${logo.filename}`;
        await helpers.uploadFile(logo, path);
        if (path) {
          await helpers.deleteS3File(isFooter[0].logo);
        }

        const image = helpers.getS3FileUrl(path);
        helpers.deleteFile(logo);
        await footer.findByIdAndUpdate(isFooter[0]._id, {
          name: get(req, "body.name"),
          email: get(req, "body.email"),
          contactNumber: get(req, "body.number"),
          address: get(req, "body.address"),
          logo: image,
          colors: get(isFooter, "[0].colors"),
          latitude: get(req, "body.latitude"),
          longitude: get(req, "body.longitude"),
        });

        return res.status(200).send({ message: "Footer Updated successfully" });
      } else {
        const { primaryColor, secondaryColor, thirdColor, fourthColor } =
          req.body;
        const data = await footer.findByIdAndUpdate(isFooter[0]._id, {
          name: get(req, "body.name"),
          email: get(req, "body.email"),
          contactNumber: get(req, "body.number"),
          address: get(req, "body.address"),
          logo: isFooter.logo,
          colors: {
            primaryColor: primaryColor
              ? primaryColor
              : isFooter[0].colors.primaryColor,
            secondaryColor: secondaryColor
              ? secondaryColor
              : isFooter[0].colors.secondaryColor,
            thirdColor: thirdColor ? thirdColor : isFooter[0].colors.thirdColor,
            fourthColor: fourthColor
              ? fourthColor
              : isFooter[0].colors.fourthColor,
          },
          location: {
            map_link: get(req, "body.map_link"),
            embedUrl: get(req, "body.embedUrl"),
          },
          latitude: get(req, "body.latitude"),
          longitude: get(req, "body.longitude"),
          content: get(req, "body.content"),
        });
        return res.status(200).send({ message: "Footer Updated successfully" });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Something went wrong" });
  }
};
const addWhoWeAre = async (req, res) => {
  try {
    const { type, content } = req.body;

    // Check if the policy with the specified type exists
    const existingPolicy = await policy.findOne({ type });

    if (existingPolicy) {
      // If the policy exists, update its content
      await policy.updateOne({ type }, { content });
      return res.status(200).send({ message: "Policy updated successfully" });
    } else {
      // If the policy doesn't exist, create a new one
      await policy.create({ type, content });
      return res.status(200).send({ message: "Policy created successfully" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

const getFooter = async (req, res) => {
  try {
    const result = await footer.find({});
    const policies = await policy.find({});
    const social = await socialMedia.find({ status: true });
    const charges = await chargeModal.find();
    return res.status(200).send({ data: result, policies, social, charges });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { createFooter, getFooter, addWhoWeAre };
