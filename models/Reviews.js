const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema({
	title: {
		type: String,
		required: [true, "Title is required"],
		trim: true,
		maxlength: [100, "Title must be less than 100 characters"],
		minlength: [5, "Title must be more than 5 characters"],
	},
	text: {
		type: String,
		required: [true, "Text is required"],
		trim: true,
		maxlength: [1000, "Text must be less than 1000 characters"],
		minlength: [10, "Text must be more than 10 characters"],
	},
	rating: {
		type: Number,
		required: [true, "Rating is required"],
		min: [1, "Rating must be more than 1"],
		max: [5, "Rating must be less than 5"],
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: [true, "User is required"],
	},
	bootcamp: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Bootcamp",
		required: [true, "Bootcamp is required"],
	},
});

//Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

//Calculate average rating
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
	const obj = await this.aggregate([
		{
			$match: { bootcamp: bootcampId },
		},
		{
			$group: {
				_id: "$bootcamp",
				averageRating: { $avg: "$rating" },
			},
		},
	]);
	try {
		await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
			// limit precision to 2 decimal places
			averageRating: parseFloat(obj[0].averageRating.toFixed(2)),
		});
	} catch (err) {
		console.log(err);
	}
};

//Call getAverageRating after save
ReviewSchema.post("save", function () {
	this.constructor.getAverageRating(this.bootcamp);
});

//Call getAverageRating after remove
ReviewSchema.post("remove", function () {
	this.constructor.getAverageRating(this.bootcamp);
});

//Call getAverageRating after update
ReviewSchema.post("update", function () {
	this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model("Review", ReviewSchema);
