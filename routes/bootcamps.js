const express = require("express");
const { route } = require("express/lib/application");

const {
	getBootcamps,
	getBootcamp,
	createBootcamp,
	updateBootcamp,
	deleteBootcamps,
	getBootcampsInRadius,
} = require("../controllers/bootcamps");

const router = express.Router();

router.route("/").get(getBootcamps).post(createBootcamp);
router
	.route("/:id")
	.get(getBootcamp)
	.put(updateBootcamp)
	.delete(deleteBootcamps);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

module.exports = router;
