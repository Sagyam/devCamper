const express = require("express");
const advancedResult = require("../middlewares/advanceResults");
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
	.post(createBootcamp);

router
	.route("/:id")
	.get(getBootcamp)
	.put(updateBootcamp)
	.delete(deleteBootcamps);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router.route("/:id/photo").put(bootcampPhotoUpload);

module.exports = router;
