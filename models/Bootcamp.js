const mongoose = require("mongoose");

let urlExpression =
	/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

let emailExpression = /\S+@\S+\.\S+/;

const BootcanmpSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please add a name"],
		unique: true,
		trim: true,
		maxlength: [50, "Name can not be more than 50 characters"],
	},
	slug: String,
	description: {
		type: String,
		required: [true, "Please add a description"],
		maxlength: [500, "Description can not be more than 500 characters"],
	},
	website: {
		type: String,
		match: [urlExpression, "Please enter a valid URL with HTTP or HTTPS"],
	},
	email: {
		type: String,
		match: [emailExpression, "Please enter a valid email"],
	},
	address: {
		type: String,
		required: [true, "Please add an address"],
	},
	location: {
		// GeoJSON Point
		type: {
			type: String,
			enum: ["Point"],
			required: false,
		},
		coordinates: {
			type: [Number],
			required: false,
			indexedd: "2dsphere",
		},
		formattedAddress: String,
		street: String,
		city: String,
		state: String,
		zipcode: String,
		country: String,
	},
	careers: {
		// Array of strings
		type: [String],
		required: true,
		enum: [
			"Web Development",
			"Mobile Development",
			"UI/UX",
			"Data Science",
			"Business",
			"Other",
		],
	},
	averageRating: {
		type: Number,
		min: [1, "Rating must be at least 1"],
		max: [5, "Rating can not be more than 5"],
	},
	averageCost: Number,
	photo: {
		type: String,
		default: "default.jpg",
	},
	housing: {
		type: Boolean,
		default: false,
	},
	jobAssistance: {
		type: Boolean,
		default: false,
	},
	jobGuarantee: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("Bootcamp", BootcanmpSchema);
