let express = require('express');
let router = express.Router();
let crypto = require('crypto');
let config = require('../../config/config');
let Category = require('../../models/category');
let Job = require('../../models/job');

router.get('/', (req, res) => {
	let echostr, nonce, signature, timestamp;
	signature = req.query.signature.toString();
	timestamp = req.query.timestamp.toString();
	nonce = req.query.nonce.toString();
	echostr = req.query.echostr.toString();
	if (checkToken(timestamp, nonce, signature, config.wechat.token.toString())) {
		console.log("比对成功");
		return res.send(echostr);
	} else {
		console.log('比对失败');
		return res.end();
	}
});

router.get('/job/categories', (req, res) => {
	Category.find({})
		.exec((err, categories) => {
			return res.json({
				success:1,
				data: categories
			});
		})
});

router.get('/job', (req, res) => {
	Job.find({})
		.populate('worksite', "addr")
		.exec((err, jobs) => {
		if (err) {
			return res.json({
				success: 0,
				data:{}
			})
		}
		return res.json({
			success: 1,
			data: jobs
		})
	})
});

// 根据类别ID查找该类别下的
router.get('/job/category', (req, res) => {
	let categoryId = req.query.categoryId;
	Job.find({categoryId: categoryId})
		.exec((err, jobs) => {
			if (err) {
				return res.json({
					success:0,
					data: {}
				})
			}
			return res.json({
				success: 1,
				data: jobs
			})
		})
});

function checkToken(timestamp, nonce, signature, token) {
	let currSign, tmp;
	tmp = [token, timestamp, nonce];
	tmp.sort();
	let shasum = crypto.createHash('sha1');
	shasum.update(tmp.join('').toString());
	currSign = shasum.digest("hex");
	console.log(currSign);
	console.log(signature);
	return currSign == signature;
}

module.exports = router;
