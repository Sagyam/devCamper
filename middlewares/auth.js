const jwt = require("jsonwebtoken");
const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/Users");

//Protect routes
const protect = asyncHandler(async (req, res, next) => {
	let token;
	//Get token from header
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}
	//Get token from cookie
	// if (!token) {
	//     token = req.cookies.token;
	// }

	//Check if token exists
	if (!token) {
		return next(new ErrorResponse("You are not logged in", 401));
	}

	//Verify token
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = await User.findById(decoded.id);
		next();
	} catch (err) {
		return next(new ErrorResponse("Invalid token", 401));
	}
});

module.exports = protect;
