const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const geoCoder = require("../utils/geoCoder");
const Bootcamp = require("../models/Bootcamp");

//@desc     Get all bootcamps
//@route    GET /api/v1/bootcamps
//@access   Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	let reqQuery = { ...req.query };

	//copy req.query
	let queryString = JSON.stringify(reqQuery);

	//fields to exclude
	const removeFields = ["select", "sort", "limit", "page"];
	removeFields.forEach((field) => delete reqQuery[field]);

	//replacing the operators with $
	queryString = queryString.replace(
		/\b(gte|gt|lte|lt)\b/g,
		(match) => `$${match}`
	);

	//find the bootcamps
	let query = Bootcamp.find(JSON.parse(queryString));

	//select fields
	if (req.query.select) {
		const fields = req.query.select.split(",").join(" ");
		query = query.select(fields);
	}

	//sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(",").join(" ");
		query = query.sort(sortBy);
	} else {
		query = query.sort("-createdAt");
	}

	//pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 1;
	const startIndex = (page - 1) * limit;

	query = query.skip(startIndex).limit(limit);

	//execute  query
	const bootcamps = await query;

	//pagination result
	pagination = {};
	const endIndex = page * limit;
	const total = await Bootcamp.countDocuments();
	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit: limit,
		};
	}
	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit: limit,
		};
	}

	res.status(200).json({
		success: true,
		count: bootcamps.length,
		data: bootcamps,
		pagination,
	});
});

//@desc     Get single bootcamp
//@route    GET /api/v1/bootcamps:id
//@access   Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);
	}
	res.status(200).json({
		success: true,
		data: bootcamp,
	});
});

//@desc     Create new bootcamp
//@route    POST /api/v1/bootcamps
//@access   Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.create(req.body);
	res.status(200).json({
		success: true,
		data: bootcamp,
	});
});

//@desc     Update bootcamp
//@route    PUT /api/v1/bootcamps:id
//@access   Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});
	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);
	} else {
		res.status(200).json({
			success: true,
			data: bootcamp,
		});
	}
});

//@desc     Delete bootcamp
//@route    DELETE /api/v1/bootcamps:id
//@access   Private
exports.deleteBootcamps = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);
	} else {
		res.status(200).json({
			success: true,
			message: "Deleted successfully",
		});
	}
});

//@desc     Get bootcamp within a radius
//@route    GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access   Public
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params;

	//Get the lat and lng from geocoder
	const loc = await geoCoder.geocode(zipcode);
	const lat = loc[0].latitude;
	const lng = loc[0].longitude;

	//Calc radius using radians
	//Divide dist by radius of earth 6.371 km
	const radius = distance / 6738.1;
	const bootcamps = await Bootcamp.find({
		location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
	});
	res.status(200).json({
		success: true,
		count: bootcamps.length,
		data: bootcamps,
	});
});
