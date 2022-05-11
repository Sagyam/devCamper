const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const colours = require("colors");
const errorHandler = require("./middlewares/error");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const path = require("path");

//Load env vars
dotenv.config({ path: "./config/config.env" });

//Route files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");

//Connect to database
connectDB();

const app = express();

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Mount router
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);

//File upload
app.use(fileUpload());
//Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

//Dev logging middleware
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

const server = app.listen(
	PORT,
	console.log(
		`Server running in ${process.env.NODE_ENV} on ${PORT}`.blue.underline
	)
);

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
	console.log(`Error: ${err.message}.`.red.bold);
	//Close server & exit process
	server.close(() => process.exit(1));
});
