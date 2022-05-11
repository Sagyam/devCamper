const express = require("express");

const courseRouter = require("../routes/courses");

const advancedResult = require("../middlewares/advanceResults");
const { protect, authorize } = require("../middlewares/auth");

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

const router = express.Router();

//Reroute into other resource router
router.use("/:bootcampId/courses", courseRouter);

router
	.route("/")
	.get(advancedResult(Bootcamp, "courses"), getBootcamps)
	.post(protect, authorize("publisher", "admin"), createBootcamp);

router
	.route("/:id")
	.get(getBootcamp)
	.put(protect, authorize("publisher", "admin"), updateBootcamp)
	.delete(protect, authorize("publisher", "admin"), deleteBootcamps);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router
	.route("/:id/photo")
	.put(protect, authorize("publisher", "admin"), bootcampPhotoUpload);

module.exports = router;
