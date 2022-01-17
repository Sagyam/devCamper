const mongoose = require("mongoose");
const slugify = require("slugify");
const geoCoder = require("../utils/geoCoder");

let urlExpression =
	/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

let emailExpression = /\S+@\S+\.\S+/;

const BootcanmpSchema = new mongoose.Schema(
	{
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
			},
			coordinates: {
				type: [Number],
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
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

//create bootcampt slug
BootcanmpSchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

//Geocoe and create bootcamp location
BootcanmpSchema.pre("save", async function (next) {
	const loc = await geoCoder.geocode(this.address);
	this.location = {
		type: "Point",
		coordinates: [loc[0].longitude, loc[0].latitude],
		formattedAddress: loc[0].formattedAddress,
		street: loc[0].streetName,
		city: loc[0].city,
		state: loc[0].stateCode,
		zipcode: loc[0].zipcode,
		country: loc[0].countryCode,
	};

	//don't save address in DB
	this.address = undefined;
});

//Cascade delete courses when bootcamp is deleted
BootcanmpSchema.pre("remove", async function (next) {
	await this.model("Course").deleteMany({ bootcamp: this._id });
	console.log(`Courses deleted ${this.name}`);
	next();
});

//Reverse populate with  virtuals
BootcanmpSchema.virtual("courses", {
	ref: "Course",
	localField: "_id",
	foreignField: "bootcamp",
	justOne: false,
});

module.exports = mongoose.model("Bootcamp", BootcanmpSchema);
