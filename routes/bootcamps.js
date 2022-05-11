const express = require("express");
const advancedResult = require("../middlewares/advanceResults");
const protect = require("../middlewares/auth");
const Bootcamp = require("../models/Bootcamp");
const {
	getBootcamps,
	getBootcamp,
	createBootcamp,
	updateBootcamp,
	deleteBootcamps,
	getBootcampsInRadius,
	bootcampPhotoUpload,
} = require("../controllers/bootcamps");

//Include other resource router
const courseRouter = require("../routes/courses");
const router = express.Router();

//Reroute into other resource router
router.use("/:bootcampId/courses", courseRouter);

router
	.route("/")
	.get(advancedResult(Bootcamp, "courses"), getBootcamps)
	.post(protect, createBootcamp);

router
	.route("/:id")
	.get(getBootcamp)
	.put(protect, updateBootcamp)
	.delete(protect, deleteBootcamps);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router.route("/:id/photo").put(protect, bootcampPhotoUpload);

module.exports = router;
