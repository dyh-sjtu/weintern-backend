let express = require('express');
let router = express.Router();
let Category = require('../../models/category');

router.get('/api/categories', function *(next){
	let categories = yield Category
		.find({})
		.populate("jobs", "jobname company")
		.exec();
	this.body = {
		success: 1,
		data: categories
	};
	console.log(this.body);
});

module.exports = router;
