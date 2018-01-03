let express = require('express');
let router = express.Router({

});
let Category = require('../../models/category');

router.get('/job/categories', (req, res) => {
	Category.find({})
		.populate("jobs", "jobname company")
		.exec((err, categories) => {
			return res.json({
				success:1,
				data: categories
			});
		})
});

module.exports = router;
