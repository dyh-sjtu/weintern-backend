let express = require('express');
let router = express.Router();
let Category = require('../../models/category');

router.get('/api/categories', (req, res) => {
	Category.find({})
		.populate("jobs", "jobname company")
		.exec((err, categories) => {
			res.json(categories);
		})
});

module.exports = router;
