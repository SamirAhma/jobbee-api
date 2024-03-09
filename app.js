const express = require("express");
const app = express();
const dotenv = require("dotenv");

const connectDatabase = require("./config/database");
const errorMiddleware = require("./middlewares/errors");
const ErrorHandler = require("./utils/errorHandler");
// Setting up config.env file variables
dotenv.config({ path: "./config/config.env" });

// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.message}`);
  console.log("Shutting down due to uncaught exception.");
  process.exit(1);
});

//Connecting to database
connectDatabase();

//setup body parser
app.use(express.json());

//Importing all routes
const jobs = require("./routes/jobs");
app.use("/api/v1", jobs);
//
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

//Middleware to handel errors
app.use(errorMiddleware);
const PORT = process.env.PORT;
console.log(process.env.NODE_ENV);
const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT} in ${process.env.NODE_ENV}`);
});

//Handling Unhandled Promise Rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to unhandled promise rejection");

  server.close(() => {
    process.exit(1);
  });
});
