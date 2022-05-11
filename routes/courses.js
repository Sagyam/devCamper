const express = require("express");
const Course = require("../models/Course");
const advancedResults = require("../middlewares/advanceResults");
const {
	getCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
} = require("../controllers/courses");
const protect = require("../middlewares/auth");

const router = express.Router({ mergeParams: true });

router
	.route("/")
	.get(
		advancedResults(Course, {
			path: "bootcamp",
			select: "name description",
		}),
		getCourses
	)
	.post(protect, createCourse);
router
	.route("/:id")
	.get(getCourse)
	.put(protect, updateCourse)
	.delete(protect, deleteCourse);

module.exports = router;
