const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [true, "Please add a course title"],
		maxlength: [100, "Course title must be less than 100 characters"],
	},
	description: {
		type: String,
		trim: true,
		required: [true, "Please add a description"],
		maxlength: [500, "Description must be less than 500 characters"],
	},
	weeks: {
		type: String,
		required: [true, "Please add number of weeks"],
	},
	tuition: {
		type: Number,
		required: [true, "Please add tution cost"],
	},
	minimumSkill: {
		type: String,
		required: [true, "Please add a minimum skill"],
		enum: ["beginner", "intermediate", "advanced"],
	},
	scholarshipAvailable: {
		type: Boolean,
		default: false,
	},
	creatatedAt: {
		type: Date,
		default: Date.now,
	},
	bootcamp: {
		type: mongoose.Schema.ObjectId,
		ref: "Bootcamp",
		required: true,
	},
});

module.exports = mongoose.model("Course", CourseSchema);
