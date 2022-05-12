const ErroResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const User = require("../models/Users");
const sendMail = require("../utils/sendEmail");
const crypto = require("crypto");

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

// @desc      Get current logged in user
// @route     GET /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id);
	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(new ErroResponse("User not found", 404));
	}
	//Get reset token
	const resetToken = user.getResetPasswordToken();

	// Save token
	await user.save({ validateBeforeSave: false });

	//Create reset url
	const resetUrl = `${req.protocol}://${req.get(
		"host"
	)}/api/v1/auth/resetpassword/${resetToken}`;

	const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a POST request to: \n\n ${resetUrl}`;

	try {
		let mail = await sendMail({
			to: user.email,
			subject: "Password reset token",
			message,
		});

		res.status(200).json({
			success: true,
			message: "Token sent to your email",
		});
	} catch (err) {
		console.log(err);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;
		await user.save({ validateBeforeSave: false });
		return next(new ErroResponse("Email could not be sent", 500));
	}
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:token
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
	//Get hashed token
	const resetPasswordToken = crypto
		.createHash("sha256")
		.update(req.params.token)
		.digest("hex");

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});
	if (!user) {
		return next(new ErroResponse("Invalid token", 400));
	}
	//Set new password
	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;
	await user.save();

	res.status(200).json({
		success: true,
		data: "Password reset",
	});
});

// @desc      Update user details
// @route     Patch /api/v1/auth/updatedetails
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
	const fieldsToUpdate = {
		name: req.body.name,
		email: req.body.email,
	};

	const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
		new: true,
		runValidators: true,
	});
	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc      Update Password
// @route     PATCH /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
	//Check if passwrd was sent
	if (!req.body.currentPassword || !req.body.newPassword) {
		return next(
			new ErroResponse("Please provide current and new password", 400)
		);
	}

	const user = await User.findById(req.user.id).select("+password");
	//Check current password
	if (!(await user.matchPassword(req.body.currentPassword))) {
		return next(new ErroResponse("Password is incorrect", 401));
	}
	user.password = req.body.newPassword;
	await user.save();
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
