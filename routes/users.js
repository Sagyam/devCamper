const express = require("express");
const User = require("../models/Users");
const {
	getUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
} = require("../controllers/users");
const advancedResults = require("../middlewares/advanceResults");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router({ mergeParams: true });

router.use(protect);
router.use(authorize("admin"));

router.route("/").get(advancedResults(User), getUsers).post(createUser);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
