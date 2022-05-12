const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const {
	register,
	login,
	getMe,
	forgotPassword,
	resetPassword,
	updateDetails,
	updatePassword,
} = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.patch("/update-details", protect, updateDetails);
router.patch("/update-password", protect, updatePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:token", resetPassword);
module.exports = router;
