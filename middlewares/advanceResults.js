const advanceResult = (model, populate) => async (req, res, next) => {
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

	//find the resources
	let query = model.find(JSON.parse(queryString));

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
	const limit = parseInt(req.query.limit, 10) || 25;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await model.countDocuments();

	query = query.skip(startIndex).limit(limit);

	//populate
	if (populate) {
		query = query.populate(populate);
	}

	//execute  query
	const results = await query;

	//pagination result
	pagination = {};

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
	res.advanceResults = {
		success: true,
		count: results.length,
		data: results,
		pagination,
	};
	next();
};

module.exports = advanceResult;
