const ErroResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const User = require("../models/Users");

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
	const { name, email, password, role } = req.body;
	const user = await User.create({
		name,
		email,
		password,
		role,
	});
	//create jwt token
	const token = user.getSignedJwtToken();
	res.status(201).json({
		success: true,
		token,
	});
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;
	//Validate email and password
	if (!email || !password) {
		return next(new ErroResponse("Please provide email and password", 400));
	}

	//Check for user
	const user = await User.findOne({ email }).select("+password");

	if (!user) {
		return next(new ErroResponse("User not found", 404));
	}
	//Check if password is correct
	const isMatch = await user.matchPassword(password);
	if (!isMatch) {
		return next(new ErroResponse("Invalid credentials", 401));
	}
	//Create JWT
	const token = user.getSignedJwtToken();
	res.status(200).json({
		success: true,
		token,
	});
});
