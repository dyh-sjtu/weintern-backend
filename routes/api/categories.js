let express = require('express');
let router = express.Router();
let config = require('../../config/config');
let Category = require('../../models/category');

router.get('/', (req, res) => {
	let echostr, nonce, signature, timestamp;
	signature = req.query.signature;
	timestamp = req.query.timestamp;
	nonce = req.query.nonce;
	echostr = req.query.echostr;
	if (checkToken(timestamp, nonce, signature, config.wechat.token)) {
		return res.send(echostr);
	} else {
		return res.end();
	}
});

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

function checkToken(timestamp, nonce, signature, token) {
	let currSign, tmp;
	tmp = [token, timestamp, nonce].sort().join("");
	currSign = crypto.createHash("sha1").update(tmp).digest("hex");
	return currSign === signature;
}

module.exports = router;
