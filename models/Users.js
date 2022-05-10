const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please add a name"],
		trim: true,
	},
	email: {
		type: String,
		required: [true, "Please add an email"],
		trim: true,
		match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
			"Please add a valid email",
		],
	},
	password: {
		type: String,
		required: [true, "Please add a password"],
		minlength: [4, "Password must be at least 4 characters"],
		select: false,
	},
	role: {
		type: String,
		enum: ["user", "publisher"],
		default: "user",
	},
	resetPasswordToken: String,
	resetPasswordExpire: Date,
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return token
UserSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (password) {
	return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
