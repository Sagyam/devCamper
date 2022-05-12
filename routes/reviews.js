const express = require("express");
const {
	getReviews,
	getReview,
	createReview,
	updateReview,
	deleteReview,
} = require("../controllers/reviews");
const { protect, authorize } = require("../middlewares/auth");
const advanceResult = require("../middlewares/advanceResults");
const Review = require("../models/Reviews");

const router = express.Router({ mergeParams: true });

router
	.route("/")
	.get(
		advanceResult(Review, {
			path: "bootcamp",
			select: "name description",
		}),
		getReviews
	)
	.post(protect, authorize("user", "admin"), createReview);

router
	.route("/:id")
	.get(getReview)
	.patch(protect, authorize("user", "admin"), updateReview)
	.delete(protect, authorize("user", "admin"), deleteReview);

module.exports = router;
