const callForOrder = require("../modals/callForOrder");
const _ = require("lodash");
const User = require("../modals/userModal");
const Order = require("../modals/order");
const productModal = require("../modals/productModal");
const chargeModal = require("../modals/chargeModal");
const footerModal = require("../modals/footerModal");
const { sendNotifications } = require("../utils/helpers");
const GST = 5 / 100;
const DELIVERY_CHARGE = 50;
const PACKING_CHARGE = 10 / 100;
const TRANSACTION = 5 / 100;

const createCallOrder1 = async (req, res) => {
  try {
    const orderedFoodArray = req.body.formData.orderedFood;

    const modifiedOrderedFood = orderedFoodArray.map((item) => {
      if (item.type) {
        const [type, price] = item.type.split(" - ");
        return { ...item, type, price };
      } else {
        // If 'type' is not present, return the original object
        return item;
      }
    });

    // Assigning the modified orderedFood array back to formData
    req.body.formData.orderedFood = modifiedOrderedFood;

    // console.log(JSON.stringify(req.body));

    // get all without type food

    const foodWithoutType = req.body?.formData?.orderedFood.filter(
      (item) => !item.hasOwnProperty("type")
    );
    // get all with type food
    const foodWithType = req.body?.formData?.orderedFood.filter((item) =>
      item.hasOwnProperty("type")
    );
    console.log(foodWithType, "foodWithType");
    console.log(foodWithoutType, "foodWithoutType");
    // ================================================================================================

    const getData = await productModal.find({
      name: { $in: req.body?.formData?.orderedFood?.map((item) => item.food) },
    });

    const updatedOrderedFood = req.body?.formData?.orderedFood?.map((order) => {
      const productMatch = getData.find(
        (product) => product.name === order.food
      );
      console.log("--------", { productMatch });

      return {
        ...order,
        id: productMatch?._id?.toString(),
        image: productMatch ? productMatch.image : null,
      };
    });

    req.body.formData.orderedFood = updatedOrderedFood;
    // console.log({updatedOrderedFood})

    // return;
    // ================================================================================================

    // find all without type food from db
    const products = await productModal.find({
      name: { $in: foodWithoutType.map((item) => item.food) },
    });

    console.log(products, "products");
    // calculating each product total price
    const calculatedPrices = products.map((product) => {
      const requestItem = foodWithoutType.find(
        (item) => item.food === product.name
      );
      console.log(requestItem, "reqqq");
      const quantity = parseInt(requestItem.quantity, 10);
      const totalPrice =
        quantity *
        (product.discountPrice ? product.discountPrice : +product.price);

      return { food: product.name, quantity: quantity, totalPrice: totalPrice };
    });

    console.log(calculatedPrices, "calculatedPrices of all non type");
    // get grand total by product.
    const totalAmount = calculatedPrices.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    console.log(totalAmount, "totalAmount of  all non type");

    let user = null;
    // ================================================================================================
    user = await User.findOne({
      phoneNumber: `+91${req.body.formData.mobileNumber}`,
    });
    if (!user) {
      const prefix = "BIPL1003";
      const randomNumber = Math.floor(10000 + Math.random() * 90000); // Generate a random 5-digit number
      const userID = `${prefix}${randomNumber}`;

      user = await User.create({
        phoneNumber: `+91${req.body.formData.mobileNumber}`,
        user: req.body?.formData?.customerName,
        email: null,
        userID,
      });
    }
    console.log({ user });
    const { _id } = user;

    const typesData = req.body.formData.types?.map((type) => ({
      type: type.type,
      price: type.price,
    }));
    console.log(foodWithType, "foodwithtype");
    const foodItemCosts = foodWithType?.map(
      (item) => +item?.quantity * +item.price
    );
    console.log(foodItemCosts, "foodItemCosts");
    const totalFoodCost = foodItemCosts?.reduce((acc, cost) => acc + cost, 0);
    console.log(totalFoodCost, "totalFoodCost of typed food");

    if (totalAmount && totalFoodCost) {
      const grandTotal = Math.round(totalAmount + totalFoodCost);
      console.log(grandTotal, "grandtotal");
      const result = await Order.create({
        ...req.body.formData,
        orderType: "call",
        user: _id,
        BromagUserID: user.userID ? user?.userID : null,
        types: typesData,
        grandTotal: grandTotal,
        payment_mode: "",
      });
      return res.status(200).send({ data: result });
    } else if (totalAmount) {
      const grandTotal = Math.round(totalAmount);
      const result = await Order.create({
        ...req.body.formData,
        orderType: "call",
        user: _id,
        BromagUserID: user.userID ? user?.userID : null,
        types: typesData,
        grandTotal: grandTotal,
        payment_mode: "",
      });
      return res.status(200).send({ data: result });
    } else {
      const grandTotal = Math.round(totalFoodCost);
      const result = await Order.create({
        ...req.body.formData,
        orderType: "call",
        user: _id,
        BromagUserID: user.userID ? user?.userID : null,
        types: typesData,
        grandTotal: grandTotal,
        payment_mode: "",
      });
      console.log(result);
      return res.status(200).send({ data: result });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send("Something went wrong while creating call order");
  }
};

async function FindUser(mobile) {
  try {
    let user = await User.findOne({
      phoneNumber: mobile,
    });

    return user;
  } catch (error) {
    console.log(mobile);
    console.log(error);
    return null;
  }
}
async function CreateUser(userData) {
  try {
    const prefix = "BIPL1003";
    const randomNumber = Math.floor(10000 + Math.random() * 90000); // Generate a random 5-digit number
    const userID = `${prefix}${randomNumber}`;
    let user = await User.create({
      phoneNumber: `+91${userData?.mobileNumber}`,
      user: userData?.customerName,
      email: null,
      userID,
    });

    return user;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}

function calculateFare(distance, charges) {
  console.log({ chargesData: charges });

  if (!charges) {
    return 0;
  }
  let deliveryCharges = charges;

  let {
    min_km = 0,
    max_km = 0,
    min_price = 0,
    max_price = 0,
    extra_charges = 0,
  } = deliveryCharges;
  console.log({ min_km, max_km, min_price, max_price, extra_charges });
  if (distance <= min_km) {
    return min_price || 0;
  } else if (distance <= max_km) {
    return min_price + extra_charges * (distance - min_km) || 0;
  } else {
    return max_price || 0;
  }
}

async function calculatedExtraCharges({ amount, type, distance }) {
  const chargesdata = await chargeModal.find();
  let charges = chargesdata?.[0];
  console.log({ charges });
  let cgst = charges?.gst?.value;
  let gstMode = charges?.gst?.mode;

  let cpacking = charges?.packing?.value;
  let packingMode = charges?.packing?.mode;
  let ctransaction = charges?.transaction?.value;
  let transactionMode = charges?.transaction?.mode;

  let gst = gstMode === "percentage" ? amount * (cgst / 100) : cgst;
  let delivery =
    type?.toLowerCase() !== "take away"
      ? calculateFare(Number(distance), charges?.delivery)
      : 0;
  console.log({ delivery, distance });
  let packingPrice =
    packingMode === "percentage" ? amount * (cpacking / 100) : cpacking;
  let transactionPrice =
    transactionMode === "percentage"
      ? amount * (ctransaction / 100)
      : ctransaction;
  let total = gst + (delivery || 0) + packingPrice + transactionPrice + amount;
  return {
    gst: gst?.toFixed(0),
    delivery: delivery || 0,
    packingPrice,
    transactionPrice,
    total: total?.toFixed(0),
  };
}

const createCallOrder = async (req, res) => {
  let user_id = null;
  const { formData } = req.body;
  try {
    const ORDERTYPE = "call";

    const orderedFoodArray = formData.orderedFood;
    console.log({
      orderedFoodArray,
      formData: formData?.callForOrderInstrcution,
    });

    const products = await productModal.find({
      name: { $in: orderedFoodArray?.map((item) => item?.foodName) },
    });

    const processedFood = [];
    const instruction = {};
    let amount = 0;
    let prices = null;

    for (const element of orderedFoodArray) {
      let food = products.filter(
        (td, i) => td?.name === element?.foodName
      )?.[0];
      console.log(`Processed element: ${element?.foodName}`);
      console.log({ food });

      let typeData = null;

      if (element?.type) {
        const [type, price, typeid] = element?.type?.split(" - ");
        console.log({ typeid, typeData: food?.types });
        typeData = food?.types?.filter(
          (pd) => pd?._id?.toString() === typeid
        )?.[0];
      }

      let foodObj = {
        id: food?._id,

        pic: food?.image,
        foodName: food?.name,
        type: element?.type ? typeData?.Type : "Regular",
        foodPrice: element?.type
          ? Number(typeData?.TypeOfferPrice)
          : Number(food?.discountPrice),

        originalPrice: element?.type
          ? Number(typeData?.TypePrice)
          : Number(food?.price),

        foodQuantity: Number(element?.foodQuantity),
        instruction: element?.instruction,
      };

      amount = amount + foodObj?.foodPrice * foodObj?.foodQuantity;

      if (element?.instruction) {
        instruction[food?._id] = element?.instruction;
      }
      processedFood.push(foodObj);
    }

    let user = await FindUser(`+91${formData.mobileNumber}`);
    if (!user) {
      user = await CreateUser(formData);
    }
    user_id = user?._id;
    if (!amount) {
      return res
        .status(500)
        .send("Something went wrong while creating call order");
    } else {
      prices = await calculatedExtraCharges({
        amount,
        type: formData?.deliveryStatus,
        distance: formData?.distance,
      });
      console.log({ prices });
      const result = await Order.create({
        ...formData,
        orderType: ORDERTYPE,
        orderedFood: processedFood,
        user: user?._id,
        BromagUserID: user?.userID ? user?.userID : null,
        types: [],

        billAmount: amount,
        grandTotal: prices?.total,
        gst: prices?.gst,
        deliveryCharge: prices?.delivery,
        transactionCharge: prices?.transactionPrice,
        packingCharge: prices?.packingPrice,
        callForOrderInstrcution: [instruction],
        payment_mode: "",
        status: "Order received",
      });
      return res.status(200).send({ data: result });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send("Something went wrong while creating call order");
  } finally {
    sendNotifications({
      title: "Call order",
      body: "Your order is created",
      user_id,
      url: "/profile-call-for-order",
    });
  }
};

const getCallOrder = async (req, res) => {
  try {
    const result = await Order.find({ orderType: "call" }).sort({
      createdAt: -1,
    });
    return res.status(200).send({ data: result });
  } catch (err) {
    return res
      .status(500)
      .send("Something went wrong while fetching call order");
  }
};

const getDeliveryCharges = async (req, res) => {
  try {
    const charges = await chargeModal.find();
    const footer = await footerModal.find();
    return res.status(200).send({ charges, footer });
  } catch (err) {
    return res
      .status(500)
      .send("Something went wrong while fetching call order");
  }
};
const updateCallOrder1 = async (req, res) => {
  const { id } = req.params;
  try {
    console.log(req.body, "body");
    if (req.body?.types && req.body.types.length > 0) {
      // get all without type food
      console.log("hyy");
      const foodWithoutType = req.body.orderedFood.filter(
        (item) => !item.hasOwnProperty("type")
      );

      // get all with type food
      const foodWithType = req.body?.orderedFood.filter((item) =>
        item.hasOwnProperty("type")
      );

      // find all without type food from db
      const products = await productModal.find({
        name: { $in: foodWithoutType.map((item) => item.food) },
      });

      // calculating each product total price
      const calculatedPrices = products.map((product) => {
        const requestItem = foodWithoutType.find(
          (item) => item.food === product.name
        );
        const quantity = parseInt(requestItem.quantity, 10);
        const totalPrice = quantity * product.price;
        return {
          food: product.name,
          quantity: quantity,
          totalPrice: totalPrice,
        };
      });

      // get grand total by product.
      const totalAmount = calculatedPrices.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );

      const { _id } = await User.findOne({
        phoneNumber: `+91${req.body.mobileNumber}`,
      });

      const typesData = req.body.types.map((type) => ({
        type: type.type,
        price: type.price,
      }));

      const foodItemCosts = foodWithType.map(
        (item) => item?.quantity * item.type
      );
      const totalFoodCost = foodItemCosts?.reduce((acc, cost) => acc + cost, 0);

      if (totalAmount && totalFoodCost) {
        const grandTotal = Math.round(totalAmount + totalFoodCost);
        const result = await Order.findByIdAndUpdate(
          { _id: id, orderType: "call" },
          {
            ...req.body,
            types: typesData,
            grandTotal: grandTotal,
          },
          { new: true }
        );
        return res.status(200).send({ data: result });
      } else if (totalAmount) {
        const grandTotal = Math.round(totalAmount);
        const result = await Order.findByIdAndUpdate(
          { _id: id, orderType: "call" },
          {
            ...req.body,
            types: typesData,
            grandTotal: grandTotal,
          },
          { new: true }
        );
        return res.status(200).send({ data: result });
      } else {
        const grandTotal = Math.round(totalFoodCost);
        const result = await Order.findByIdAndUpdate(
          { _id: id, orderType: "call" },
          {
            ...req.body,
            types: typesData,
            grandTotal: grandTotal,
          },
          { new: true }
        );
        return res.status(200).send({ data: result });
      }
    } else {
      delete req.body.types;
      const result = await Order.findByIdAndUpdate(
        { _id: id, orderType: "call" },
        { ...req.body },
        { new: true }
      );
      return res.status(200).send({ data: result });
    }
  } catch (e) {
    return res
      .status(500)
      .send("Something went wrong while updating call order");
  }
};

const updateCallOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const ORDERTYPE = "call";
    const formData = req.body;
    if (
      Object.keys(req.body)?.length == 1 &&
      Object.keys(req.body)?.includes("inventory")
    ) {
      const result = await Order.findByIdAndUpdate(
        { _id: id, orderType: ORDERTYPE },
        {
          ...formData,

          // status: "Order received",
        },
        { new: true }
      );
      return res.status(200).send({ data: result });
    }

    const orderedFoodArray = formData?.orderedFood;
    console.log(orderedFoodArray);

    const products = await productModal.find({
      name: { $in: orderedFoodArray?.map((item) => item?.foodName) },
    });

    const processedFood = [];

    const instruction = {};
    let amount = 0;
    let prices = null;

    for (const element of orderedFoodArray) {
      let food = products.filter(
        (td, i) => td?.name === element?.foodName
      )?.[0];
      console.log(`Processed element: ${element?.foodName}`);

      let typeData = null;

      if (element?.type && element?.type !== "Regular") {
        const [type, price, typeid] = element?.type?.split(" - ");
        let typedata = type;
        console.log({ typeid, typeData: food?.types });
        typeData = food?.types?.filter(
          (pd) => pd?.Type?.toLowerCase() === typedata?.toLowerCase()
        )?.[0];
      }

      let foodObj = {
        id: food?._id,

        pic: food?.image,
        foodName: food?.name,
        type:
          element?.type && element?.type !== "Regular"
            ? typeData?.Type
            : "Regular",
        foodPrice:
          element?.type && element?.type !== "Regular"
            ? Number(typeData?.TypeOfferPrice)
            : Number(food?.discountPrice),

        originalPrice:
          element?.type && element?.type !== "Regular"
            ? Number(typeData?.TypePrice)
            : Number(food?.price),

        foodQuantity: Number(element?.foodQuantity),
        instruction: element?.instruction,
      };

      console.log({ foodObj });

      amount = amount + foodObj?.foodPrice * foodObj?.foodQuantity;

      if (element?.instruction) {
        instruction[food?._id] = element?.instruction;
      }
      processedFood.push(foodObj);
    }

    let user = await FindUser(`+91${formData.mobileNumber}`);
    if (!user) {
      user = await CreateUser(formData);
    }

    console.log({ amount });
    if (!amount) {
      return res
        .status(500)
        .send("Something went wrong while creating call order");
    } else {
      prices = await calculatedExtraCharges({
        amount,
        type: formData?.deliveryStatus,
        distance: formData?.distance,
      });
      console.log(prices, formData);
      const result = await Order.findByIdAndUpdate(
        { _id: id, orderType: ORDERTYPE },
        {
          ...formData,
          orderedFood: processedFood,
          user: user?._id,
          BromagUserID: user?.userID ? user?.userID : null,
          types: [],

          billAmount: amount,
          grandTotal: prices?.total,
          gst: prices?.gst,
          deliveryCharge: prices?.delivery,
          transactionCharge: prices?.transactionPrice,
          packingCharge: prices?.packingPrice,
          callForOrderInstrcution: [instruction],
          payment_mode: "",
          // status: "Order received",
        },
        { new: true }
      );
      return res.status(200).send({ data: result });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send("Something went wrong while creating call order");
  }
};

const updateCallOrderStatus = async (req, res) => {
  const { status } = req.body;
  let user_id = null;
  let success = false;
  try {
    const { id } = req.params;

    const ORDERTYPE = "call";

    const result = await Order.findByIdAndUpdate(
      { _id: id, orderType: ORDERTYPE },
      {
        ...req?.body,
      },
      { new: true }
    );
    user_id = result?.user;
    console.log({ user_id });
    const io = req.app.get("socketio");

    io.emit("demo", {
      id: Math.random(1000, 1000000),
      order: "Call Order",
      status: status
        ? status
        : req?.body?.timePicked
        ? "Order preparation started"
        : "Order status updated",
    });
    success = true;
    return res.status(200).send({ data: result });
  } catch (err) {
    console.log(err);
    success = false;
    return res
      .status(500)
      .send("Something went wrong while creating call order");
  } finally {
    if (success) {
      sendNotifications({
        title: "Call order",
        body: status
          ? status
          : req?.body?.timePicked
          ? "Order preparation started"
          : "Order status updated",
        user_id,
        url: "/profile-call-for-order",
      });
    }
  }
};

const cancelMyCallOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_type } = req.body;

    if (order_type === "callfororder") {
      await Order.findByIdAndUpdate({ _id: id }, { status: "Cancelled" });
    } else {
      await Order.findByIdAndUpdate({ _id: id }, { status: "Cancelled" });
    }

    const io = req.app.get("socketio");

    io.emit("demo", {
      id: Math.random(1000, 1000000),
      order: order_type === "callfororder" ? "Call Order" : "Take Away",
      status: "Cancelled",
    });
    return res.status(200).send({ message: "success" });
  } catch (err) {
    return res.status(500).send({ message: "Something went wrong" });
  }
};

const getMyCallForOrder = async (req, res) => {
  try {
    let user_contact = _.get(req, "body.userDetails.phoneNumber", "").slice(
      3,
      14
    );
    const result = await Order.find({
      mobileNumber: user_contact,
      orderType: "call",
    }).sort({ createdAt: -1 });

    return res.status(200).send({ data: result });
  } catch (err) {
    return res
      .status(500)
      .send("Something went wrong while fetching call order");
  }
};

module.exports = {
  createCallOrder,
  getCallOrder,
  updateCallOrder,
  getMyCallForOrder,
  getDeliveryCharges,
  cancelMyCallOrder,
  updateCallOrderStatus,
};
