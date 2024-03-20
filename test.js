// Assuming you have an array of time slots like the one you provided
const moment = require("moment");
const timeSlots = [
  { time: "10:00 AM - 12:00 PM", _id: "65e932be75ca84fb7742ed37" },
  { time: "12:00 PM - 2:00 PM", _id: "65e932be75ca84fb7742ed38" },
  { time: "2:00 PM - 4:00 PM", _id: "65e932be75ca84fb7742ed39" },
  { time: "4:00 PM - 6:00 PM", _id: "65e932be75ca84fb7742ed3a" },
  { time: "6:00 PM - 8:00 PM", _id: "65e932be75ca84fb7742ed3b" },
  { time: "8:00 PM - 10:00 PM", _id: "65e932be75ca84fb7742ed3c" },
  { time: "10:00 PM - 12:00 AM", _id: "65e932be75ca84fb7742ed3d" },
  { time: "12:00 AM - 1:00 AM", _id: "65e932be75ca84fb7742ed3d" },
];

// Get the current time
const currentTime = moment().set({
  hour: 20,
  minute: 30,
  second: 0,
  millisecond: 0,
});
console.log({ currentTime });
// Filter the time slots after the current time
const futureTimeSlots = timeSlots.filter((slot) => {
  const startTime = slot.time.split(" - ")[0];
  const [time, meridian] = startTime.split(" ");
  const val = time.split(":")[0];

  const cmeridian = startTime.split(" ")[0];

  // Define 10:00 AM as another moment object
  var targetTime = moment().set({
    hour:
      meridian === "AM"
        ? Number(val)
        : Number(val) === 12
        ? Number(val)
        : 12 + Number(val),
    minute: 0,
    second: 0,
    millisecond: 0,
  });
  // console.log({
  //   startTime,
  //   currentTime,
  //   time,
  //   meridian,
  //   val,

  //   cmeridian,
  //   targetTime,
  // });
  // Compare the two moments
  if (currentTime.isBefore(targetTime)) {
    console.log({
      current: moment(currentTime).format("HH:mm a"),
      target: moment(targetTime).format("HH:mm a"),
      slot,
      check: currentTime.isBefore(targetTime),
      hour:
        meridian === "AM"
          ? Number(val)
          : Number(val) === 12
          ? Number(val)
          : 12 + Number(val),
    });
    return slot;
    console.log("The current time is before 10:00 AM.");
  } else {
    // console.log(
    //   "The current time is after ",
    //   moment(currentTime).format("HH:mm a")
    // );
  }
});

// Create a moment object for today's date
const today = moment();

// Create another moment object for the date you want to check
const formattedBookingDate = new Date("2024-05-20");
const dateToCheck = moment("2024-05-20"); // Replace '2024-03-20' with the date you want to check

// Check if the date to check is the same as today
if (formattedBookingDate.isSame(today, "day")) {
  console.log("The date is today!");
} else {
  console.log("The date is not today.");
}

console.log(futureTimeSlots);
