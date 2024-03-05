const express = require("express");

const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
require("dotenv").config();
const adminrouter = require("./routes/adminUserRoute");
const categoryRouter = require("./routes/categoryRoute");
const subCategoryRoute = require("./routes/subCategoryRoute");
const productRoute = require("./routes/productRoute");
const bannerRoute = require("./routes/bannerRoute");
const videoRoute = require("./routes/videoRoute");
const feedbackRoute = require("./routes/feedbackRoute");
const inventoryRoute = require("./routes/inventoryRoute");
const walletRoute = require("./routes/walletRoute");
const tableRoute = require("./routes/tableRoute");
const user = require("./routes/userRoute");
const tableBooking = require("./routes/tableBookingRoute");
const walletBalance = require("./routes/walletBalanceRoute");
const onlineOrder = require("./routes/onlineOrderRoute");
const dinningOrder = require("./routes/dinnningRoute");
const callForOrder = require("./routes/callForOrder");
const takeAway = require("./routes/takeAwayRoute");
const cartRoutes = require("./routes/cart.routes.js");
const deliveryRoutes = require("./routes/delivery.routes.js");
const notificationRoutes = require("./routes/notificationRoute.js");
const profileRoutes = require("./routes/profile.routes.js");
const scratchRoute = require("./routes/scratchRoute.js");
const deliverManUsers = require("./routes/deliveryManUserRoute.js");
const deliverManProfile = require("./routes/deliveryManProfile.route.js");
const deliverManOrder = require("./routes/deliveryManOrder.route.js");
const riderVehicelRoute = require("./routes/ridervehicleDetails.route.js");
const uploadRoute = require("./routes/upload.routes.js");
const deliveryManOrderStatusRoute = require("./routes/deliveryManOrderStatus.route.js");
const footerRoute = require("./routes/footer.route.js");
const couponRoute = require("./routes/couponRoute.js");
const socialMediaSettings = require("./routes/socialMediaSettings.js");
const restaurantStatusRoute = require("./routes/restaurantStatusRoute.js");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cron = require("./utils/cron.js");

const constants = require("./utils/constants.js");
const admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");
const router = express.Router();
const axios = require("axios");
const FireBaseAdmin = require("./utils/firebase.js");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(cors());
app.set("socketio", io);

app.use(cookieParser());
// app.use(morgan("dev"));
app.use(morgan("tiny"));

app.use("/", adminrouter);
app.use("/", profileRoutes);
app.use("/", deliveryRoutes);
app.use("/", cartRoutes);
app.use("/", categoryRouter);
app.use("/", couponRoute);
app.use("/", subCategoryRoute);
app.use("/", productRoute);
app.use("/", bannerRoute);
app.use("/", uploadRoute);
app.use("/", videoRoute);
app.use("/", feedbackRoute);
app.use("/", inventoryRoute);
app.use("/", user);
app.use("/", walletRoute);
app.use("/", tableRoute);
app.use("/", tableBooking);
app.use("/", walletBalance);
app.use("/", onlineOrder);
app.use("/", dinningOrder);
app.use("/", callForOrder);
app.use("/", takeAway);
app.use("/", notificationRoutes);
app.use("/", scratchRoute);
app.use("/", deliverManUsers);
app.use("/", deliverManProfile);
app.use("/", deliverManOrder);
app.use("/", riderVehicelRoute);
app.use("/", deliveryManOrderStatusRoute);
app.use("/", restaurantStatusRoute);
app.use("/", footerRoute);
app.use("/", socialMediaSettings);
app.use("/delivery-boy", require("./routes/delivery-boy.routes.js"));

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("A user connected", socket?.id);

  // Handle specific code on connection
  socket.emit("message", "Hello, you are connected!");

  // Handle custom event from the client
  socket.on("customEvent", (data) => {
    console.log("Received custom event:", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket?.id);
  });
});

app.get("/demo", (req, res) => {
  const io = req.app.get("socketio");

  io.emit("demo", { order: "Test Order", status: "Order Received" });

  return res.send("success");
});

app.get("/fire", (req, res) => {
  const registrationTokens = [
    "eRTv_Cs0XpQ3cs9rvVFrw6:APA91bGVJ-E6Wc719C5kA0uAcslSqVClMchCD6-Z-ew98HqLSe1YTIxKo9CCIjgJqUFi8AL3jx71TQMq65jIrnJnIlKFEaE79FVFK5ab7eRfKwUTW8TQ5avwT6HuDGpdpUu7QNW94w-n",
    "cYlKyTYg36-FLDXgr9fdiZ:APA91bFMcA9BRz-Yy-mdlQp3lHfuXT9OiJZz4z1AoByFKhnba9u53wyFDzWo8x2JznEEkQ97WGFj-P4ZtpE1pGdnDnHq2EivrHgit8G4xJgq45bHebLCouKk-83hTGtgnNN2M4o7DOIg",
  ];

  const message = {
    data: { title: "Test data", body: "Order Accespted" },
    tokens: registrationTokens,
  };

  getMessaging()
    .sendEachForMulticast(message)
    .then((response) => {
      console.log({ response });
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx]);
          }
        });
        console.log("List of tokens that caused failures: " + failedTokens);
      }
    })
    .catch((err) => {
      console.log({ err });
    });

  return res.send("success");
});
// Handle undefined routes
app.all("*", (req, res) => {
  return res.status(405).json({ message: "route not implemented" });
});
const PORT = process.env.PORT;
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("Database connected !!!");
    server.listen(PORT, () => {
      console.log(`App is lisening on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err, "error");
  });

cron; // initializing cron

// admin.initializeApp({
//   credential: admin.credential.cert(firebaseAccount),
// });
constants.admin = admin;
