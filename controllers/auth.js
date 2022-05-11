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
	sendTokenResponse(user, 201, res);
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
	sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
	const token = user.getSignedJwtToken();

	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};
	if (process.env.NODE_ENV === "production") {
		options.secure = true;
	}

	res.status(statusCode).cookie("token", token, options).json({
		success: true,
		token,
	});
};

// @desc      Get current logged in user
// @route     GET /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
	console.log(req.user);
	const user = await User.findById(req.user.id);
	res.status(200).json({
		success: true,
		data: user,
	});
});
